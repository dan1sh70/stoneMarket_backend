const express = require('express');
const router = express.Router();
const {
  processStep,
  getRegistration,
  submitRegistration
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

// Require authentication for all registration routes
router.use(protect);

router.post('/:type/step-:step', processStep);
router.get('/:registration_id', getRegistration);
router.post('/:registration_id/submit', submitRegistration);

module.exports = router;
