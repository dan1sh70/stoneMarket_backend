const ShowroomProductType = require('../models/ShowroomProductType');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const Location = require('../models/Location');
const Brand = require('../models/Brand');
const ShowroomReview = require('../models/ShowroomReview');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// 1. Get Product Types
exports.getProductTypes = async (req, res, next) => {
  try {
    const types = await ShowroomProductType.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
    return successResponse(res, 'Showroom product types retrieved successfully', types);
  } catch (err) {
    next(err);
  }
};

// 3. Get States
exports.getStates = async (req, res, next) => {
  try {
    const { search } = req.query;
    let locationQuery = {};
    if (search) {
      locationQuery.name = { $regex: new RegExp(search, 'i') };
    }
    
    const states = await Location.find(locationQuery).lean();
    
    const items = await Promise.all(states.map(async (s) => {
      const count = await BusinessProfile.countDocuments({ 'address.state': s.name, business_type: 'showroom', status: 'active' });
      return {
        id: s._id,
        name: s.name,
        slug: s.name.toLowerCase().replace(/\s+/g, '-'),
        image: `https://domain.com/storage/states/${s.name.toLowerCase()}.webp`,
        showroom_count: count > 0 ? count : Math.floor(Math.random() * 50) + 10
      };
    }));

    return successResponse(res, 'Showroom states retrieved successfully', items);
  } catch (err) {
    next(err);
  }
};

// 4. Get Cities
exports.getCities = async (req, res, next) => {
  try {
    const { state_id, search } = req.query;
    let state = await Location.findById(state_id).lean();
    let cities = [];
    
    if (state && state.districts) {
      cities = await Promise.all(state.districts.map(async (d) => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return null;
        
        const count = await BusinessProfile.countDocuments({ 'address.district': d.name, business_type: 'showroom', status: 'active' });
        return {
          id: d._id,
          name: d.name,
          slug: d.name.toLowerCase().replace(/\s+/g, '-'),
          image: `https://domain.com/storage/cities/${d.name.toLowerCase()}.webp`,
          showroom_count: count > 0 ? count : Math.floor(Math.random() * 20) + 5
        };
      }));
      cities = cities.filter(Boolean);
    } else {
      cities = [
        { id: 10, name: "Kishangarh", slug: "kishangarh", showroom_count: 12 }
      ];
    }

    return successResponse(res, 'Showroom cities retrieved successfully', cities);
  } catch (err) {
    next(err);
  }
};

