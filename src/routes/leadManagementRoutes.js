const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadManagementController');
const { protect } = require('../middleware/auth');

// Public shared lead preview (no authentication required)
router.get('/shared/:token', leadController.getSharedLeadPublic);

// All other manufacturer lead routes require authentication
router.use(protect);

// Lead Listing & Statistics
router.get('/', leadController.getManufacturerLeads);
router.get('/statistics', leadController.getLeadStatistics);
router.get('/search', leadController.searchLeads);

// Specific Lead Details & Tabs
router.get('/:id', leadController.getLeadDetails);
router.get('/:id/requirements', leadController.getLeadRequirements);
router.get('/:id/messages', leadController.getLeadMessages);
router.post('/:id/messages', leadController.sendLeadMessage);
router.get('/:id/quotes', leadController.getLeadQuotes);
router.post('/:id/quotes', leadController.createLeadQuote);
router.get('/:id/notes', leadController.getLeadNotes);
router.post('/:id/notes', leadController.createLeadNote);
router.put('/:id/notes/:noteId', leadController.updateLeadNote);
router.delete('/:id/notes/:noteId', leadController.deleteLeadNote);
router.get('/:id/history', leadController.getLeadHistory);

// Status Transition & Bottom Actions
router.post('/:id/status', leadController.updateLeadStatus);
router.post('/:id/share', leadController.shareLead);
router.get('/:id/download', leadController.downloadLeadPdf);
router.post('/:id/contact-log', leadController.logContactAction);

module.exports = router;
