const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Trust the first proxy (required for express-rate-limit when behind reverse proxy/load balancer)
app.set('trust proxy', 1);

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
  max: process.env.RATE_LIMIT_MAX || 100,
});
app.use(limiter);

const { protect, authorize } = require('./src/middleware/auth');

// Route modules
const authRoutes = require('./src/routes/auth');
const vendorRoutes = require('./src/routes/vendors');
const productRoutes = require('./src/routes/products');
const inquiryRoutes = require('./src/routes/inquiries');
const searchRoutes = require('./src/routes/search');
const adminRoutes = require('./src/routes/admin');
const adRoutes = require('./src/routes/ads');
const userRoutes = require('./src/routes/users');

// v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/admin', protect, authorize('admin'), adminRoutes);
app.use('/api/v1/ads', adRoutes);
app.use('/api/v1/users', userRoutes);

// Root Routes (for frontend compatibility)
app.use('/auth', authRoutes);
app.use('/vendors', vendorRoutes);
app.use('/products', productRoutes);
app.use('/inquiries', inquiryRoutes);
app.use('/search', searchRoutes);
app.use('/admin', protect, authorize('admin'), adminRoutes);
app.use('/ads', adRoutes);
app.use('/users', userRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Stone Market India API Running');
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
