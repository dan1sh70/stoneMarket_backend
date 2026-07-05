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

// Routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/vendors', require('./src/routes/vendors'));
app.use('/api/v1/products', require('./src/routes/products'));
app.use('/api/v1/inquiries', require('./src/routes/inquiries'));
app.use('/api/v1/search', require('./src/routes/search'));
app.use('/api/v1/admin', protect, authorize('admin'), require('./src/routes/admin'));
app.use('/api/v1/ads', require('./src/routes/ads'));
app.use('/api/v1/users', require('./src/routes/users'));
// ... other routes

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
