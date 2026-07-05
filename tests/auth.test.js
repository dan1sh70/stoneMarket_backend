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

  it('should generate reset password token and send email', async () => {
    await User.create({
      name: 'Test Reset User',
      mobile: '5555555555',
      email: 'reset@example.com',
      status: 'active'
    });

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'reset@example.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Password reset link sent to email');

    const user = await User.findOne({ email: 'reset@example.com' });
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();
  });

  it('should reset password successfully using a valid token', async () => {
    const registeredUser = await User.create({
      name: 'Test Reset User 2',
      mobile: '7777777777',
      email: 'reset2@example.com',
      status: 'active'
    });

    const crypto = require('crypto');
    const rawToken = 'token123';
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    registeredUser.resetPasswordToken = hashed;
    registeredUser.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await registeredUser.save();

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: rawToken,
        password: 'newsecurepassword'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Password reset successful');

    const updatedUser = await User.findOne({ email: 'reset2@example.com' });
    expect(updatedUser.resetPasswordToken).toBeUndefined();
    expect(updatedUser.resetPasswordExpire).toBeUndefined();
    
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare('newsecurepassword', updatedUser.password);
    expect(isMatch).toBe(true);
  });
});
