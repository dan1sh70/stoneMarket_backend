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
const masterDataRoutes = require('./src/routes/masterData');
const registrationRoutes = require('./src/routes/registration');
const serviceCategoriesRoutes = require('./src/routes/serviceCategories');
const homeRoutes = require('./src/routes/home');
const feedRoutes = require('./src/routes/feed');
const businessRoutes = require('./src/routes/businesses');
const miningRoutes = require('./src/routes/mining');
const quoteRoutes = require('./src/routes/quotes');
const manufacturerRoutes = require('./src/routes/manufacturers');
const showroomRoutes = require('./src/routes/showrooms');
const traderRoutes = require('./src/routes/traders');
const buyerRoutes = require('./src/routes/buyers');
const buyerSelfRoutes = require('./src/routes/buyerSelf');
const supplierRoutes = require('./src/routes/suppliers');
const marketplaceRoutes = require('./src/routes/marketplace');
const adminBuyerRoutes = require('./src/routes/adminBuyer');
const transportPublicRoutes = require('./src/routes/transportPublic');
const providerTransportRoutes = require('./src/routes/providerTransport');
const adminTransportRoutes = require('./src/routes/adminTransport');
const estimateRoutes = require('./src/routes/estimates');
const customerRoutes = require('./src/routes/customer');
const appInfoRoutes = require('./src/routes/appInfo');
const manufacturerProfileRoutes = require('./src/routes/manufacturerProfile');
const miningProfileRoutes = require('./src/routes/miningProfileRoutes');
const showroomProfileRoutes = require('./src/routes/showroomProfileRoutes');
const traderProfileRoutes = require('./src/routes/traderProfileRoutes');

// CMS Routes
const miningCmsRoutes = require('./src/routes/cms/mining');
const manufacturerCmsRoutes = require('./src/routes/cms/manufacturer');
const showroomCmsRoutes = require('./src/routes/cms/showroom');
const traderCmsRoutes = require('./src/routes/cms/trader');

