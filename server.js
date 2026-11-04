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
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(o => o.trim()) 
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // allow localhost development ports dynamically
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // allow sslip.io, nip.io, onrender.com, vercel.app dynamic subdomains
    if (/\.(sslip\.io|nip\.io|onrender\.com|vercel\.app)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback: allow all origins in API
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-business-id']
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
  max: isDev ? 10000 : (process.env.RATE_LIMIT_MAX || 100),
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
const buyerProfileRoutes = require('./src/routes/buyerProfileRoutes');
const transportProfileRoutes = require('./src/routes/transportProfileRoutes');
const brazingProfileRoutes = require('./src/routes/brazingProfileRoutes');
const abrasivesProfileRoutes = require('./src/routes/abrasivesProfileRoutes');
const machineryProfileRoutes = require('./src/routes/machineryProfileRoutes');
const miningEquipmentProfileRoutes = require('./src/routes/miningEquipmentProfileRoutes');
const solarSolutionsProfileRoutes = require('./src/routes/solarSolutionsProfileRoutes');
const diamondBladesProfileRoutes = require('./src/routes/diamondBladesProfileRoutes');
const machineManufacturerProfileRoutes = require('./src/routes/machineManufacturerProfileRoutes');
const powderSupplierProfileRoutes = require('./src/routes/powderSupplierProfileRoutes');
const {
  machineRepairingRoutes,
  electricalPanelRoutes,
  waterSupplierRoutes,
  hydroCraneRoutes,
  caTaxAdvisorRoutes,
  bankingLoanRoutes,
  hotelRestaurantRoutes
} = require('./src/routes/extendedServicesRoutes');
const businessManagementRoutes = require('./src/routes/businessManagementRoutes');
const universalCatalogueRoutes = require('./src/routes/universalCatalogueRoutes');

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
// Note: /api/buyer is mounted with buyerProfileRoutes for full buyer dashboard and sourcing management
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
app.use('/api/buyer/promotions', promotionRoutes);
app.use('/api/transport/promotions', promotionRoutes);
app.use('/api/brazing/promotions', promotionRoutes);
app.use('/api/abrasives/promotions', promotionRoutes);
app.use('/api/machinery/promotions', promotionRoutes);
app.use('/api/mining-equipment/promotions', promotionRoutes);
app.use('/api/solar/promotions', promotionRoutes);
app.use('/api/diamond-blades/promotions', promotionRoutes);
app.use('/api/machine-manufacturer/promotions', promotionRoutes);
app.use('/api/powder-supplier/promotions', promotionRoutes);
app.use('/api/machine-repairing/promotions', promotionRoutes);
app.use('/api/electrical-panel/promotions', promotionRoutes);
app.use('/api/water-supplier/promotions', promotionRoutes);
app.use('/api/hydro-crane/promotions', promotionRoutes);
app.use('/api/ca-tax-advisor/promotions', promotionRoutes);
app.use('/api/banking-loan/promotions', promotionRoutes);
app.use('/api/hotel-restaurant/promotions', promotionRoutes);
app.use('/api/promotions', promotionRoutes);
app.get('/api/promotion-packages', promotionController.getPromotionPackages);
app.get('/api/promotion-packages/:id', promotionController.getPromotionPackageById);
app.use('/api/payments', paymentRoutes);
app.use('/api/manufacturer/invoices', promotionInvoiceRoutes);
app.use('/api/mining/invoices', promotionInvoiceRoutes);
app.use('/api/showroom/invoices', promotionInvoiceRoutes);
app.use('/api/trader/invoices', promotionInvoiceRoutes);
app.use('/api/buyer/invoices', promotionInvoiceRoutes);
app.use('/api/transport/invoices', promotionInvoiceRoutes);
app.use('/api/brazing/invoices', promotionInvoiceRoutes);
app.use('/api/abrasives/invoices', promotionInvoiceRoutes);
app.use('/api/machinery/invoices', promotionInvoiceRoutes);
app.use('/api/mining-equipment/invoices', promotionInvoiceRoutes);
app.use('/api/solar/invoices', promotionInvoiceRoutes);
app.use('/api/diamond-blades/invoices', promotionInvoiceRoutes);
app.use('/api/machine-manufacturer/invoices', promotionInvoiceRoutes);
app.use('/api/powder-supplier/invoices', promotionInvoiceRoutes);
app.use('/api/machine-repairing/invoices', promotionInvoiceRoutes);
app.use('/api/electrical-panel/invoices', promotionInvoiceRoutes);
app.use('/api/water-supplier/invoices', promotionInvoiceRoutes);
app.use('/api/hydro-crane/invoices', promotionInvoiceRoutes);
app.use('/api/ca-tax-advisor/invoices', promotionInvoiceRoutes);
app.use('/api/banking-loan/invoices', promotionInvoiceRoutes);
app.use('/api/hotel-restaurant/invoices', promotionInvoiceRoutes);
app.use('/api/admin/promotions', adminPromotionRoutes);

// v1 aliases
app.use('/api/v1/manufacturer/promotions', promotionRoutes);
app.use('/api/v1/mining/promotions', promotionRoutes);
app.use('/api/v1/showroom/promotions', promotionRoutes);
app.use('/api/v1/trader/promotions', promotionRoutes);
app.use('/api/v1/buyer/promotions', promotionRoutes);
app.use('/api/v1/transport/promotions', promotionRoutes);
app.use('/api/v1/brazing/promotions', promotionRoutes);
app.use('/api/v1/abrasives/promotions', promotionRoutes);
app.use('/api/v1/machinery/promotions', promotionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/manufacturer/invoices', promotionInvoiceRoutes);
app.use('/api/v1/mining/invoices', promotionInvoiceRoutes);
app.use('/api/v1/showroom/invoices', promotionInvoiceRoutes);
app.use('/api/v1/trader/invoices', promotionInvoiceRoutes);
app.use('/api/v1/buyer/invoices', promotionInvoiceRoutes);
app.use('/api/v1/transport/invoices', promotionInvoiceRoutes);
app.use('/api/v1/brazing/invoices', promotionInvoiceRoutes);
app.use('/api/v1/abrasives/invoices', promotionInvoiceRoutes);
app.use('/api/v1/machinery/invoices', promotionInvoiceRoutes);
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
app.use('/api/buyer/settings', accountSettingsRoutes);
app.use('/api/transport/settings', accountSettingsRoutes);
app.use('/api/brazing/settings', accountSettingsRoutes);
app.use('/api/abrasives/settings', accountSettingsRoutes);
app.use('/api/machinery/settings', accountSettingsRoutes);
app.use('/api/mining-equipment/settings', accountSettingsRoutes);
app.use('/api/solar/settings', accountSettingsRoutes);
app.use('/api/diamond-blades/settings', accountSettingsRoutes);
app.use('/api/machine-manufacturer/settings', accountSettingsRoutes);
app.use('/api/powder-supplier/settings', accountSettingsRoutes);
app.use('/api/machine-repairing/settings', accountSettingsRoutes);
app.use('/api/electrical-panel/settings', accountSettingsRoutes);
app.use('/api/water-supplier/settings', accountSettingsRoutes);
app.use('/api/hydro-crane/settings', accountSettingsRoutes);
app.use('/api/ca-tax-advisor/settings', accountSettingsRoutes);
app.use('/api/banking-loan/settings', accountSettingsRoutes);
app.use('/api/hotel-restaurant/settings', accountSettingsRoutes);
app.use('/api/v1/manufacturer/leads', leadManagementRoutes);
app.use('/api/v1/mining/leads', leadManagementRoutes);
app.use('/api/v1/showroom/leads', leadManagementRoutes);
app.use('/api/v1/trader/leads', leadManagementRoutes);
app.use('/api/v1/manufacturer/settings', accountSettingsRoutes);
app.use('/api/v1/mining/settings', accountSettingsRoutes);
app.use('/api/v1/showroom/settings', accountSettingsRoutes);
app.use('/api/v1/trader/settings', accountSettingsRoutes);
app.use('/api/v1/buyer/settings', accountSettingsRoutes);
app.use('/api/v1/transport/settings', accountSettingsRoutes);
app.use('/api/v1/brazing/settings', accountSettingsRoutes);
app.use('/api/v1/abrasives/settings', accountSettingsRoutes);
app.use('/api/v1/machinery/settings', accountSettingsRoutes);
app.use('/api/v1/mining-equipment/settings', accountSettingsRoutes);
app.use('/api/v1/solar/settings', accountSettingsRoutes);
app.use('/api/v1/diamond-blades/settings', accountSettingsRoutes);
app.use('/api/v1/machine-manufacturer/settings', accountSettingsRoutes);
app.use('/api/v1/powder-supplier/settings', accountSettingsRoutes);
app.use('/api/v1/machine-repairing/settings', accountSettingsRoutes);
app.use('/api/v1/electrical-panel/settings', accountSettingsRoutes);
app.use('/api/v1/water-supplier/settings', accountSettingsRoutes);
app.use('/api/v1/hydro-crane/settings', accountSettingsRoutes);
app.use('/api/v1/ca-tax-advisor/settings', accountSettingsRoutes);
app.use('/api/v1/banking-loan/settings', accountSettingsRoutes);
app.use('/api/v1/hotel-restaurant/settings', accountSettingsRoutes);
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
app.use('/api/buyer', buyerProfileRoutes);
app.use('/api/v1/buyer', buyerProfileRoutes);
app.use('/api/transport', transportProfileRoutes);
app.use('/api/v1/transport', transportProfileRoutes);
app.use('/api/brazing', brazingProfileRoutes);
app.use('/api/v1/brazing', brazingProfileRoutes);
app.use('/api/abrasives', abrasivesProfileRoutes);
app.use('/api/v1/abrasives', abrasivesProfileRoutes);
app.use('/api/machinery', machineryProfileRoutes);
app.use('/api/v1/machinery', machineryProfileRoutes);
app.use('/api/mining-equipment', miningEquipmentProfileRoutes);
app.use('/api/v1/mining-equipment', miningEquipmentProfileRoutes);
app.use('/api/solar', solarSolutionsProfileRoutes);
app.use('/api/v1/solar', solarSolutionsProfileRoutes);
app.use('/api/diamond-blades', diamondBladesProfileRoutes);
app.use('/api/v1/diamond-blades', diamondBladesProfileRoutes);
app.use('/api/machine-manufacturer', machineManufacturerProfileRoutes);
app.use('/api/v1/machine-manufacturer', machineManufacturerProfileRoutes);
app.use('/api/powder-supplier', powderSupplierProfileRoutes);
app.use('/api/v1/powder-supplier', powderSupplierProfileRoutes);
app.use('/api/mineral-supplier', powderSupplierProfileRoutes);
app.use('/api/v1/mineral-supplier', powderSupplierProfileRoutes);

// Additional 6 Business Types Routes
app.use('/api/machine-repairing', machineRepairingRoutes);
app.use('/api/v1/machine-repairing', machineRepairingRoutes);
app.use('/api/electrical-panel', electricalPanelRoutes);
app.use('/api/v1/electrical-panel', electricalPanelRoutes);
app.use('/api/electrical-repairing', electricalPanelRoutes);
app.use('/api/v1/electrical-repairing', electricalPanelRoutes);
app.use('/api/water-supplier', waterSupplierRoutes);
app.use('/api/v1/water-supplier', waterSupplierRoutes);
app.use('/api/hydro-crane', hydroCraneRoutes);
app.use('/api/v1/hydro-crane', hydroCraneRoutes);
app.use('/api/crane-service', hydroCraneRoutes);
app.use('/api/v1/crane-service', hydroCraneRoutes);
app.use('/api/ca-tax-advisor', caTaxAdvisorRoutes);
app.use('/api/v1/ca-tax-advisor', caTaxAdvisorRoutes);
app.use('/api/banking-loan', bankingLoanRoutes);
app.use('/api/v1/banking-loan', bankingLoanRoutes);
app.use('/api/banking-services', bankingLoanRoutes);
app.use('/api/v1/banking-services', bankingLoanRoutes);
app.use('/api/hotel-restaurant', hotelRestaurantRoutes);
app.use('/api/v1/hotel-restaurant', hotelRestaurantRoutes);
app.use('/api/hospitality', hotelRestaurantRoutes);
app.use('/api/v1/hospitality', hotelRestaurantRoutes);

app.use('/api/app', appInfoRoutes);

// Mount CMS API Routes
app.use('/api/cms/mining', miningProfileRoutes);
app.use('/api/cms/manufacturer', manufacturerProfileRoutes);
app.use('/api/cms/showroom', showroomProfileRoutes);
app.use('/api/cms/trader', traderProfileRoutes);
app.use('/api/cms/buyer', buyerProfileRoutes);
app.use('/api/cms/transport', transportProfileRoutes);
app.use('/api/cms/brazing', brazingProfileRoutes);
app.use('/api/cms/abrasives', abrasivesProfileRoutes);
app.use('/api/cms/machinery', machineryProfileRoutes);
app.use('/api/cms/mining-equipment', miningEquipmentProfileRoutes);
app.use('/api/cms/solar', solarSolutionsProfileRoutes);
app.use('/api/cms/diamond-blades', diamondBladesProfileRoutes);
app.use('/api/cms/machine-manufacturer', machineManufacturerProfileRoutes);
app.use('/api/cms/powder-supplier', powderSupplierProfileRoutes);
app.use('/api/cms/machine-repairing', machineRepairingRoutes);
app.use('/api/cms/electrical-panel', electricalPanelRoutes);
app.use('/api/cms/water-supplier', waterSupplierRoutes);
app.use('/api/cms/hydro-crane', hydroCraneRoutes);
app.use('/api/cms/ca-tax-advisor', caTaxAdvisorRoutes);
app.use('/api/cms/banking-loan', bankingLoanRoutes);
app.use('/api/cms/hotel-restaurant', hotelRestaurantRoutes);

// Universal Business Management & Catalogue Engine Routes
const adminSuperRoutes = require('./src/routes/adminSuperRoutes');
app.use('/api/admin/super', adminSuperRoutes);
app.use('/api/v1/admin/super', adminSuperRoutes);

app.use('/api/business-types', businessManagementRoutes);
app.use('/api/v1/business-types', businessManagementRoutes);
app.use('/api/businesses', businessManagementRoutes);
app.use('/api/v1/businesses', businessManagementRoutes);
app.use('/api/catalogue', universalCatalogueRoutes);
app.use('/api/v1/catalogue', universalCatalogueRoutes);
app.use('/api/catalog', universalCatalogueRoutes);
app.use('/api/v1/catalog', universalCatalogueRoutes);

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