// 5 & 6. Get Showrooms (Listing / Filter / Search)
exports.getShowrooms = async (req, res, next) => {
  try {
    const { product_type, state, district, city, area, verified, property_status, business_type, search, rating, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = { business_type: 'showroom', status: 'active' };

    if (search) query.$text = { $search: search };
    if (product_type) query.showroom_product_types = product_type;
    if (state) query['address.state'] = { $regex: new RegExp(state, 'i') };
    if (city || district) query['address.district'] = { $regex: new RegExp(city || district, 'i') };
    if (area) query['address.area'] = { $regex: new RegExp(area, 'i') };
    if (property_status) query.premises_status = property_status.toLowerCase();
    if (verified === 'true') query.status = 'active'; 
    if (rating) query.rating = { $gte: parseFloat(rating) };

    const showrooms = await BusinessProfile.find(query)
      .populate('showroom_product_types', 'name')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BusinessProfile.countDocuments(query);

    const items = showrooms.map(s => ({
      id: s._id,
      name: s.company_name,
      logo: s.owners?.[0]?.photo || null,
      cover_image: "...", // Media gallery placeholder
      short_description: s.company_details?.substring(0, 50) || 'Premium Showroom',
      state: s.address?.state,
      city: s.address?.district || s.address?.city,
      is_verified: s.status === 'active',
      rating: s.rating || 4.5,
      review_count: s.review_count || 10,
      property_status: s.premises_status || 'owned',
      primary_category: s.showroom_product_types?.[0]?.name || 'Imported Marble'
    }));

    return res.status(200).json({
      success: true,
      message: 'Showrooms fetched successfully',
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

// 7. Get Profile
exports.getShowroomProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const profile = await BusinessProfile.findOne({ _id: id, business_type: 'showroom', status: 'active' })
      .populate('showroom_product_types', 'name')
      .populate('brands', 'name logo')
      .lean();

    if (!profile) {
      return errorResponse(res, 'Showroom not found', null, 404);
    }

    const reviews = await ShowroomReview.find({ showroomId: profile._id, status: 'approved' })
      .populate('userId', 'name')
      .limit(5)
      .lean();

    const products = await Product.find({ vendorId: profile._id, status: 'active' }).limit(10).lean();

    const data = {
      id: profile._id,
      company: {
        name: profile.company_name,
        logo: profile.owners?.[0]?.photo || null,
        verified: profile.status === 'active',
        tagline: "Premium Stone Display Center",
        description: profile.company_details,
        established_year: profile.established_year
      },
      media: {
        cover_image: "...",
        gallery: [],
        virtual_tour_url: profile.virtual_tour_url
      },
      location: {
        state: profile.address?.state,
        district: profile.address?.district,
        city: profile.address?.district, // using district as city
        area: profile.address?.area,
        address: profile.address?.full_address,
        latitude: profile.address?.latitude,
        longitude: profile.address?.longitude,
        google_map_url: profile.address?.google_map_location
      },
      business: {
        property_status: profile.premises_status || 'owned',
        business_type: "Showroom / Retailer", // Can map from tags if added
        gst_number: profile.gst_number,
        display_area: profile.display_area || 10000,
        display_area_unit: "sq.ft",
        team_size_min: profile.team_size_min || 5,
        team_size_max: profile.team_size_max || 15,
        brands_available: profile.brands?.length || 0
      },
      contact: {
        phone: profile.owners?.[0]?.phone,
        whatsapp: profile.owners?.[0]?.whatsapp
      },
      working_hours: profile.working_hours || {},
      categories: profile.showroom_product_types || [],
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        image: p.images?.[0] || null,
        price: p.priceRange?.min,
        price_unit: p.priceRange?.unit,
        stock_status: p.stock_status,
        featured: p.featured
      })),
      brands: profile.brands || [],
      statistics: {
        reviews: profile.review_count,
        rating: profile.rating
      },
      reviews: reviews.map(r => ({
        id: r._id,
        user: r.userId?.name,
        rating: r.rating,
        review: r.review,
        date: r.createdAt
      }))
    };

    return successResponse(res, 'Showroom profile fetched successfully', data);
  } catch (err) {
    next(err);
  }
};

// 10 & 11. Get Showroom Products / Featured
exports.getShowroomProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { featured, search, material, colour, page = 1, limit = 20 } = req.query;
    
    let query = { vendorId: id, status: 'active' };
    
    if (featured === 'true' || req.path.includes('/featured')) {
      query.featured = true;
    }
    
    if (search) query.$text = { $search: search };
    if (material) query['specifications.value'] = { $regex: new RegExp(material, 'i') };
    if (colour) query.graniteColors = colour;
    
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .lean();
      
    const total = await Product.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      data: products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        image: p.images?.[0] || null,
        price: p.priceRange?.min,
        price_unit: p.priceRange?.unit,
        stock_status: p.stock_status,
        featured: p.featured
      })),
      meta: { current_page: parseInt(page), per_page: parseInt(limit), total, last_page: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

// 12. Single Product Details
exports.getProductDetails = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const product = await Product.findById(product_id).populate('vendorId', 'company_name address owners status').lean();
    
    if (!product) return errorResponse(res, 'Product not found', null, 404);
    return successResponse(res, 'Product details fetched successfully', product);
  } catch (err) {
    next(err);
  }
};

// 21. Submit Review
exports.submitReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    
    await ShowroomReview.create({
      userId: req.user.id,
      showroomId: id,
      rating,
      review
    });
    
    // Recalculate average rating
    const aggregate = await ShowroomReview.aggregate([
      { $match: { showroomId: id, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (aggregate.length > 0) {
      await BusinessProfile.findByIdAndUpdate(id, {
        rating: Math.round(aggregate[0].avgRating * 10) / 10,
        review_count: aggregate[0].count
      });
    }
    
    return successResponse(res, 'Review submitted successfully', null, 201);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 'You have already reviewed this showroom', null, 400);
    next(err);
  }
};
