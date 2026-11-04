const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  machineRepairingController,
  electricalPanelController,
  waterSupplierController,
  hydroCraneController,
  caTaxAdvisorController,
  bankingLoanController,
  hotelRestaurantController
} = require('../controllers/extendedServicesController');

const {
  createMachineRepairingSchema,
  updateMachineRepairingSchema,
  createElectricalPanelSchema,
  updateElectricalPanelSchema,
  createWaterSupplierSchema,
  updateWaterSupplierSchema,
  createHydroCraneSchema,
  updateHydroCraneSchema,
  createCaTaxAdvisorSchema,
  updateCaTaxAdvisorSchema,
  createBankingLoanSchema,
  updateBankingLoanSchema,
  createHotelRestaurantSchema,
  updateHotelRestaurantSchema,
  updateServiceBusinessProfileSchema,
  serviceContactSchema,
  serviceGalleryPhotoSchema,
  serviceGalleryVideoSchema,
  serviceGstVerifySchema,
  serviceAnalyticsEventSchema
} = require('../validations/extendedServices.validation');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'srv-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

function buildServiceRouter(controller, createSchema, updateSchema, resourcePlural = 'services') {
  const router = express.Router();
  router.use(protect);

  // 1. Dashboard & Business Switcher
  router.get('/dashboard', controller.getDashboard);
  router.get('/business-types', controller.getBusinessTypes);
  router.post('/switch-business-type', controller.switchBusinessType);
  router.post('/switch-type', controller.switchBusinessType);

  // 2. Profile Management
  router.get('/profile', controller.getProfile);
  router.put('/profile', validate(updateServiceBusinessProfileSchema), controller.updateProfile);

  // 3. Catalogue / Management endpoints
  // Primary endpoint e.g. /services, /supplies, /listings, or /catalog
  router.get('/catalog', controller.getItems);
  router.post('/catalog', validate(createSchema), controller.createItem);
  router.get('/catalog/:id', controller.getItemById);
  router.put('/catalog/:id', validate(updateSchema), controller.updateItem);
  router.post('/catalog/:id/duplicate', controller.duplicateItem);
  router.patch('/catalog/:id/status', controller.toggleItemStatus);
  router.delete('/catalog/:id', controller.deleteItem);

  // Resource plural alias e.g. /services, /supplies, /listings
  router.get(`/${resourcePlural}`, controller.getItems);
  router.post(`/${resourcePlural}`, validate(createSchema), controller.createItem);
  router.get(`/${resourcePlural}/:id`, controller.getItemById);
  router.put(`/${resourcePlural}/:id`, validate(updateSchema), controller.updateItem);
  router.post(`/${resourcePlural}/:id/duplicate`, controller.duplicateItem);
  router.patch(`/${resourcePlural}/:id/status`, controller.toggleItemStatus);
  router.delete(`/${resourcePlural}/:id`, controller.deleteItem);

  // General items / products aliases
  router.get('/items', controller.getItems);
  router.post('/items', validate(createSchema), controller.createItem);
  router.get('/items/:id', controller.getItemById);
  router.put('/items/:id', validate(updateSchema), controller.updateItem);
  router.post('/items/:id/duplicate', controller.duplicateItem);
  router.patch('/items/:id/status', controller.toggleItemStatus);
  router.delete('/items/:id', controller.deleteItem);

  // 4. Contacts
  router.get('/contacts', controller.getContacts);
  router.post('/contacts', validate(serviceContactSchema), controller.addContact);

  // 5. Gallery
  router.get('/gallery', controller.getGallery);
  router.post('/gallery/photos', upload.single('photo'), validate(serviceGalleryPhotoSchema), controller.uploadGalleryPhoto);
  router.post('/gallery/videos', validate(serviceGalleryVideoSchema), controller.addGalleryVideo);

  // 6. Verification
  router.get('/verification', controller.getVerificationStatus);
  router.post('/verification/gst', validate(serviceGstVerifySchema), controller.verifyGst);

  // 7. Analytics
  router.get('/analytics', controller.getAnalytics);
  router.post('/analytics/event', validate(serviceAnalyticsEventSchema), controller.recordAnalyticsEvent);
  router.post('/analytics/events', validate(serviceAnalyticsEventSchema), controller.recordAnalyticsEvent);

  // 8. Inquiries & Leads
  router.get('/inquiries', controller.getInquiries);
  router.get('/leads', controller.getLeads);

  return router;
}

const machineRepairingRoutes = buildServiceRouter(machineRepairingController, createMachineRepairingSchema, updateMachineRepairingSchema, 'services');
const electricalPanelRoutes = buildServiceRouter(electricalPanelController, createElectricalPanelSchema, updateElectricalPanelSchema, 'services');
const waterSupplierRoutes = buildServiceRouter(waterSupplierController, createWaterSupplierSchema, updateWaterSupplierSchema, 'supplies');
const hydroCraneRoutes = buildServiceRouter(hydroCraneController, createHydroCraneSchema, updateHydroCraneSchema, 'equipment');
const caTaxAdvisorRoutes = buildServiceRouter(caTaxAdvisorController, createCaTaxAdvisorSchema, updateCaTaxAdvisorSchema, 'services');
const bankingLoanRoutes = buildServiceRouter(bankingLoanController, createBankingLoanSchema, updateBankingLoanSchema, 'services');
const hotelRestaurantRoutes = buildServiceRouter(hotelRestaurantController, createHotelRestaurantSchema, updateHotelRestaurantSchema, 'listings');

module.exports = {
  machineRepairingRoutes,
  electricalPanelRoutes,
  waterSupplierRoutes,
  hydroCraneRoutes,
  caTaxAdvisorRoutes,
  bankingLoanRoutes,
  hotelRestaurantRoutes
};

