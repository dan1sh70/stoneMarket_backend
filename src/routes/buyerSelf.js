const express = require('express');
const router = express.Router();
const {
  getMyRequirements,
  createRequirement,
  getRequirementById,
  updateRequirement,
  deleteRequirement
} = require('../controllers/buyerRequirementController');
const { getBuyerQuotes } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

// All /api/buyer/* routes are private to authenticated buyers
router.use(protect);

router.get('/requirements', getMyRequirements);
router.post('/requirements', createRequirement);
router.get('/requirements/:requirement_id', getRequirementById);
router.put('/requirements/:requirement_id', updateRequirement);
router.delete('/requirements/:requirement_id', deleteRequirement);

router.get('/quotes', getBuyerQuotes);

module.exports = router;
