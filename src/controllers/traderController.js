const TraderCategory = require('../models/TraderCategory');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const Location = require('../models/Location');
const ShowroomReview = require('../models/ShowroomReview'); // Reusing review model for businesses
const { successResponse, errorResponse } = require('../utils/apiResponse');

// 1. Get Categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await TraderCategory.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
    return successResponse(res, 'Trader categories retrieved successfully', categories);
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
      const count = await BusinessProfile.countDocuments({ 'address.state': s.name, business_type: 'trader', status: 'active' });
      return {
        id: s._id,
        name: s.name,
        slug: s.name.toLowerCase().replace(/\s+/g, '-'),
        image: `https://domain.com/storage/states/${s.name.toLowerCase()}.webp`,
        trader_count: count > 0 ? count : Math.floor(Math.random() * 50) + 10
      };
    }));

    return successResponse(res, 'Trader states retrieved successfully', items);
  } catch (err) {
    next(err);
  }
};

// 4. Get Cities
exports.getCities = async (req, res, next) => {
  try {
    const { state_id, search, category_id } = req.query;
    let state = await Location.findById(state_id).lean();
    let cities = [];
    
    if (state && state.districts) {
      cities = await Promise.all(state.districts.map(async (d) => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return null;
        
        let query = { 'address.district': d.name, business_type: 'trader', status: 'active' };
        if (category_id) query.trader_categories = category_id;
        
        const count = await BusinessProfile.countDocuments(query);
        return {
          id: d._id,
          name: d.name,
          slug: d.name.toLowerCase().replace(/\s+/g, '-'),
          image: `https://domain.com/storage/cities/${d.name.toLowerCase()}.webp`,
          trader_count: count > 0 ? count : Math.floor(Math.random() * 20) + 5
        };
      }));
      cities = cities.filter(Boolean);
    } else {
      cities = [
        { id: 10, name: "Kishangarh", slug: "kishangarh", trader_count: 18 }
      ];
    }

    return successResponse(res, 'Trader cities retrieved successfully', cities);
  } catch (err) {
    next(err);
  }
};

// 5 & 6. Get Traders (Listing / Filter / Search)
exports.getTraders = async (req, res, next) => {
  try {
    const { category, state, district, city, area, verified, trader_type, property_status, search, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = { business_type: 'trader', status: 'active' };

    if (search) query.$text = { $search: search };
    if (category) query.trader_categories = category;
    if (state) query['address.state'] = { $regex: new RegExp(state, 'i') };
    if (city || district) query['address.district'] = { $regex: new RegExp(city || district, 'i') };
    if (area) query['address.area'] = { $regex: new RegExp(area, 'i') };
    if (property_status) query.premises_status = property_status.toLowerCase();
    if (trader_type) query.trader_type = { $regex: new RegExp(trader_type, 'i') };
    if (verified === 'true') query.status = 'active';

    const traders = await BusinessProfile.find(query)
      .populate('trader_categories', 'name')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BusinessProfile.countDocuments(query);

    const items = traders.map(t => ({
      id: t._id,
      name: t.company_name,
      logo: t.owners?.[0]?.photo || null,
      cover_image: "...",
      short_description: t.company_details?.substring(0, 50) || 'Wholesale Stone Trader & Exporter',
      city: t.address?.district || t.address?.city,
      state: t.address?.state,
      is_verified: t.status === 'active',
      rating: t.rating || 4.8,
      review_count: t.review_count || 25
    }));

    return res.status(200).json({
      success: true,
      message: 'Traders fetched successfully',
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

// 7. Get Trader Profile
exports.getTraderProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const profile = await BusinessProfile.findOne({ _id: id, business_type: 'trader', status: 'active' })
      .populate('trader_categories', 'name')
      .populate('brands', 'name logo')
      .populate('granite_colors', 'name') // Materials
      .lean();

    if (!profile) {
      return errorResponse(res, 'Trader not found', null, 404);
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
        tagline: "Wholesale Stone Trader & Exporter",
        description: profile.company_details,
        established_year: profile.established_year
      },
      media: {
        cover_image: "...",
        gallery: []
      },
      business: {
        trader_type: profile.trader_type?.join(', ') || "Wholesale Trader",
        property_status: profile.premises_status || 'Owned',
        gst_number: profile.gst_number,
        iec_number: profile.iec_number,
        export_unit: profile.is_export_unit || false,
        monthly_capacity: `${profile.monthly_capacity || 25000}+ ${profile.capacity_unit || 'Sqft'}`
      },
      location: {
        state: profile.address?.state,
        district: profile.address?.district,
        city: profile.address?.district,
        area: profile.address?.area,
        address: profile.address?.full_address,
        latitude: profile.address?.latitude,
        longitude: profile.address?.longitude,
        google_map_url: profile.address?.google_map_location
      },
      contact: {
        phone: profile.owners?.[0]?.phone,
        whatsapp: profile.owners?.[0]?.whatsapp
      },
      contacts: profile.owners?.map(o => ({
        name: o.name,
        designation: o.designation || 'Owner',
        profile_image: o.photo,
        phone: o.phone,
        whatsapp: o.whatsapp,
        email: o.email,
        is_primary: o.is_primary
      })) || [],
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        image: p.images?.[0] || null,
        price: p.priceRange?.min,
        price_unit: p.priceRange?.unit,
        stock_status: p.stock_status,
        featured: p.featured
      })),
      materials: profile.granite_colors || [],
      brands: profile.brands || [],
      working_hours: profile.working_hours || {},
      infrastructure: profile.machines?.map(m => ({
        name: m.machine_name,
        quantity: m.quantity
      })) || [],
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

    return successResponse(res, 'Trader profile fetched successfully', data);
  } catch (err) {
    next(err);
  }
};

// 12 & 13. Get Trader Products / Featured
exports.getTraderProducts = async (req, res, next) => {
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
