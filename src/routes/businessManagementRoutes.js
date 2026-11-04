const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSystemBusinessTypes,
  getUserBusinesses,
  createUserBusiness,
  getActiveBusinessContext,
  switchUserBusiness,
  getBusinessById,
  updateBusinessById
} = require('../controllers/businessManagementController');

// All business management routes require authentication
router.use(protect);

router.get('/business-types', getSystemBusinessTypes);
router.get('/', (req, res, next) => {
  if (req.baseUrl.includes('business-types')) {
    return getSystemBusinessTypes(req, res, next);
  }
  return getUserBusinesses(req, res, next);
});
router.post('/', createUserBusiness);
router.get('/active', getActiveBusinessContext);
router.post('/switch', switchUserBusiness);
router.get('/:id', getBusinessById);
router.put('/:id', updateBusinessById);

module.exports = router;
