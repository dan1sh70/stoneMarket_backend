const BusinessProfile = require('../models/BusinessProfile');
const BuyerType = require('../models/BuyerType');
const BuyerRequirement = require('../models/BuyerRequirement');
const BuyerReview = require('../models/BuyerReview');
const BusinessFavorite = require('../models/BusinessFavorite');
const Location = require('../models/Location');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to build buyer match query
const buildBuyerMatchQuery = async (params) => {
  const {
    state,
    state_id,
    district,
    city,
    city_id,
    area,
    buyer_type,
    category_id,
    industry,
    material,
    product,
    requirement,
    verified,
    search,
    min_rating
  } = params;

  let query = { business_type: 'buyer', status: 'active' };

  if (search) {
    query.$or = [
      { company_name: { $regex: new RegExp(search, 'i') } },
      { company_details: { $regex: new RegExp(search, 'i') } },
      { requirement_summary: { $regex: new RegExp(search, 'i') } }
    ];
  }

  // State filtering
  if (state_id) {
    const locState = await Location.findById(state_id).lean();
    if (locState) {
      query['address.state'] = { $regex: new RegExp(`^${locState.name}$`, 'i') };
    }
  } else if (state) {
    query['address.state'] = { $regex: new RegExp(state, 'i') };
  }

  // City / District filtering
  if (city_id) {
    // Search district in location
    const locWithDist = await Location.findOne({ 'districts._id': city_id }).lean();
    const matchedDist = locWithDist?.districts?.find(d => d._id.toString() === city_id.toString());
    if (matchedDist) {
      query['address.district'] = { $regex: new RegExp(`^${matchedDist.name}$`, 'i') };
    }
  } else if (city || district) {
    query['address.district'] = { $regex: new RegExp(city || district, 'i') };
  }

  if (area) {
    query['address.area'] = { $regex: new RegExp(area, 'i') };
  }

  // Buyer type filtering
  if (buyer_type || category_id) {
    const typeQuery = buyer_type || category_id;
    // Check if it's an ObjectId or slug/name
    if (/^[0-9a-fA-F]{24}$/.test(typeQuery)) {
      query.buyer_types = typeQuery;
    } else {
      const bType = await BuyerType.findOne({
        $or: [
          { slug: typeQuery.toLowerCase() },
          { name: { $regex: new RegExp(typeQuery, 'i') } }
        ]
      }).lean();
      if (bType) {
        query.buyer_types = bType._id;
      } else {
        query.buyer_types = null; // No match found
      }
    }
  }

  if (industry) {
    query.industry = { $regex: new RegExp(industry, 'i') };
  }

  if (material) {
    query.preferred_materials = { $regex: new RegExp(material, 'i') };
  }

  if (product) {
    query.preferred_products = { $regex: new RegExp(product, 'i') };
  }

  if (requirement) {
    query.requirement_summary = { $regex: new RegExp(requirement, 'i') };
  }

  if (verified === 'true') {
    query.$or = [
      { is_verified: true },
      { verification_status: 'approved' }
    ];
  } else if (verified === 'false') {
    query.is_verified = false;
    query.verification_status = { $ne: 'approved' };
  }

  if (min_rating) {
    query.rating = { $gte: parseFloat(min_rating) };
  }

  return query;
};

// 1. Get Buyer States
// GET /api/buyers/states
exports.getStates = async (req, res, next) => {
  try {
    const { search, category_id, buyer_type, verified } = req.query;
    const baseBuyerQuery = await buildBuyerMatchQuery({ category_id, buyer_type, verified });

    let locationQuery = {};
    if (search) {
      locationQuery.name = { $regex: new RegExp(search, 'i') };
    }

    const states = await Location.find(locationQuery).lean();

    const items = await Promise.all(states.map(async (s) => {
      const stateBuyerQuery = {
        ...baseBuyerQuery,
        'address.state': { $regex: new RegExp(`^${s.name}$`, 'i') }
      };

      const count = await BusinessProfile.countDocuments(stateBuyerQuery);
      return {
        id: s._id,
        name: s.name,
        slug: s.name.toLowerCase().replace(/\s+/g, '-'),
        image: `https://domain.com/storage/states/${s.name.toLowerCase()}.webp`,
        buyer_count: count
      };
    }));

    // Return only states that have eligible active buyers
    const filteredItems = items.filter(item => item.buyer_count > 0);

    return successResponse(res, 'Buyer states retrieved successfully', filteredItems);
  } catch (err) {
    next(err);
  }
};

