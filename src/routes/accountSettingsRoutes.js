const express = require('express');
const router = express.Router();
const accountSettingsController = require('../controllers/accountSettingsController');
const { protect } = require('../middleware/auth');

// All settings routes require authentication
router.use(protect);

// Settings Overview
router.get('/', accountSettingsController.getSettingsOverview);

// Notification Preferences
router.get('/notifications', accountSettingsController.getNotificationPreferences);
router.put('/notifications', accountSettingsController.updateNotificationPreferences);

// Quiet Hours
router.get('/quiet-hours', accountSettingsController.getQuietHours);
router.put('/quiet-hours', accountSettingsController.updateQuietHours);

// User Preferences (Language & Appearance)
router.get('/preferences', accountSettingsController.getUserPreferences);
router.put('/preferences', accountSettingsController.updateUserPreferences);

// Account & Security
router.post('/change-password', accountSettingsController.changePassword);
router.get('/sessions', accountSettingsController.getActiveSessions);
router.delete('/sessions/:id', accountSettingsController.terminateSession);
router.post('/logout-all', accountSettingsController.logoutAllDevices);
router.post('/logout', accountSettingsController.logoutCurrentSession);

// More Settings (About & Help Support)
router.get('/about', accountSettingsController.getAboutApp);
router.get('/help-support', accountSettingsController.getHelpAndSupport);

module.exports = router;
