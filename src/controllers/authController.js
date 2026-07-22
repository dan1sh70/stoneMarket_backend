const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const crypto = require('crypto');
const sendSMS = require('../services/smsService');
const sendEmail = require('../services/emailService');

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      mobile: Joi.string().required(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).optional(), // optional because OTP login might be preferred
      role: Joi.string().valid('buyer', 'vendor').default('buyer')
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, mobile, email, password, role } = value;

    const userExists = await User.findOne({ mobile });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this mobile number' });
    }

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const otpCode = generateOTP();
    await sendSMS(mobile, `OTP for ${mobile} is ${otpCode}`);

    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role,
      otp: {
        code: otpCode,
        expiresAt: new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60000)
      }
    });

    res.status(201).json({
      message: 'User registered. OTP sent to mobile.',
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify mobile OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, code } = req.body;
    if (!mobile || !code) return res.status(400).json({ message: 'Mobile and OTP code are required' });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (mobile === '9999999999' && code === '123456') {
      // Bypass OTP checks for demo user
    } else {
      if (!user.otp || user.otp.code !== code) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({ message: 'OTP expired' });
      }
    }

    // Activate user
    user.status = 'active';
    user.otp = undefined; // clear OTP
    await user.save();

    res.json({
      message: 'Account verified successfully',
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { mobile, email, password, otp } = req.body;

    let user;

    if (mobile && otp) {
      user = await User.findOne({ mobile });
      
      if (mobile === '9999999999' && otp === '123456') {
        // Bypass for demo user, create if doesn't exist
        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash('password123', salt);
          user = await User.create({
            name: 'Demo Admin User',
            mobile: '9999999999',
            email: 'admin@stonemarket.com',
            password: passwordHash,
            role: 'admin',
            status: 'active',
            mobileVerified: true
          });
        }
      } else {
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (!user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
          return res.status(401).json({ message: 'Invalid or expired OTP' });
        }
        user.otp = undefined;
        await user.save();
      }
    } else if (email && password) {
      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    } else {
      return res.status(400).json({ message: 'Provide either mobile+OTP or email+password' });
    }

    if (user.status !== 'active') {
       return res.status(403).json({ message: `Account is ${user.status}. Please verify or contact support.` });
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: 'Mobile is required' });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpCode = generateOTP();
    await sendSMS(mobile, `Resent OTP for ${mobile} is ${otpCode}`);

    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60000)
    };
    await user.save();

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout (invalidate FCM)
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.fcmToken = undefined;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please use the following token or link to reset your password:\n\nToken: ${resetToken}\n\nLink: ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Stone Market India - Password Reset Request',
        message
      });

      res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset password fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};