// 2. Get Buyer Cities
// GET /api/buyers/cities?state_id=...
exports.getCities = async (req, res, next) => {
  try {
    const { state_id, search, buyer_type, category_id, verified } = req.query;

    if (!state_id) {
      return errorResponse(res, 'state_id query parameter is required', null, 400);
    }

    const state = await Location.findById(state_id).lean();
    if (!state) {
      return errorResponse(res, 'State not found', null, 404);
    }

    const baseBuyerQuery = await buildBuyerMatchQuery({ buyer_type, category_id, verified });

    let cities = [];
    if (state.districts && state.districts.length > 0) {
      cities = await Promise.all(state.districts.map(async (d) => {
        if (search) {
          const sLower = search.toLowerCase();
          const matchesDistrict = d.name && d.name.toLowerCase().includes(sLower);
          const matchesArea = Array.isArray(d.areas) && d.areas.some(a => {
            const aName = typeof a === 'string' ? a : a?.name;
            return aName && aName.toLowerCase().includes(sLower);
          });

          if (!matchesDistrict && !matchesArea) {
            return null;
          }
        }

        const cityQuery = {
          ...baseBuyerQuery,
          'address.state': { $regex: new RegExp(`^${state.name}$`, 'i') },
          'address.district': { $regex: new RegExp(`^${d.name}$`, 'i') }
        };

        const count = await BusinessProfile.countDocuments(cityQuery);
        return {
          id: d._id,
          name: d.name,
          slug: d.name.toLowerCase().replace(/\s+/g, '-'),
          image: `https://domain.com/storage/cities/${d.name.toLowerCase()}.webp`,
          buyer_count: count
        };
      }));

      cities = cities.filter(Boolean).filter(c => c.buyer_count > 0);
    }

    return successResponse(res, 'Buyer cities retrieved successfully', cities);
  } catch (err) {
    next(err);
  }
};

