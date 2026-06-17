const request = require('supertest');
const app = require('../server'); // ensure server.js exports app
const User = require('../src/models/User');

describe('Auth API', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Buyer',
        mobile: '9876543210',
        role: 'buyer'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered. OTP sent to mobile.');
    expect(res.body).toHaveProperty('userId');

    // Verify user is in DB
    const user = await User.findOne({ mobile: '9876543210' });
    expect(user).toBeTruthy();
    expect(user.status).toEqual('pending'); // Initially pending
    expect(user.otp.code).toBeDefined(); // Mock OTP was generated
  });

  it('should return 400 for missing required fields (Joi validation)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Incomplete' });
      
    expect(res.statusCode).toEqual(400);
  });
});
