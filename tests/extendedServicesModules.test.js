const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const jwt = require('jsonwebtoken');

describe('Stone Market India - Additional 6 Business Types Comprehensive Suite', () => {
  let customerUser, customerToken;

  beforeEach(async () => {
    customerUser = await User.create({
      name: 'Ramesh Patel',
      mobile: '9829011122',
      email: 'ramesh.patel@client.com',
      password: 'password123',
      role: 'customer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  });

  // =========================================================================
  // 1. MACHINE REPAIRING MODULE
  // =========================================================================
  describe('1. Machine Repairing (Repair Service Management)', () => {
    let repairUser, repairToken, repairProfile, testRepairService;

    beforeEach(async () => {
      repairUser = await User.create({
        name: 'Gopal Suthar',
        mobile: '9829022233',
        email: 'gopal.repair@apexmachines.com',
        password: 'password123',
        role: 'machine_repairing',
        status: 'active'
      });

      repairToken = jwt.sign(
        { id: repairUser._id, role: repairUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      repairProfile = await BusinessProfile.create({
        userId: repairUser._id,
        business_type: 'machine_repairing',
        company_name: 'Apex Industrial Machine Repair & Engineering',
        business_category: 'Machine Repairing',
        business_subcategory: 'Granite Gangsaw, Multi-Blade Cutters & CNC Machine Maintenance',
        technician_count: 8,
        emergency_service_support: true,
        address: {
          state: 'Rajasthan',
          district: 'Rajsamand',
          area: 'RIICO Industrial Area',
          full_address: 'Plot 45, Machinery Zone, Rajsamand, Rajasthan',
          postal_code: '313324'
        },
        owners: [{ name: 'Gopal Suthar', designation: 'Chief Mechanical Engineer', phone: '+91 98290 22233', is_primary: true }],
        verification_steps: { gst: { gstin: '08AABCA1122B1Z1', status: 'verified' } },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AABCA1122B1Z1'
      });

      testRepairService = await Product.create({
        businessProfileId: repairProfile._id,
        vendorId: repairProfile._id,
        business_type: 'machine_repairing',
        name: 'Industrial Granite Gangsaw Repair & Maintenance',
        category: 'Granite Gangsaw Repair',
        repair_category: 'Granite Gangsaw Repair',
        supported_machine_types: ['Granite Gangsaw (80/100 Blades)', 'Multi-Blade Block Cutter'],
        supported_brands: ['Rajendra Machine Tools', 'Barsanti', 'GMM', 'Breton'],
        repair_specialization: ['Hydraulic Systems', 'Gearbox Overhaul', 'Main Crankshaft Bearing'],
        mechanical_repair: true,
        hydraulic_repair: true,
        onsite_service_available: true,
        operating_base_location: 'Rajsamand, Rajasthan',
        service_radius: '150 KM',
        selling_price: 8000,
        price: 8000,
        pricing_unit: 'Per Service Visit',
        status: 'active',
        sku: 'REP-2026-0001'
      });
    });

    it('GET /api/machine-repairing/dashboard - should return Repair Service Management menu and operational cards', async () => {
      const res = await request(app)
        .get('/api/machine-repairing/dashboard')
        .set('Authorization', `Bearer ${repairToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card.business_type).toBe('Machine Repairing');
      expect(res.body.data.my_business_menu.some(m => m.title === 'Repair Service Management')).toBe(true);
    });

    it('GET /api/machine-repairing/services - should list repair services', async () => {
      const res = await request(app)
        .get('/api/machine-repairing/services')
        .set('Authorization', `Bearer ${repairToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.services[0].name).toContain('Granite Gangsaw Repair');
    });

    it('POST /api/machine-repairing/services - should create CNC Bridge Cutter Maintenance service', async () => {
      const res = await request(app)
        .post('/api/machine-repairing/services')
        .set('Authorization', `Bearer ${repairToken}`)
        .send({
          name: 'CNC Bridge Cutter Maintenance & Calibration',
          category: 'CNC Machine Repair',
          supported_machine_types: ['5-Axis CNC Bridge Saw', 'Edge Polisher'],
          supported_brands: ['Donatoni', 'Breton', 'Intermac'],
          repair_specialization: ['Electrical, PLC & Mechanical Troubleshooting'],
          mechanical_repair: true,
          electrical_repair: true,
          plc_automation_support: true,
          onsite_service_available: true,
          operating_base_location: 'Udaipur, Rajasthan',
          selling_price: 12000,
          pricing_unit: 'On Quotation'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^REP-/);
      expect(res.body.data.name).toContain('CNC Bridge Cutter');
    });

    it('POST /api/machine-repairing/services/:id/duplicate - should duplicate service as draft', async () => {
      const res = await request(app)
        .post(`/api/machine-repairing/services/${testRepairService._id}/duplicate`)
        .set('Authorization', `Bearer ${repairToken}`);

      expect(res.status).toBe(201);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
    });
  });

  // =========================================================================
  // 2. ELECTRICAL PANEL & REPAIRING MODULE
  // =========================================================================
  describe('2. Electrical Panel & Repairing (Electrical Service Management)', () => {
    let electUser, electToken, electProfile;

    beforeEach(async () => {
      electUser = await User.create({
        name: 'Vikas Sharma',
        mobile: '9829033344',
        email: 'vikas.panels@powervolt.in',
        password: 'password123',
        role: 'electrical_panel',
        status: 'active'
      });

      electToken = jwt.sign(
        { id: electUser._id, role: electUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      electProfile = await BusinessProfile.create({
        userId: electUser._id,
        business_type: 'electrical_panel',
        company_name: 'PowerVolt Industrial Automation & Control Panels',
        business_category: 'Electrical Panel & Repairing',
        business_subcategory: 'Custom LT/HT Control Panels, APFC, MCC, VFD Automation & Machine Wiring',
        address: { state: 'Rajasthan', district: 'Kishangarh', postal_code: '305802' },
        owners: [{ name: 'Vikas Sharma', designation: 'Senior Electrical Engineer', phone: '+91 98290 33344', is_primary: true }],
        is_verified: true
      });
    });

    it('GET /api/electrical-panel/dashboard - should return Electrical Service Management menu', async () => {
      const res = await request(app)
        .get('/api/electrical-panel/dashboard')
        .set('Authorization', `Bearer ${electToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.my_business_menu.some(m => m.title === 'Electrical Service Management')).toBe(true);
    });

    it('POST /api/electrical-panel/services - should publish Industrial LT Control Panel listing', async () => {
      const res = await request(app)
        .post('/api/electrical-panel/services')
        .set('Authorization', `Bearer ${electToken}`)
        .send({
          name: 'Industrial LT Electrical Control Panel Manufacturing',
          category: 'LT Control Panel',
          panel_type: 'LT Control Panel',
          voltage_rating: '415V',
          phase: 'Three Phase',
          rated_current_amp: '800A',
          busbar_material: 'Electrolytic Copper',
          plc_vfd_brand: 'Siemens / Schneider',
          selling_price: 85000,
          pricing_unit: 'Per Unit',
          installation_available: true,
          commissioning_available: true,
          warranty: '1 Year Full Replacement Warranty'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^ELC-/);
      expect(res.body.data.voltage_rating).toBe('415V');
    });
  });

  // =========================================================================
  // 3. WATER SUPPLIER MODULE
  // =========================================================================
  describe('3. Water Supplier (Water Supply Management)', () => {
    let waterUser, waterToken, waterProfile;

    beforeEach(async () => {
      waterUser = await User.create({
        name: 'Mangi Lal Choudhary',
        mobile: '9829044455',
        email: 'mangilal@neerdhara.com',
        password: 'password123',
        role: 'water_supplier',
        status: 'active'
      });

      waterToken = jwt.sign(
        { id: waterUser._id, role: waterUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      waterProfile = await BusinessProfile.create({
        userId: waterUser._id,
        business_type: 'water_supplier',
        company_name: 'NeerDhara Industrial & Commercial Water Supplies',
        business_category: 'Water Supplier',
        business_subcategory: 'Industrial Water Tankers, RO Treated Water & Packaged Drinking Water',
        tanker_fleet_count: 14,
        address: { state: 'Rajasthan', district: 'Makrana', postal_code: '341505' },
        owners: [{ name: 'Mangi Lal Choudhary', designation: 'Fleet Director', phone: '+91 98290 44455', is_primary: true }]
      });
    });

    it('GET /api/water-supplier/dashboard - should return Water Supply Management menu', async () => {
      const res = await request(app)
        .get('/api/water-supplier/dashboard')
        .set('Authorization', `Bearer ${waterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.my_business_menu.some(m => m.title === 'Water Supply Management')).toBe(true);
    });

    it('POST /api/water-supplier/supplies - should create Industrial Water Tanker listing', async () => {
      const res = await request(app)
        .post('/api/water-supplier/supplies')
        .set('Authorization', `Bearer ${waterToken}`)
        .send({
          name: 'Industrial Water Tanker Supply (12,000 Litres)',
          category: 'Industrial Water Supply',
          water_source: 'Borewell & Filter Plant',
          water_type: 'Industrial Water',
          supply_capacity: '12,000 Litres',
          tanker_capacity: '12,000 Litres',
          operating_base_location: 'Makrana Industrial Area',
          selling_price: 2500,
          pricing_unit: 'Per Tanker',
          regular_supply_available: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^WTR-/);
      expect(res.body.data.selling_price).toBe(2500);
    });
  });

  // =========================================================================
  // 4. CA & TAX ADVISOR MODULE
  // =========================================================================
  describe('4. CA & Tax Advisor (Professional Services Management)', () => {
    let caUser, caToken, caProfile;

    beforeEach(async () => {
      caUser = await User.create({
        name: 'CA Rajesh Singhal',
        mobile: '9829055566',
        email: 'rajesh.singhal@casinghal.com',
        password: 'password123',
        role: 'ca_tax_advisor',
        status: 'active'
      });

      caToken = jwt.sign(
        { id: caUser._id, role: caUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      caProfile = await BusinessProfile.create({
        userId: caUser._id,
        business_type: 'ca_tax_advisor',
        company_name: 'Singhal & Associates Chartered Accountants',
        business_category: 'CA & Tax Advisor',
        business_subcategory: 'Mining & Stone Industry GST Compliance, ROC, Audits & Corporate Advisory',
        address: { state: 'Rajasthan', district: 'Jaipur', postal_code: '302001' },
        owners: [{ name: 'CA Rajesh Singhal', designation: 'Senior Partner', phone: '+91 98290 55566', is_primary: true }]
      });
    });

    it('GET /api/ca-tax-advisor/dashboard - should return Professional Services Management menu', async () => {
      const res = await request(app)
        .get('/api/ca-tax-advisor/dashboard')
        .set('Authorization', `Bearer ${caToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.my_business_menu.some(m => m.title === 'Professional Services Management')).toBe(true);
    });

    it('POST /api/ca-tax-advisor/services - should create GST Registration & Return Filing listing', async () => {
      const res = await request(app)
        .post('/api/ca-tax-advisor/services')
        .set('Authorization', `Bearer ${caToken}`)
        .send({
          name: 'GST Registration & Monthly Return Filing Package',
          category: 'GST Return Filing',
          professional_name: 'CA Rajesh Singhal',
          qualification: 'FCA, DISA (ICAI)',
          ca_membership_number: '078945',
          firm_registration_number: '012345C',
          areas_of_expertise: ['GST Compliance', 'GSTR-1 & 3B', 'E-Way Bill Advisory'],
          client_types: ['Manufacturer', 'Mining Quarry', 'Trader', 'Showroom'],
          consultation_fee: 1500,
          selling_price: 1500,
          pricing_unit: 'Per Month'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^TAX-/);
      expect(res.body.data.qualification).toBe('FCA, DISA (ICAI)');
    });
  });

  // =========================================================================
  // 5. BANKING & LOAN SERVICES MODULE
  // =========================================================================
  describe('5. Banking & Loan Services (Financial Services Management)', () => {
    let bankUser, bankToken, bankProfile;

    beforeEach(async () => {
      bankUser = await User.create({
        name: 'Pradeep Meena',
        mobile: '9829066677',
        email: 'pradeep.loans@apexfinance.in',
        password: 'password123',
        role: 'banking_loan',
        status: 'active'
      });

      bankToken = jwt.sign(
        { id: bankUser._id, role: bankUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      bankProfile = await BusinessProfile.create({
        userId: bankUser._id,
        business_type: 'banking_loan',
        company_name: 'Apex Industrial Finance & MSME Loan Advisory',
        business_category: 'Banking & Loan Services',
        business_subcategory: 'Machinery Loans, Industrial Working Capital, CC/OD & Export Credit',
        address: { state: 'Rajasthan', district: 'Udaipur', postal_code: '313001' },
        owners: [{ name: 'Pradeep Meena', designation: 'Managing Director', phone: '+91 98290 66677', is_primary: true }]
      });
    });

    it('GET /api/banking-loan/dashboard - should return Financial Services Management menu', async () => {
      const res = await request(app)
        .get('/api/banking-loan/dashboard')
        .set('Authorization', `Bearer ${bankToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.my_business_menu.some(m => m.title === 'Financial Services Management')).toBe(true);
    });

    it('POST /api/banking-loan/services - should create MSME Business Loan Assistance listing', async () => {
      const res = await request(app)
        .post('/api/banking-loan/services')
        .set('Authorization', `Bearer ${bankToken}`)
        .send({
          name: 'MSME Machinery Purchase & Working Capital Finance Assistance',
          category: 'Machinery Loans',
          financial_product_type: 'Equipment & Term Loan',
          lending_institution: 'State Bank of India / HDFC Bank / SIDBI',
          loan_purpose: 'Purchase of CNC Bridge Saws and Granite Gangsaws',
          min_loan_amount: 1000000,
          max_loan_amount: 50000000,
          interest_rate_range: '8.5% - 10.5% p.a. (Subject to Credit Rating)',
          emi_facility: true,
          terms_disclosure: 'Indicative'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^FIN-/);
      expect(res.body.data.lending_institution).toContain('State Bank of India');
    });
  });

  // =========================================================================
  // 6. HOTEL & RESTAURANT MODULE
  // =========================================================================
  describe('6. Hotel & Restaurant (Hospitality Management)', () => {
    let hotelUser, hotelToken, hotelProfile;

    beforeEach(async () => {
      hotelUser = await User.create({
        name: 'Kunwar Ranveer Singh',
        mobile: '9829077788',
        email: 'ranveer@royalgranitohotel.com',
        password: 'password123',
        role: 'hotel_restaurant',
        status: 'active'
      });

      hotelToken = jwt.sign(
        { id: hotelUser._id, role: hotelUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      hotelProfile = await BusinessProfile.create({
        userId: hotelUser._id,
        business_type: 'hotel_restaurant',
        company_name: 'The Royal Granito Business Hotel & Dine',
        business_category: 'Hotel & Restaurant',
        business_subcategory: 'Executive Business Stays, Banquet Halls & Multi-Cuisine Fine Dining',
        total_room_count: 45,
        address: { state: 'Rajasthan', district: 'Kishangarh', postal_code: '305802' },
        owners: [{ name: 'Kunwar Ranveer Singh', designation: 'Managing Director', phone: '+91 98290 77788', is_primary: true }]
      });
    });

    it('GET /api/hotel-restaurant/dashboard - should return Hospitality Management menu', async () => {
      const res = await request(app)
        .get('/api/hotel-restaurant/dashboard')
        .set('Authorization', `Bearer ${hotelToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.my_business_menu.some(m => m.title === 'Hospitality Management')).toBe(true);
    });

    it('POST /api/hotel-restaurant/listings - should publish Business Hotel listing', async () => {
      const res = await request(app)
        .post('/api/hotel-restaurant/listings')
        .set('Authorization', `Bearer ${hotelToken}`)
        .send({
          name: 'The Royal Granito Executive Business Hotel',
          category: 'Business Hotel',
          establishment_type: 'Hotel',
          business_address: 'Kishangarh Marble Industrial Belt, NH-8, Kishangarh',
          total_rooms: 45,
          room_types: ['Deluxe Executive Room', 'Super Deluxe Suite'],
          total_guest_capacity: 90,
          parking_available: true,
          wifi_available: true,
          restaurant_available: true,
          starting_room_price: 2500,
          selling_price: 2500,
          pricing_unit: 'Per Night'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^HSP-/);
      expect(res.body.data.starting_room_price).toBe(2500);
    });
  });

  // =========================================================================
  // 7. SHARED MODULE INTEGRATIONS ACROSS ALL 6 TYPES
  // =========================================================================
  describe('7. Shared Modules Integration (Settings, Promotions, Invoices)', () => {
    const roles = [
      { role: 'machine_repairing', path: 'machine-repairing' },
      { role: 'electrical_panel', path: 'electrical-panel' },
      { role: 'water_supplier', path: 'water-supplier' },
      { role: 'ca_tax_advisor', path: 'ca-tax-advisor' },
      { role: 'banking_loan', path: 'banking-loan' },
      { role: 'hotel_restaurant', path: 'hotel-restaurant' }
    ];

    roles.forEach(({ role, path }) => {
      it(`GET /api/${path}/settings and /promotions - should work for ${role}`, async () => {
        const user = await User.create({
          name: `${role} Test User`,
          mobile: `98200${Math.floor(10000 + Math.random() * 90000)}`,
          email: `${role}${Date.now()}@test.com`,
          password: 'password123',
          role,
          status: 'active'
        });

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        const resSettings = await request(app)
          .get(`/api/${path}/settings`)
          .set('Authorization', `Bearer ${token}`);
        expect(resSettings.status).toBe(200);

        const resPromotions = await request(app)
          .get(`/api/${path}/promotions`)
          .set('Authorization', `Bearer ${token}`);
        expect(resPromotions.status).toBe(200);

        const resInvoices = await request(app)
          .get(`/api/${path}/invoices`)
          .set('Authorization', `Bearer ${token}`);
        expect(resInvoices.status).toBe(200);
      });
    });
  });
});