// 3. Get Verified Buyer Listing (Search, Filter, Pagination)
// GET /api/buyers
exports.getBuyers = async (req, res, next) => {
  try {
    const { page = 1, per_page = 20, sort } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    const query = await buildBuyerMatchQuery(req.query);

    let sortOptions = { createdAt: -1 };
    if (sort === 'rating') sortOptions = { rating: -1, review_count: -1 };
    else if (sort === 'name') sortOptions = { company_name: 1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const buyers = await BusinessProfile.find(query)
      .populate('buyer_types', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BusinessProfile.countDocuments(query);

    const items = buyers.map(b => {
      const isVerified = b.is_verified || b.verification_status === 'approved';
      const primaryBuyerType = b.buyer_types?.[0]?.name || b.industry || 'Buyer';

      return {
        id: b._id,
        name: b.company_name,
        logo: b.owners?.[0]?.photo || null,
        buyer_type: primaryBuyerType,
        buyer_types: b.buyer_types?.map(bt => bt.name) || [],
        description: b.company_details || 'Verified Stone Buyer',
        location: {
          city: b.address?.district || b.address?.area || 'N/A',
          state: b.address?.state || 'N/A'
        },
        is_verified: isVerified,
        rating: b.rating || 0,
        review_count: b.review_count || 0,
        requirement_summary: b.requirement_summary || 'Natural Stone Procurement'
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Buyers fetched successfully',
      data: items,
      meta: {
        current_page: parseInt(page),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// 4. Get Buyer Types
// GET /api/buyers/types
exports.getBuyerTypes = async (req, res, next) => {
  try {
    const types = await BuyerType.find({ status: 'active' })
      .sort({ sort_order: 1, name: 1 })
      .lean();

    return successResponse(res, 'Buyer types retrieved successfully', types);
  } catch (err) {
    next(err);
  }
};

// 5. Get Buyer Profile
// GET /api/buyers/:id
exports.getBuyerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const buyer = await BusinessProfile.findOne({
      _id: id,
      business_type: 'buyer',
      status: 'active'
    })
      .populate('buyer_types', 'name slug description icon')
      .lean();

    if (!buyer) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    const isOwner = req.user && req.user.id === buyer.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isVerified = buyer.is_verified || buyer.verification_status === 'approved';

    // Fetch open purchasing requirements
    const requirementQuery = { buyerId: buyer._id, status: 'open' };
    if (!isOwner && !isAdmin) {
      requirementQuery.visibility = { $in: ['public', 'verified_suppliers_only'] };
    }
    const requirements = await BuyerRequirement.find(requirementQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch approved reviews
    const reviews = await BuyerReview.find({ buyerId: buyer._id, status: 'approved' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedReviews = reviews.map(r => ({
      id: r._id,
      reviewer_name: r.userId?.name || 'Verified Supplier',
      rating: r.rating,
      review: r.review,
      created_at: r.createdAt
    }));

    // Statistics
    const totalRequirementsCount = await BuyerRequirement.countDocuments({ buyerId: buyer._id });

    // Public / Authorized profile response
    const profileData = {
      id: buyer._id,
      company: {
        name: buyer.company_name,
        logo: buyer.owners?.[0]?.photo || null,
        description: buyer.company_details,
        website: buyer.website || null,
        verified: isVerified
      },
      buyer_types: buyer.buyer_types?.map(bt => ({ id: bt._id, name: bt.name, slug: bt.slug })) || [],
      location: {
        state: buyer.address?.state,
        district: buyer.address?.district,
        city: buyer.address?.district,
        area: buyer.address?.area,
        address: isOwner || isAdmin ? buyer.address?.full_address : (buyer.address?.area || buyer.address?.district)
      },
      business_details: {
        established_year: buyer.established_year,
        industry: buyer.industry,
        gst_registered: !!buyer.gst_number,
        gst_number: isOwner || isAdmin ? buyer.gst_number : undefined,
        iec_number: isOwner || isAdmin ? buyer.iec_number : undefined,
        preferred_communication: buyer.preferred_communication
      },
      requirements: requirements.map(req => ({
        id: req._id,
        title: req.title,
        description: req.description,
        material: req.material,
        product_type: req.product_type,
        stone_type: req.stone_type,
        colour: req.colour,
        finish: req.finish,
        grade: req.grade,
        required_size: req.required_size,
        thickness_mm: req.thickness_mm,
        quantity: req.quantity,
        quantity_unit: req.quantity_unit,
        budget: req.budget,
        delivery_location: req.delivery_location,
        required_delivery_date: req.required_delivery_date,
        status: req.status
      })),
      preferred_materials: buyer.preferred_materials || [],
      preferred_products: buyer.preferred_products || [],
      statistics: {
        requirement_count: totalRequirementsCount,
        rating: buyer.rating || 0,
        review_count: buyer.review_count || 0
      },
      reviews: formattedReviews
    };

    return successResponse(res, 'Buyer profile retrieved successfully', profileData);
  } catch (err) {
    next(err);
  }
};

// 6. Get Requirements for Buyer
// GET /api/buyers/:id/requirements
exports.getBuyerRequirements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyer = await BusinessProfile.findOne({ _id: id, business_type: 'buyer', status: 'active' });
    if (!buyer) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    const isOwner = req.user && req.user.id === buyer.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    let query = { buyerId: id };
    if (!isOwner && !isAdmin) {
      query.status = 'open';
      query.visibility = { $in: ['public', 'verified_suppliers_only'] };
    }

    const requirements = await BuyerRequirement.find(query).sort({ createdAt: -1 }).lean();
    return successResponse(res, 'Buyer requirements retrieved successfully', requirements);
  } catch (err) {
    next(err);
  }
};

// 7. Get Reviews for Buyer
// GET /api/buyers/:id/reviews
exports.getBuyerReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await BuyerReview.find({ buyerId: id, status: 'approved' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 'Buyer reviews retrieved successfully', reviews);
  } catch (err) {
    next(err);
  }
};

// 8. Submit Review for Buyer
// POST /api/buyers/:id/reviews
exports.submitBuyerReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be a number between 1 and 5', null, 400);
    }

    const buyer = await BusinessProfile.findOne({ _id: id, business_type: 'buyer' });
    if (!buyer) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    // Prevent self-review
    if (buyer.userId.toString() === req.user.id) {
      return errorResponse(res, 'Buyers cannot review their own profile', null, 400);
    }

    // Prevent duplicate review
    const existingReview = await BuyerReview.findOne({ userId: req.user.id, buyerId: id });
    if (existingReview) {
      return errorResponse(res, 'You have already submitted a review for this buyer', null, 400);
    }

    const newReview = await BuyerReview.create({
      userId: req.user.id,
      buyerId: id,
      rating: Math.round(rating),
      review,
      status: 'approved'
    });

    // Recalculate dynamic aggregate rating
    const allApprovedReviews = await BuyerReview.find({ buyerId: id, status: 'approved' });
    const totalCount = allApprovedReviews.length;
    const sumRatings = allApprovedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalCount > 0 ? parseFloat((sumRatings / totalCount).toFixed(1)) : 0;

    buyer.rating = avgRating;
    buyer.review_count = totalCount;
    await buyer.save();

    return successResponse(res, 'Review submitted successfully', newReview, 201);
  } catch (err) {
    next(err);
  }
};

// 9. Buyer Favorites
// GET /api/buyers/favorites
exports.getBuyerFavorites = async (req, res, next) => {
  try {
    const favorites = await BusinessFavorite.find({ userId: req.user.id })
      .populate({
        path: 'businessId',
        match: { business_type: 'buyer' },
        populate: { path: 'buyer_types', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const filtered = favorites.filter(f => f.businessId);
    return successResponse(res, 'Buyer favorites retrieved successfully', filtered);
  } catch (err) {
    next(err);
  }
};
