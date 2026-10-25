const express = require('express');
const router = express.Router();
const { getFormOptions, uploadAttachment } = require('../controllers/marketplaceController');
const attachmentUpload = require('../middleware/attachmentUpload');
const { protect } = require('../middleware/auth');

router.get('/form-options', getFormOptions);
router.post('/upload', protect, attachmentUpload.array('attachments', 5), uploadAttachment);

module.exports = router;
