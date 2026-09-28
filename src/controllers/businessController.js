const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getBusinessProfile = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findById(req.params.id)
      .populate('service_categories', 'name slug icon')
      .populate('granite_colors', 'name hex')
      .lean();

    if (!profile || profile.status !== 'active') {
      return errorResponse(res, 'Business not found or inactive', null, 404);
    }

    // Determine type to fetch related products or services if necessary
    // Here we just fetch their top 5 products if they are product-based
    let products = [];
    if (['mining', 'manufacturer', 'showroom', 'trader'].includes(profile.business_type)) {
      // Typically BusinessProfile.userId == Product.vendorId.userId but 
      // depends on how vendor vs business profile mapping is implemented.
      // We will try fetching by Vendor if userId is matched.
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findOne({ userId: profile.userId });
      if (vendor) {
        products = await Product.find({ vendorId: vendor._id, status: 'active' }).limit(5).lean();
      }
    }

    const publicProfile = {
      id: profile._id,
      name: profile.company_name,
      type: profile.business_type,
      location: profile.address,
      about: profile.company_details,
      contact: {
        phone: profile.owners?.[0]?.phone,
        whatsapp: profile.owners?.[0]?.whatsapp,
      },
      services: profile.service_categories,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.priceRange?.min,
        unit: p.priceRange?.unit,
        image: p.images?.[0]
      })),
      verified: true
    };

    return successResponse(res, 'Business profile retrieved', publicProfile);
  } catch (err) {
    next(err);
  }
};
