const express = require('express');
const router = express.Router();
const {
  getGraniteColors,
  getStates,
  getDistricts,
  getAreas
} = require('../controllers/masterDataController');

router.get('/granite-colors', getGraniteColors);
router.get('/locations/states', getStates);
router.get('/locations/states/:stateId/districts', getDistricts);
router.get('/locations/districts/:districtId/areas', getAreas);

module.exports = router;
