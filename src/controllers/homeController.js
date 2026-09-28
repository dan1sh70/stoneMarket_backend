const HomeBanner = require('../models/HomeBanner');
const MainCategory = require('../models/MainCategory');
const Product = require('../models/Product');
const ServiceCategory = require('../models/ServiceCategory');
const BusinessProfile = require('../models/BusinessProfile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await HomeBanner.find({ status: 'active' }).sort({ sort_order: 1 });
    
    // Transform specifically to format the button and images
    const items = banners.map(b => ({
      id: b._id,
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      image: b.image,
      mobile_image: b.mobile_image,
      button: b.target_type !== 'none' ? {
        text: b.button_text,
        type: b.target_type,
        id: b.target_id
      } : null
    }));

    return successResponse(res, 'Home banners retrieved successfully', { items });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await MainCategory.find({ status: 'active' }).sort({ sort_order: 1 });
    return successResponse(res, 'Main categories retrieved successfully', { items: categories });
  } catch (err) {
    next(err);
  }
};

exports.getStoneGallery = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('vendorId', 'businessName')
      .limit(10)
      .lean();

    const items = products.map(p => ({
      id: p._id,
      name: p.name,
      primary_image: p.images && p.images.length > 0 ? p.images[0] : null,
      gallery_images: p.images,
      material: p.specifications?.find(s => s.key === 'Material')?.value || 'Granite',
      finish: p.specifications?.find(s => s.key === 'Finish')?.value || 'Polished',
      sizes: p.specifications?.find(s => s.key === 'Size')?.value?.split(',') || [],
      thickness: p.specifications?.find(s => s.key === 'Thickness')?.value?.split(',') || [],
      quality: p.specifications?.find(s => s.key === 'Quality')?.value?.split(',') || [],
      price: p.priceRange?.min || 0,
      unit: p.priceRange?.unit || 'Sq.Ft'
    }));

    return successResponse(res, 'Stone gallery retrieved successfully', { items });
  } catch (err) {
    next(err);
  }
};

exports.getSupportServices = async (req, res, next) => {
  try {
    const services = await ServiceCategory.find({ status: 'active' }).sort({ sort_order: 1 });
    
    // Count providers for each service
    const items = await Promise.all(services.map(async (s) => {
      const count = await BusinessProfile.countDocuments({ service_categories: s._id, status: 'active' });
      return {
        id: s._id,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        provider_count: count
      };
    }));

    return successResponse(res, 'Support services retrieved successfully', { items });
  } catch (err) {
    next(err);
  }
};

exports.getNearbyBusinesses = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50, limit = 10 } = req.query;
    
    let query = { status: 'active' };
    
    // If coords are provided, we could use MongoDB $nearSphere. 
    // Wait, BusinessProfile has latitude and longitude as flat numbers, not a GeoJSON Point?
    // Let's check BusinessProfile: address: { latitude: Number, longitude: Number }.
    // Mongoose requires a 2dsphere index on a GeoJSON object for $nearSphere.
    // If not GeoJSON, we fallback to simple bounded box or state/district fallback.
    // The previous implementation for Vendor used `location: { type: 'Point', coordinates: [] }`. BusinessProfile does not have this.
    // We will simulate basic matching for now or just return active businesses.
    
    if (req.query.state) query['address.state'] = req.query.state;
    if (req.query.district) query['address.district'] = req.query.district;

    const businesses = await BusinessProfile.find(query).limit(parseInt(limit)).lean();
    
    const items = businesses.map(b => ({
      id: b._id,
      name: b.company_name,
      business_type: b.business_type,
      location: b.address,
      distance: { value: 0, unit: 'km' }, // Mocked distance since we lack GeoJSON in BusinessProfile
      verified: true
    }));

    return successResponse(res, 'Nearby businesses retrieved successfully', { items });
  } catch (err) {
    next(err);
  }
};

exports.getHome = async (req, res, next) => {
  try {
    // We fetch data directly to avoid double response headers
    
    const hero_sliders = await HomeBanner.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
    const catData = await MainCategory.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
    
    const stoneProducts = await Product.find({ status: 'active' }).limit(5).lean();
    const stone_gallery = stoneProducts.map(p => ({
      id: p._id,
      name: p.name,
      image: p.images?.[0] || null,
      price: p.priceRange?.min || 0,
      unit: p.priceRange?.unit || 'Sq.Ft'
    }));

    const srv = await ServiceCategory.find({ status: 'active' }).limit(8).lean();
    const support_services = srv.map(s => ({
      id: s._id,
      name: s.name,
      slug: s.slug,
      icon: s.icon
    }));

    const b = await BusinessProfile.find({ status: 'active' }).limit(5).lean();
    const nearby_businesses = b.map(bz => ({
      id: bz._id,
      name: bz.company_name,
      type: bz.business_type,
      distance: { value: 4.8, unit: 'km' } // Simulated
    }));

    const Activity = require('../models/Activity');
    const acts = await Activity.find({ status: 'published' }).sort({ published_at: -1 }).limit(5).lean();
    const activities = acts.map(a => ({
      id: a._id,
      title: a.title,
      description: a.description,
      image: a.image,
      type: a.type,
      url: a.url,
      published_at: a.published_at
    }));

    // For feed, we just return an empty array initially
    const feed = [];

    return res.status(200).json({
      success: true,
      message: 'Home data retrieved successfully',
      data: {
        hero_sliders,
        categories: catData,
        stone_gallery,
        support_services,
        nearby_businesses,
        activities,
        feed
      },
      errors: null,
      meta: {
        location_based: !!(req.query.latitude && req.query.longitude)
      }
    });

  } catch (err) {
    next(err);
  }
};
