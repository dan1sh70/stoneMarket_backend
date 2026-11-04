const Product = require('../models/Product');
const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to resolve caller's active business profile
async function resolveActiveProfile(req) {
  const userId = req.user.userId || req.user.id || req.user._id;
  const explicitBusinessId = req.headers['x-business-id'] || req.query.business_id;

  if (explicitBusinessId) {
    const profile = await BusinessProfile.findOne({ _id: explicitBusinessId, userId });
    if (profile) return profile;
  }

  let profile = await BusinessProfile.findOne({ userId, business_type: req.user.role });
  if (!profile) {
    profile = await BusinessProfile.findOne({ userId }).sort({ createdAt: -1 });
  }
  return profile;
}

/**
 * Universal Catalogue CRUD & 4-Step Publishing Controller
 */

// GET /api/catalogue
async function listCatalogue(req, res) {
  try {
    const profile = await resolveActiveProfile(req);
    const {
      search,
      category,
      status,
      business_type,
      min_price,
      max_price,
      sort_by = 'createdAt',
      sort_order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Scope to business if requested, or user's active profile
    if (profile) {
      query.$or = [{ businessProfileId: profile._id }, { vendorId: profile._id }];
    }

    if (business_type) {
      query.business_type = business_type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = Number(min_price);
      if (max_price) query.price.$lte = Number(max_price);
    }

    if (search) {
      const reg = new RegExp(search, 'i');
      query.$or = [
        { name: reg },
        { category: reg },
        { description: reg },
        { sku: reg }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortObj = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit, 10)),
      Product.countDocuments(query)
    ]);

    return successResponse(res, 'Catalogue listings retrieved successfully', {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      items
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// POST /api/catalogue - Create new listing draft
async function createCatalogueListing(req, res) {
  try {
    const profile = await resolveActiveProfile(req);
    const userId = req.user.userId || req.user.id || req.user._id;

    const bType = req.body.business_type || (profile ? profile.business_type : req.user.role) || 'manufacturer';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const defaultSku = `CAT-${new Date().getFullYear()}-${rand}`;

    const listingData = {
      ...req.body,
      userId,
      businessProfileId: profile ? profile._id : req.body.businessProfileId,
      vendorId: profile ? profile._id : req.body.vendorId,
      business_type: bType,
      name: req.body.name || req.body.title || 'Untitled Draft Listing',
      sku: req.body.sku || defaultSku,
      status: req.body.status || 'draft',
      publishing_status: req.body.publishing_status || 'draft',
      publishing_steps: {
        step_1_completed: !!(req.body.name && req.body.category),
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false
      }
    };

    const listing = await Product.create(listingData);
    return successResponse(res, 'Catalogue listing created successfully', listing, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// GET /api/catalogue/:id
async function getCatalogueListingById(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    return successResponse(res, 'Catalogue listing details retrieved successfully', listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// PUT /api/catalogue/:id
async function updateCatalogueListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    if (req.body.title && !req.body.name) req.body.name = req.body.title;
    if (req.body.selling_price !== undefined) req.body.price = req.body.selling_price;
    if (req.body.price !== undefined && req.body.selling_price === undefined) req.body.selling_price = req.body.price;

    Object.assign(listing, req.body);
    await listing.save();

    return successResponse(res, 'Catalogue listing updated successfully', listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// DELETE /api/catalogue/:id
async function deleteCatalogueListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    await Product.findByIdAndDelete(id);
    return successResponse(res, 'Catalogue listing deleted successfully', { id });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// POST /api/catalogue/:id/duplicate
async function duplicateCatalogueListing(req, res) {
  try {
    const { id } = req.params;
    const original = await Product.findById(id);
    if (!original) return errorResponse(res, 'Catalogue listing not found', null, 404);

    const copyObj = original.toObject();
    delete copyObj._id;
    delete copyObj.createdAt;
    delete copyObj.updatedAt;

    copyObj.name = `${copyObj.name} (Copy)`;
    copyObj.sku = `CAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    copyObj.status = 'draft';
    copyObj.publishing_status = 'draft';
    copyObj.views = 0;
    copyObj.views_count = 0;
    copyObj.inquiries_count = 0;

    const copy = await Product.create(copyObj);
    return successResponse(res, 'Catalogue listing duplicated as draft successfully', copy, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// PATCH /api/catalogue/:id/status
async function toggleCatalogueListingStatus(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    const newStatus = req.body.status || (listing.status === 'active' ? 'inactive' : 'active');
    listing.status = newStatus;
    if (newStatus === 'active') listing.publishing_status = 'published';
    await listing.save();

    return successResponse(res, `Catalogue listing status updated to ${newStatus}`, listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ========================================================
// 4-STEP PUBLISHING WIZARD ENDPOINTS
// ========================================================

// POST /api/catalogue/:id/steps/basic
async function saveStepBasic(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    const updates = {
      name: req.body.name || req.body.title || listing.name,
      category: req.body.category || listing.category,
      description: req.body.description !== undefined ? req.body.description : listing.description,
      short_description: req.body.short_description || listing.short_description,
      images: req.body.images || listing.images,
      cover_image: req.body.cover_image || listing.cover_image,
      videos: req.body.videos || listing.videos
    };

    Object.assign(listing, updates);
    await listing.save();

    return successResponse(res, 'Step 1 (Basic & Media) saved successfully', listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// POST /api/catalogue/:id/steps/specifications
async function saveStepSpecifications(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    // Apply any domain-specific technical fields directly or into technical_specifications
    Object.assign(listing, req.body);
    await listing.save();

    return successResponse(res, 'Step 2 (Technical Specifications) saved successfully', listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// POST /api/catalogue/:id/steps/pricing
async function saveStepPricing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    const price = req.body.selling_price !== undefined ? req.body.selling_price : req.body.price;
    const updates = {
      price,
      selling_price: price,
      pricing_unit: req.body.pricing_unit || listing.pricing_unit,
      min_order_quantity: req.body.min_order_quantity !== undefined ? req.body.min_order_quantity : listing.min_order_quantity,
      stock: req.body.stock !== undefined ? req.body.stock : listing.stock,
      available_stock: req.body.stock !== undefined ? req.body.stock : listing.available_stock,
      availability_status: req.body.availability_status || listing.availability_status,
      lead_time: req.body.lead_time || listing.lead_time,
      delivery_available: req.body.delivery_available !== undefined ? req.body.delivery_available : listing.delivery_available
    };

    Object.assign(listing, updates);
    await listing.save();

    return successResponse(res, 'Step 3 (Pricing & Supply/Rental) saved successfully', listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// GET /api/catalogue/:id/review
async function getListingReviewPreview(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    const profile = listing.businessProfileId ? await BusinessProfile.findById(listing.businessProfileId) : null;

    const reviewData = {
      listing_id: listing._id,
      title: listing.name,
      category: listing.category,
      business_type: listing.business_type,
      business_name: profile ? profile.company_name : 'Stone Business',
      price: listing.selling_price || listing.price,
      pricing_unit: listing.pricing_unit,
      availability: listing.availability_status,
      target_areas: listing.target_areas || [],
      target_categories: listing.target_categories || [],
      cover_image: listing.cover_image || (listing.images && listing.images[0]),
      is_publishable: !!(listing.name && listing.category && (listing.selling_price !== undefined || listing.price !== undefined)),
      details: listing
    };

    return successResponse(res, 'Listing review preview generated successfully', reviewData);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// POST /api/catalogue/:id/publish
async function publishCatalogueListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Product.findById(id);
    if (!listing) return errorResponse(res, 'Catalogue listing not found', null, 404);

    if (req.body.target_areas) listing.target_areas = req.body.target_areas;
    if (req.body.target_categories) listing.target_categories = req.body.target_categories;

    listing.status = 'active';
    listing.publishing_status = 'published';
    await listing.save();

    return successResponse(res, 'Listing published successfully', listing);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

module.exports = {
  listCatalogue,
  createCatalogueListing,
  getCatalogueListingById,
  updateCatalogueListing,
  deleteCatalogueListing,
  duplicateCatalogueListing,
  toggleCatalogueListingStatus,
  saveStepBasic,
  saveStepSpecifications,
  saveStepPricing,
  getListingReviewPreview,
  publishCatalogueListing
};

