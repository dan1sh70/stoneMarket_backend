const express = require('express');
const router = express.Router();
const {
  getUsers, updateUserStatus,
  getVendors, verifyVendor, updateVendorStatus,
  getListings, deleteListing,
  publishNews, updateNews,
  getAnalytics, sendPushNotification, getLogs
} = require('../controllers/adminController');

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

router.get('/vendors', getVendors);
router.put('/vendors/:id/verify', verifyVendor);
router.put('/vendors/:id/status', updateVendorStatus);

router.get('/listings', getListings);
router.delete('/listings/:id', deleteListing);

router.post('/news', publishNews);
router.put('/news/:id', updateNews);

router.get('/analytics', getAnalytics);
router.post('/notifications/push', sendPushNotification);
router.get('/logs', getLogs);

module.exports = router;
