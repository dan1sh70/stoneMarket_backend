const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSlabEstimate,
  listSlabEstimates,
  getSlabEstimate,
  updateSlabEstimate,
  deleteSlabEstimate,
  getSlabEstimatePdf,

  createParticularEstimate,
  listParticularEstimates,
  getParticularEstimate,
  updateParticularEstimate,
  deleteParticularEstimate,
  getParticularEstimatePdf,

  addPayment,
  getPayments,
  reversePayment,

  listAllEstimates,
  getEstimateById,
  finalizeEstimate,
  cancelEstimate,
  getMeasurementUnits
} = require('../controllers/estimateController');

// All estimate endpoints require authentication
router.use(protect);

// ----------------------------------------------------
// Units Catalogue
// ----------------------------------------------------
router.get('/units', getMeasurementUnits);

// ----------------------------------------------------
// Slab Estimates
// ----------------------------------------------------
router.post('/slab', createSlabEstimate);
router.get('/slab', listSlabEstimates);
router.get('/slab/:id', getSlabEstimate);
router.put('/slab/:id', updateSlabEstimate);
router.delete('/slab/:id', deleteSlabEstimate);
router.get('/slab/:id/pdf', getSlabEstimatePdf);

// ----------------------------------------------------
// Particular Estimates
// ----------------------------------------------------
router.post('/particular', createParticularEstimate);
router.get('/particular', listParticularEstimates);
router.get('/particular/:id', getParticularEstimate);
router.put('/particular/:id', updateParticularEstimate);
router.delete('/particular/:id', deleteParticularEstimate);
router.get('/particular/:id/pdf', getParticularEstimatePdf);

// Payments on Particular Estimates
router.post('/particular/:id/payments', addPayment);
router.get('/particular/:id/payments', getPayments);
router.post('/particular/:id/payments/:payment_id/reverse', reversePayment);

// ----------------------------------------------------
// Shared Operations
// ----------------------------------------------------
router.get('/', listAllEstimates);
router.get('/:id', getEstimateById);
router.post('/:id/finalize', finalizeEstimate);
router.post('/:id/cancel', cancelEstimate);

module.exports = router;
