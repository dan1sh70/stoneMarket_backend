const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  resendOTP,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  requestOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOTP); // legacy
router.post('/login', login);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// New Routes
router.post('/google', googleLogin);
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTP);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
