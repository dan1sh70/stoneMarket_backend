const Location = require('../models/Location');
const GraniteColor = require('../models/GraniteColor');
const BuyerType = require('../models/BuyerType');
const ShowroomProductType = require('../models/ShowroomProductType');
const ManufacturerCategory = require('../models/ManufacturerCategory');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get Marketplace Form Options and Dropdown Values
// @route   GET /api/marketplace/form-options or /api/buyers/form-options
// @access  Public
exports.getFormOptions = async (req, res, next) => {
  try {
    const [locations, colors, buyerTypes, showroomTypes, mfgCategories] = await Promise.all([
      Location.find().select('name districts.name districts._id').lean(),
      GraniteColor.find({ status: 'active' }).select('name image').lean(),
      BuyerType.find({ status: 'active' }).select('name slug').sort({ sort_order: 1 }).lean(),
      ShowroomProductType.find({ status: 'active' }).select('name slug').sort({ sort_order: 1 }).lean(),
      ManufacturerCategory.find({ status: 'active' }).select('name slug').sort({ sort_order: 1 }).lean()
    ]);

    const quantityUnits = [
      { id: 'sqft', name: 'Sq.Ft (Square Feet)' },
      { id: 'sqm', name: 'Sq.Mtr (Square Meter)' },
      { id: 'ton', name: 'Tons' },
      { id: 'pieces', name: 'Pieces' },
      { id: 'cbm', name: 'CBM (Cubic Meter)' },
      { id: 'containers', name: 'Container Loads' }
    ];

    const materials = [
      'Granite',
      'Marble',
      'Italian Marble',
      'Sandstone',
      'Limestone',
      'Quartz',
      'Onyx',
      'Travertine',
      'Slate'
    ];

    const finishes = [
      'Polished',
      'Honed',
      'Flamed',
      'Leather',
      'Bush Hammered',
      'Lappato',
      'Sandblasted',
      'Shot Blasted',
      'Antique'
    ];

    const grades = [
      'Commercial Grade',
      'Standard Grade',
      'Premium Grade',
      'Export Grade'
    ];

    const thicknesses = [
      '12mm',
      '16mm',
      '18mm',
      '20mm',
      '25mm',
      '30mm',
      '40mm',
      '50mm+'
    ];

    const referralSources = [
      'Google Search',
      'Industry Referral',
      'Social Media',
      'Trade Exhibition',
      'Existing Partner',
      'Other'
    ];

    // Combine product types
    const productTypesMap = new Map();
    showroomTypes.forEach(t => productTypesMap.set(t.name, { name: t.name, slug: t.slug }));
    mfgCategories.forEach(m => productTypesMap.set(m.name, { name: m.name, slug: m.slug }));
    const productTypes = Array.from(productTypesMap.values());

    // Delivery states
    const states = locations.map(l => ({
      id: l._id,
      name: l.name,
      cities: l.districts ? l.districts.map(d => ({ id: d._id, name: d.name })) : []
    }));

    return successResponse(res, 'Marketplace form options retrieved successfully', {
      quantity_units: quantityUnits,
      materials,
      stone_colors: colors,
      buyer_types: buyerTypes,
      product_types: productTypes,
      finishes,
      grades,
      thicknesses,
      delivery_locations: states,
      referral_sources: referralSources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload attachments for inquiries or quotes
// @route   POST /api/marketplace/upload
// @access  Private (Authenticated users)
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      // Single file fallback
      if (req.file) {
        return successResponse(res, 'File uploaded successfully', {
          url: req.file.location || `https://domain.com/storage/attachments/${Date.now()}-${req.file.originalname}`,
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }, 201);
      }
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploaded = req.files.map(f => ({
      url: f.location || `https://domain.com/storage/attachments/${Date.now()}-${f.originalname}`,
      filename: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    }));

    return successResponse(res, 'Files uploaded successfully', uploaded, 201);
  } catch (err) {
    next(err);
  }
};
