const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateProfileSchema,
  personalDetailsSchema,
  verifyMobileSchema,
  verifyOtpSchema,
  quoteRequestSchema,
  compareQuotesSchema,
  addressSchema,
  supportTicketSchema,
  ticketMessageSchema,
  changePasswordSchema,
  notificationSettingsSchema,
  quietHoursSchema,
  preferencesSchema
} = require('../validations/customer.validation');

// All customer routes require authentication
router.use(protect);

// ==========================================
// 1. CUSTOMER PROFILE & DASHBOARD
// ==========================================
router.get('/profile', customerController.getProfile);
router.put('/profile', validate(updateProfileSchema), customerController.updateProfile);
router.post('/profile/photo', attachmentUpload.single('photo'), customerController.uploadPhoto);
router.delete('/profile/photo', customerController.removePhoto);
router.get('/dashboard', customerController.getDashboard);

// ==========================================
// 2. PERSONAL DETAILS MANAGEMENT
// ==========================================
router.get('/personal-details', customerController.getPersonalDetails);
router.put('/personal-details', validate(personalDetailsSchema), customerController.updatePersonalDetails);
router.post('/personal-details/verify-mobile', validate(verifyMobileSchema), customerController.requestMobileChangeOTP);
router.post('/personal-details/verify-otp', validate(verifyOtpSchema), customerController.verifyMobileChangeOTP);

// ==========================================
// 3. MY INQUIRIES MODULE
// ==========================================
router.get('/inquiries', customerController.getInquiries);
router.get('/inquiries/:inquiry_id/details', customerController.getInquiryById);
router.get('/inquiries/:inquiry_id/tracking', customerController.getInquiryTracking);
router.get('/inquiries/:inquiry_id/status-history', customerController.getInquiryStatusHistory);
router.get('/inquiries/:inquiry_id/attachments', customerController.getInquiryAttachments);
router.get('/inquiries/:inquiry_id/download', customerController.downloadInquiryPdf);
router.post('/inquiries/:inquiry_id/close', customerController.closeInquiry);
router.get('/inquiries/:inquiry_id/quotations/compare', customerController.compareInquiryQuotations);
router.get('/inquiries/:inquiry_id/quotations', customerController.getInquiryQuotations);
router.get('/inquiries/:inquiry_id', customerController.getInquiryById);

// ==========================================
// 4. GET QUOTES MODULE
// ==========================================
router.get('/quotes/request-options', customerController.getQuoteRequestOptions);
router.post('/quotes/request', validate(quoteRequestSchema), customerController.requestQuote);
router.get('/quotes/requests', customerController.getQuoteRequests);
router.get('/quotes/requests/:id', customerController.getQuoteRequestById);

// ==========================================
// 5. CUSTOMER QUOTATIONS & COMPARISON
// ==========================================
router.get('/quotations', customerController.getQuotations);
router.post('/quotations/compare', validate(compareQuotesSchema), customerController.compareQuotations);
router.get('/quotations/:quote_id/download', customerController.downloadQuotationPdf);
router.get('/quotations/:quote_id', customerController.getQuotationById);

// ==========================================
// 6. QUOTES & ESTIMATES HISTORY
// ==========================================
router.get('/estimates', customerController.getEstimates);
router.post('/estimates', customerController.createEstimate);
router.get('/estimates/:estimate_id/download', customerController.downloadEstimatePdf);
router.get('/estimates/:estimate_id', customerController.getEstimateById);
router.put('/estimates/:estimate_id', customerController.updateEstimate);
router.delete('/estimates/:estimate_id', customerController.deleteEstimate);

// ==========================================
// 7. SAVED STONES & FAVORITES
// ==========================================
router.get('/favorites', customerController.getFavorites);
router.post('/favorites', customerController.addFavorite);
router.delete('/favorites/:product_id', customerController.removeFavorite);
router.get('/favorites/check/:product_id', customerController.checkFavorite);

// ==========================================
// 8. DELIVERY & PROJECT ADDRESSES
// ==========================================
router.get('/addresses', customerController.getAddresses);
router.post('/addresses', validate(addressSchema), customerController.createAddress);
router.get('/addresses/:address_id', customerController.getAddressById);
router.put('/addresses/:address_id', customerController.updateAddress);
router.delete('/addresses/:address_id', customerController.deleteAddress);
router.patch('/addresses/:address_id/default', customerController.setDefaultAddress);

// ==========================================
// 9. NOTIFICATIONS & PREFERENCES
// ==========================================
router.get('/notifications', customerController.getNotifications);
router.get('/notifications/unread-count', customerController.getUnreadNotificationCount);
router.patch('/notifications/read-all', customerController.markAllNotificationsAsRead);
router.delete('/notifications', customerController.clearAllNotifications);
router.get('/notifications/:notification_id', customerController.getNotificationById);
router.patch('/notifications/:notification_id/read', customerController.markNotificationAsRead);
router.delete('/notifications/:notification_id', customerController.deleteNotification);

// Notification Settings & Quiet Hours
router.get('/settings/notifications', customerController.getNotificationSettings);
router.put('/settings/notifications', validate(notificationSettingsSchema), customerController.updateNotificationSettings);
router.patch('/settings/notifications/:category', customerController.toggleNotificationCategory);
router.get('/settings/quiet-hours', customerController.getQuietHours);
router.put('/settings/quiet-hours', validate(quietHoursSchema), customerController.updateQuietHours);

// ==========================================
// 10. ACCOUNT SECURITY & SESSIONS
// ==========================================
router.get('/account-information', customerController.getAccountInformation);
router.put('/account-information', customerController.updateAccountInformation);
router.put('/security/change-password', validate(changePasswordSchema), customerController.changePassword);
router.get('/security/sessions', customerController.getSessions);
router.delete('/security/sessions/:session_id', customerController.revokeSession);
router.delete('/security/sessions', customerController.revokeAllSessions);

// Language & Appearance Settings
router.get('/settings/preferences', customerController.getPreferences);
router.put('/settings/preferences', validate(preferencesSchema), customerController.updatePreferences);

// ==========================================
// 11. HELP & SUPPORT
// ==========================================
router.get('/support/faqs', customerController.getFaqs);
router.get('/support/tickets', customerController.getTickets);
router.post('/support/tickets', validate(supportTicketSchema), customerController.createTicket);
router.get('/support/tickets/:ticket_id', customerController.getTicketById);
router.get('/support/tickets/:ticket_id/messages', customerController.getTicketMessages);
router.post('/support/tickets/:ticket_id/messages', validate(ticketMessageSchema), customerController.addTicketMessage);

// ==========================================
// 12. LOGOUT
// ==========================================
router.post('/logout', customerController.logout);

module.exports = router;
