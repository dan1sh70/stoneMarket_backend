const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { matchStoneByImage, parseEstimateFromImage } = require('../services/visionOcrService');
const Estimate = require('../models/Estimate');

// Multer memory storage for in-memory Vision API streaming
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max image
});

/**
 * ----------------------------------------------------------------------
 * POST /api/v1/ocr/stone-match
 * Image recognition: finds exact or nearby matches for natural stone
 * ----------------------------------------------------------------------
 */
router.post('/stone-match', upload.single('image'), async (req, res) => {
  try {
    let base64Image = '';
    let mimeType = 'image/jpeg';

    if (req.file) {
      base64Image = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body.image) {
      base64Image = req.body.image;
      mimeType = req.body.mimeType || 'image/jpeg';
    } else {
      return errorResponse(res, 'No image provided. Upload a file or pass base64 image data.', null, 400);
    }

    const maxResults = Number(req.body.maxResults) || 8;
    const result = await matchStoneByImage({ base64Image, mimeType, maxResults });

    return successResponse(res, 'Stone image analysis and catalogue matching completed', result);
  } catch (err) {
    console.error('OCR stone match error:', err);
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * ----------------------------------------------------------------------
 * POST /api/v1/ocr/estimate-parse
 * Document OCR: extracts handwritten/printed measurements for slab & particular
 * ----------------------------------------------------------------------
 */
router.post('/estimate-parse', upload.single('image'), async (req, res) => {
  try {
    let base64Image = '';
    let mimeType = 'image/jpeg';

    if (req.file) {
      base64Image = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body.image) {
      base64Image = req.body.image;
      mimeType = req.body.mimeType || 'image/jpeg';
    } else {
      return errorResponse(res, 'No image provided. Upload a file or pass base64 image data.', null, 400);
    }

    const estimateType = req.body.estimateType || 'auto'; // 'slab' | 'particular' | 'auto'
    const parsedData = await parseEstimateFromImage({ base64Image, mimeType, estimateType });

    return successResponse(res, 'Estimate document processed and calculated successfully', parsedData);
  } catch (err) {
    console.error('OCR estimate parse error:', err);
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * ----------------------------------------------------------------------
 * POST /api/v1/ocr/save-parsed-estimate
 * Directly saves parsed OCR estimate into the MongoDB Estimate ledger
 * ----------------------------------------------------------------------
 */
router.post('/save-parsed-estimate', protect, async (req, res) => {
  try {
    const {
      type, // 'slab' | 'particular'
      customer_name,
      customer_mobile,
      measurement_unit,
      area_unit,
      unit_price,
      rows,
      items,
      raw_notes
    } = req.body;

    const count = await Estimate.countDocuments();
    const estimateNumber = `EST-${Date.now().toString().slice(-6)}-${count + 1}`;

    const estimateDoc = new Estimate({
      userId: req.user._id,
      estimate_type: type === 'particular' ? 'particular' : 'slab',
      estimate_number: estimateNumber,
      customer_name: customer_name || 'Customer',
      customer_mobile: customer_mobile || '',
      measurement_unit: measurement_unit || 'inch',
      area_unit: area_unit || 'sqft',
      unit_price: unit_price || 0,
      rows: rows || [],
      items: items || [],
      notes: raw_notes || 'Created via Vision OCR scan',
      status: 'draft'
    });

    await estimateDoc.save();

    return successResponse(res, 'Parsed estimate saved to ledger successfully', estimateDoc, 201);
  } catch (err) {
    console.error('Save parsed estimate error:', err);
    return errorResponse(res, err.message, err, 500);
  }
});

module.exports = router;
