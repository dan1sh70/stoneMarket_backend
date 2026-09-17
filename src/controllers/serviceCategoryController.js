const ServiceCategory = require('../models/ServiceCategory');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all active service categories
// @route   GET /api/service-categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await ServiceCategory.find({ status: 'active' }).sort({ sort_order: 1, name: 1 });
    
    // Transform to match required format
    const transformed = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      status: cat.status
    }));

    return res.status(200).json({
      success: true,
      message: 'Service categories retrieved successfully',
      data: {
        items: transformed
      },
      errors: null,
      meta: {
        total: transformed.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seed service categories (utility)
// @route   POST /api/service-categories/seed
// @access  Admin
exports.seedCategories = async (req, res, next) => {
  try {
    const categories = [
      { name: 'Machine Manufacturer', slug: 'machine-manufacturer' },
      { name: 'Machine Repairing', slug: 'machine-repairing' },
      { name: 'Blades & Segments', slug: 'blades-segments' },
      { name: 'Abrasives & Epoxy', slug: 'abrasives-epoxy' },
      { name: 'Machinery Parts', slug: 'machinery-parts' },
      { name: 'Mining Equipment', slug: 'mining-equipment' },
      { name: 'Electric Panel & Repairing', slug: 'electric-panel-repairing' },
      { name: 'Brazing Services', slug: 'brazing-services' },
      { name: 'Water Supplier', slug: 'water-supplier' },
      { name: 'Hotels & Restaurants', slug: 'hotels-restaurants' },
      { name: 'CA & Tax Advisors', slug: 'ca-tax-advisors' },
      { name: 'Banking & Loan Services', slug: 'banking-loan-services' },
      { name: 'Local Taxi Services', slug: 'local-taxi-services' },
      { name: 'Important Contacts', slug: 'important-contacts' },
      { name: 'Solar Services', slug: 'solar-services' },
      { name: 'Powder Supplier', slug: 'powder-supplier' },
      { name: 'Hydro & Crane', slug: 'hydro-crane' }
    ];

    let count = 0;
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const exists = await ServiceCategory.findOne({ slug: cat.slug });
      if (!exists) {
        await ServiceCategory.create({ ...cat, sort_order: i + 1 });
        count++;
      }
    }

    return successResponse(res, `Seeded ${count} categories successfully`, null);
  } catch (err) {
    next(err);
  }
};
