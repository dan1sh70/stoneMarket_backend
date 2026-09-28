const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');
const HomeBanner = require('../src/models/HomeBanner');
const MiningCategory = require('../src/models/MiningCategory');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  // Seed minimal data
  await HomeBanner.create({
    title: 'Test Banner',
    image: 'test.jpg',
    target_type: 'none',
    status: 'active'
  });

  await MiningCategory.create({
    name: 'Test Mining',
    slug: 'test-mining',
    status: 'active'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Home and Mining Flow APIs', () => {
  test('GET /api/home should return aggregated data', async () => {
    const res = await request(app).get('/api/home');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('hero_sliders');
    expect(res.body.data.hero_sliders.length).toBe(1);
    expect(res.body.data).toHaveProperty('activities');
  });

  test('GET /api/mining/categories should return active categories', async () => {
    const res = await request(app).get('/api/mining/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].name).toBe('Test Mining');
  });

  test('GET /api/feed should return paginated list', async () => {
    const res = await request(app).get('/api/feed');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
  });
});