// Phase 2 Ads & Promotion Management Routes
const promotionRoutes = require('./src/routes/promotionRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const promotionInvoiceRoutes = require('./src/routes/promotionInvoiceRoutes');
const adminPromotionRoutes = require('./src/routes/adminPromotionRoutes');
const promotionController = require('./src/controllers/promotionController');

// Phase 3 My Inquiries & Lead Management Routes
const inquiryManagementRoutes = require('./src/routes/inquiryManagementRoutes');
const quotationManagementRoutes = require('./src/routes/quotationManagementRoutes');

// Phase 4 Lead Management & Account Settings Routes
const leadManagementRoutes = require('./src/routes/leadManagementRoutes');
const accountSettingsRoutes = require('./src/routes/accountSettingsRoutes');

// v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/app', appInfoRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/admin', protect, authorize('admin'), adminRoutes);
app.use('/api/v1/ads', adRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', masterDataRoutes); // locations/states & locations/cities
app.use('/api/v1', transportPublicRoutes);
app.use('/api/v1/provider', providerTransportRoutes);
app.use('/api/v1/admin', adminTransportRoutes);
app.use('/api/v1/estimates', estimateRoutes);

// New unified /api routes for the upgrade
app.use('/api', masterDataRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/quote-requests', quoteRoutes);
app.use('/api/service-providers', businessRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/service-categories', serviceCategoriesRoutes);
app.use('/api/auth', authRoutes); // also mount auth on root /api/auth as requested
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/showrooms', showroomRoutes);
app.use('/api/traders', traderRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/buyer', buyerSelfRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin/buyers', adminBuyerRoutes);
app.use('/api', transportPublicRoutes);
app.use('/api/provider', providerTransportRoutes);
app.use('/api/admin', adminTransportRoutes);
// Phase 2 Ads & Promotion Management Routes (mounted before /api/manufacturer & /api/mining & /api/showroom & /api/trader)
app.use('/api/manufacturer/promotions', promotionRoutes);
app.use('/api/mining/promotions', promotionRoutes);
app.use('/api/showroom/promotions', promotionRoutes);
app.use('/api/trader/promotions', promotionRoutes);
app.use('/api/promotions', promotionRoutes);
app.get('/api/promotion-packages', promotionController.getPromotionPackages);
app.get('/api/promotion-packages/:id', promotionController.getPromotionPackageById);
app.use('/api/payments', paymentRoutes);
app.use('/api/manufacturer/invoices', promotionInvoiceRoutes);
app.use('/api/mining/invoices', promotionInvoiceRoutes);
app.use('/api/showroom/invoices', promotionInvoiceRoutes);
app.use('/api/trader/invoices', promotionInvoiceRoutes);
app.use('/api/admin/promotions', adminPromotionRoutes);

// v1 aliases
app.use('/api/v1/manufacturer/promotions', promotionRoutes);
app.use('/api/v1/mining/promotions', promotionRoutes);
app.use('/api/v1/showroom/promotions', promotionRoutes);
app.use('/api/v1/trader/promotions', promotionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/manufacturer/invoices', promotionInvoiceRoutes);
app.use('/api/v1/mining/invoices', promotionInvoiceRoutes);
app.use('/api/v1/showroom/invoices', promotionInvoiceRoutes);
app.use('/api/v1/trader/invoices', promotionInvoiceRoutes);
app.use('/api/v1/admin/promotions', adminPromotionRoutes);

// Phase 3 My Inquiries & Lead Management Routes (mounted before /api/manufacturer & /api/mining & /api/showroom & /api/trader)
app.use('/api/manufacturer/inquiries', inquiryManagementRoutes);
app.use('/api/mining/inquiries', inquiryManagementRoutes);
app.use('/api/showroom/inquiries', inquiryManagementRoutes);
app.use('/api/trader/inquiries', inquiryManagementRoutes);
app.use('/api/manufacturer/quotes', quotationManagementRoutes);
app.use('/api/mining/quotes', quotationManagementRoutes);
app.use('/api/showroom/quotes', quotationManagementRoutes);
app.use('/api/trader/quotes', quotationManagementRoutes);
app.use('/api/v1/manufacturer/inquiries', inquiryManagementRoutes);
app.use('/api/v1/mining/inquiries', inquiryManagementRoutes);
app.use('/api/v1/showroom/inquiries', inquiryManagementRoutes);
app.use('/api/v1/trader/inquiries', inquiryManagementRoutes);
app.use('/api/v1/manufacturer/quotes', quotationManagementRoutes);
app.use('/api/v1/mining/quotes', quotationManagementRoutes);
app.use('/api/v1/showroom/quotes', quotationManagementRoutes);
app.use('/api/v1/trader/quotes', quotationManagementRoutes);

// Phase 4 Lead Management & Account Settings Routes (mounted before /api/manufacturer & /api/mining & /api/showroom & /api/trader)
app.use('/api/manufacturer/leads', leadManagementRoutes);
app.use('/api/mining/leads', leadManagementRoutes);
app.use('/api/showroom/leads', leadManagementRoutes);
app.use('/api/trader/leads', leadManagementRoutes);
app.use('/api/manufacturer/settings', accountSettingsRoutes);
app.use('/api/mining/settings', accountSettingsRoutes);
app.use('/api/showroom/settings', accountSettingsRoutes);
app.use('/api/trader/settings', accountSettingsRoutes);
app.use('/api/v1/manufacturer/leads', leadManagementRoutes);
app.use('/api/v1/mining/leads', leadManagementRoutes);
app.use('/api/v1/showroom/leads', leadManagementRoutes);
app.use('/api/v1/trader/leads', leadManagementRoutes);
app.use('/api/v1/manufacturer/settings', accountSettingsRoutes);
app.use('/api/v1/mining/settings', accountSettingsRoutes);
app.use('/api/v1/showroom/settings', accountSettingsRoutes);
app.use('/api/v1/trader/settings', accountSettingsRoutes);
app.use('/api/public/leads', leadManagementRoutes);
app.use('/api/v1/public/leads', leadManagementRoutes);

app.use('/api/customer', customerRoutes);
app.use('/api/manufacturer', manufacturerProfileRoutes);
app.use('/api/v1/manufacturer', manufacturerProfileRoutes);
app.use('/api/mining', miningProfileRoutes);
app.use('/api/v1/mining', miningProfileRoutes);
app.use('/api/showroom', showroomProfileRoutes);
app.use('/api/v1/showroom', showroomProfileRoutes);
app.use('/api/trader', traderProfileRoutes);
app.use('/api/v1/trader', traderProfileRoutes);
app.use('/api/app', appInfoRoutes);

// Mount CMS API Routes
app.use('/api/cms/mining', miningProfileRoutes);
app.use('/api/cms/manufacturer', manufacturerProfileRoutes);
app.use('/api/cms/showroom', showroomProfileRoutes);
app.use('/api/cms/trader', traderProfileRoutes);

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
