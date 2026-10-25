const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../src/models/User');
const Estimate = require('../src/models/Estimate');
const MeasurementUnit = require('../src/models/MeasurementUnit');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '1d' });
};

describe('Estimation Module Tests (Slab & Particular Estimates)', () => {
  let user1, user1Token;
  let user2, user2Token;

  beforeEach(async () => {
    // Re-create users for each test because afterEach purges all collections
    user1 = await User.create({
      name: 'Estimate Tester 1',
      mobile: '9222222201',
      email: 'est1@test.com',
      password: 'password123',
      role: 'manufacturer',
      status: 'active'
    });
    user1Token = generateToken(user1);

    user2 = await User.create({
      name: 'Estimate Tester 2',
      mobile: '9222222202',
      email: 'est2@test.com',
      password: 'password123',
      role: 'buyer',
      status: 'active'
    });
    user2Token = generateToken(user2);

    // Seed sample measurement units
    await MeasurementUnit.insertMany([
      { name: 'Centimetre', symbol: 'cm', unit_category: 'dimension', conversion_factor: 0.01 },
      { name: 'Inch', symbol: 'inch', unit_category: 'dimension', conversion_factor: 0.0254 },
      { name: 'Foot', symbol: 'feet', unit_category: 'dimension', conversion_factor: 0.3048 },
      { name: 'Square Feet', symbol: 'sqft', unit_category: 'area', conversion_factor: 0.092903 },
      { name: 'Square Metre', symbol: 'sqm', unit_category: 'area', conversion_factor: 1 }
    ]);
  });

  describe('1. Measurement Units Catalogue', () => {
    it('GET /api/v1/estimates/units returns active measurement units', async () => {
      const res = await request(app)
        .get('/api/v1/estimates/units')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('2. Slab Estimate Workflow', () => {
    it('POST /api/v1/estimates/slab creates estimate with accurate area and amount calculation', async () => {
      // 2 rows in inches, area in sqft:
      // Row 1: 120 x 60 inch = 10 x 5 ft = 50 sqft
      // Row 2: 72 x 36 inch = 6 x 3 ft = 18 sqft
      // Total area = 68 sqft. Rate = 50 / sqft. Total amount = 3400.
      const res = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          company_details_enabled: true,
          company_name: 'Royal Marble Processing Co.',
          company_mobile: '9876543210',
          party_name: 'Sharma Construction',
          party_contact: '9988776655',
          colour_quality: 'White Makrana Calacatta',
          vehicle_number: 'RJ-01-GA-1122',
          block_lot_number: 'LOT-904',
          measured_by: 'Kailash Inspector',
          measurement_unit: 'inch',
          area_unit: 'sqft',
          unit_price: 50,
          notes: 'Standard 18mm cut slabs',
          measurement_rows: [
            { length: 120, width: 60 },
            { length: 72, width: 36 }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference_number).toMatch(/^EST-SLAB-\d{4}-\d+/);
      expect(res.body.data.slab_details.measurement_rows.length).toBe(2);
      expect(res.body.data.slab_details.total_area).toBeCloseTo(68.0, 1);
      expect(res.body.data.total_amount).toBeCloseTo(3400.0, 1);
    });

    it('GET /api/v1/estimates/slab lists authenticated user slab estimates', async () => {
      await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Sharma Construction',
          measurement_rows: [{ length: 10, width: 10 }]
        });

      const res = await request(app)
        .get('/api/v1/estimates/slab?search=Sharma')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].party_name).toBe('Sharma Construction');
    });

    it('GET /api/v1/estimates/slab/:id retrieves single estimate with calculations', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Jaipur Heritage',
          vehicle_number: 'RJ-01-GA-1122',
          measurement_rows: [{ length: 10, width: 10 }]
        });

      const res = await request(app)
        .get(`/api/v1/estimates/slab/${created.body.data._id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slab_details.vehicle_number).toBe('RJ-01-GA-1122');
    });

    it('PUT /api/v1/estimates/slab/:id updates row dimensions and recalculates totals', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Client Edit Test',
          unit_price: 50,
          measurement_rows: [{ length: 10, width: 10 }]
        });

      const res = await request(app)
        .put(`/api/v1/estimates/slab/${created.body.data._id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          unit_price: 60,
          measurement_rows: [
            { length: 120, width: 60 } // 50 sqft * 60 = 3000
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.slab_details.total_area).toBeCloseTo(50.0, 1);
      expect(res.body.data.total_amount).toBeCloseTo(3000.0, 1);
    });

    it('GET /api/v1/estimates/slab/:id/pdf generates downloadable PDF stream', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'PDF Test Party',
          measurement_rows: [{ length: 120, width: 60 }]
        });

      const res = await request(app)
        .get(`/api/v1/estimates/slab/${created.body.data._id}/pdf`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('Enforces maximum row limit of 700 rows', async () => {
      const excessiveRows = Array.from({ length: 705 }, () => ({ length: 10, width: 10 }));
      const res = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Overloaded Client',
          measurement_rows: excessiveRows
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('700');
    });
  });

  describe('3. Particular Estimate Workflow & Payment Ledger', () => {
    it('POST /api/v1/estimates/particular creates itemized estimate with advance payment', async () => {
      // Item 1: 100 sqft @ ₹75 = 7500
      // Item 2: 20 pieces @ ₹250 = 5000
      // Subtotal = 12500
      // Advance Payment = 5000
      // Remaining Balance = 7500
      const res = await request(app)
        .post('/api/v1/estimates/particular')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          company_details_enabled: true,
          company_name: 'Royal Marble Processing Co.',
          party_name: 'Heritage Resort Projects',
          party_contact: '9123456789',
          party_address: 'Lake City Highway, Udaipur',
          items: [
            { particular_name: 'Green Marble Steps (Bullnosed)', quantity: 100, unit: 'sqft', unit_price: 75 },
            { particular_name: 'Decorative Stone Pillars', quantity: 20, unit: 'pieces', unit_price: 250 }
          ],
          initial_payment: {
            amount: 5000,
            payment_method: 'bank_transfer',
            transaction_reference: 'NEFT-883311',
            notes: '40% advance booking deposit'
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference_number).toMatch(/^EST-PART-\d{4}-\d+/);
      expect(res.body.data.total_amount).toBe(12500);
      expect(res.body.data.particular_details.total_paid).toBe(5000);
      expect(res.body.data.particular_details.remaining_balance).toBe(7500);
      expect(res.body.data.particular_details.payment_status).toBe('partially_paid');
      expect(res.body.data.particular_details.amount_in_words).toContain('Seven Thousand Five Hundred Rupees Only');
    });

    it('GET /api/v1/estimates/particular lists particular estimates', async () => {
      await request(app)
        .post('/api/v1/estimates/particular')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Heritage Resort Projects',
          items: [{ particular_name: 'Tile', quantity: 10, unit: 'sqft', unit_price: 100 }],
          initial_payment: { amount: 500 }
        });

      const res = await request(app)
        .get('/api/v1/estimates/particular?payment_status=partially_paid')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].party_name).toBe('Heritage Resort Projects');
    });

    it('POST /api/v1/estimates/particular/:id/payments adds subsequent payment and marks paid', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/particular')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Full Pay Client',
          items: [{ particular_name: 'Marble', quantity: 10, unit: 'sqft', unit_price: 100 }],
          initial_payment: { amount: 500 }
        });

      // Pay remaining 500
      const res = await request(app)
        .post(`/api/v1/estimates/particular/${created.body.data._id}/payments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          amount: 500,
          payment_method: 'upi',
          transaction_reference: 'UPI-994422',
          notes: 'Final settlement against dispatch'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.total_paid).toBe(1000);
      expect(res.body.data.remaining_balance).toBe(0);
      expect(res.body.data.payment_status).toBe('paid');
      expect(res.body.data.amount_in_words).toBe('Zero Only');
    });

    it('POST /api/v1/estimates/particular/:id/payments/:payment_id/reverse safely reverses a payment', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/particular')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'Reversal Test Party',
          items: [{ particular_name: 'Tile', quantity: 10, unit: 'sqft', unit_price: 100 }],
          initial_payment: { amount: 500 }
        });

      const addRes = await request(app)
        .post(`/api/v1/estimates/particular/${created.body.data._id}/payments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: 500 });

      const secondPayId = addRes.body.data.payments[1]._id;

      const res = await request(app)
        .post(`/api/v1/estimates/particular/${created.body.data._id}/payments/${secondPayId}/reverse`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total_paid).toBe(500);
      expect(res.body.data.remaining_balance).toBe(500);
      expect(res.body.data.payment_status).toBe('partially_paid');
      expect(res.body.data.amount_in_words).toContain('Five Hundred Rupees Only');
    });

    it('GET /api/v1/estimates/particular/:id/pdf generates invoice PDF with payment ledger', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/particular')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          party_name: 'PDF Client',
          items: [{ particular_name: 'Stone', quantity: 5, unit: 'sqft', unit_price: 200 }]
        });

      const res = await request(app)
        .get(`/api/v1/estimates/particular/${created.body.data._id}/pdf`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });
  });

  describe('4. Shared Estimate Operations & Status Transitions', () => {
    it('GET /api/v1/estimates lists both slab and particular estimates', async () => {
      await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ party_name: 'Slab Party', measurement_rows: [{ length: 10, width: 10 }] });

      await request(app)
        .post('/api/v1/estimates/particular')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ party_name: 'Part Party', items: [{ particular_name: 'Tile', quantity: 1, unit: 'pcs', unit_price: 100 }] });

      const res = await request(app)
        .get('/api/v1/estimates')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('POST /api/v1/estimates/:id/finalize finalizes the estimate status', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ party_name: 'Finalize Party', measurement_rows: [{ length: 10, width: 10 }] });

      const res = await request(app)
        .post(`/api/v1/estimates/${created.body.data._id}/finalize`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('finalized');
    });

    it('POST /api/v1/estimates/:id/cancel marks estimate as cancelled', async () => {
      const created = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ party_name: 'Cancel Party', measurement_rows: [{ length: 10, width: 10 }] });

      const res = await request(app)
        .post(`/api/v1/estimates/${created.body.data._id}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('5. Authorization & Security Checks', () => {
    let slabId;

    beforeEach(async () => {
      const created = await request(app)
        .post('/api/v1/estimates/slab')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ party_name: 'Private Party', measurement_rows: [{ length: 10, width: 10 }] });
      slabId = created.body.data._id;
    });

    it('Rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/v1/estimates');
      expect(res.status).toBe(401);
    });

    it('User 2 cannot access or view User 1 estimate (Ownership protection - 403)', async () => {
      const res = await request(app)
        .get(`/api/v1/estimates/slab/${slabId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('User 2 cannot update User 1 estimate (403)', async () => {
      const res = await request(app)
        .put(`/api/v1/estimates/slab/${slabId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ party_name: 'Malicious Update' });

      expect(res.status).toBe(403);
    });

    it('User 2 cannot delete User 1 estimate (403)', async () => {
      const res = await request(app)
        .delete(`/api/v1/estimates/slab/${slabId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('User 2 cannot download User 1 estimate PDF (403)', async () => {
      const res = await request(app)
        .get(`/api/v1/estimates/slab/${slabId}/pdf`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });
  });
});
