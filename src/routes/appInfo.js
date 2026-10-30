const express = require('express');
const router = express.Router();
const appInfoController = require('../controllers/appInfoController');

// Public App Info Routes
router.get('/about', appInfoController.getAbout);
router.get('/version', appInfoController.getVersion);
router.get('/policies', appInfoController.getPolicies);

module.exports = router;
