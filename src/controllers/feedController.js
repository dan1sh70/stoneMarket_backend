const Product = require('../models/Product');
const BusinessProfile = require('../models/BusinessProfile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getFeed = async (req, res, next) => {
  try {
    const { 
      category_id, service_category_id, 
      state, district, area, search, sort = 'latest', 
      page = 1, per_page = 20 
    } = req.query;

    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    // We'll aggregate Products and BusinessProfiles (as services/businesses)
    // For simplicity, if service_category_id is passed, we fetch from BusinessProfile.
    // If it's a general feed, we fetch Products.
    // A true unified feed might union queries or we can just interleave them.
    // Here we focus on Products as primary feed items.

    let productQuery = { status: 'active' };
    
    if (search) {
      productQuery.$text = { $search: search };
    }

    // Sort mapping
    let sortQuery = { createdAt: -1 }; // latest
    if (sort === 'popular') sortQuery = { views: -1 };
    if (sort === 'most_interested') sortQuery = { views: -1 }; // fallback

    const products = await Product.find(productQuery)
      .populate('vendorId', 'businessName logo coverImage address')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(productQuery);

    const items = products.map(p => {
      const vendor = p.vendorId || {};
      return {
        type: 'product',
        id: p._id,
        name: p.name,
        category: {
          id: p.category, // Assuming it's a string/ID
          name: p.category
        },
        business: {
          id: vendor._id,
          name: vendor.businessName,
          type: vendor.category || 'mining',
          verified: true,
          logo: vendor.logo
        },
        location: {
          state: vendor.address?.state || 'Unknown',
          district: vendor.address?.city || 'Unknown',
          area: vendor.address?.line1 || 'Unknown'
        },
        main_image: p.images?.[0],
        images: p.images,
        post: {
          title: p.name,
          description: p.description
        },
        commercial: {
          price: p.priceRange?.min || 0,
          currency: 'INR',
          unit: p.priceRange?.unit || 'Sq.Ft'
        },
        specifications: {
          material: p.specifications?.find(s => s.key === 'Material')?.value || 'Granite',
          finish: p.specifications?.find(s => s.key === 'Finish')?.value || 'Polished',
          size: p.specifications?.find(s => s.key === 'Size')?.value?.split(',') || [],
          thickness: p.specifications?.find(s => s.key === 'Thickness')?.value?.split(',') || [],
          quality: p.specifications?.find(s => s.key === 'Quality')?.value?.split(',') || [],
          quantity: 5000,
          quantity_unit: 'Sq.Ft'
        },
        engagement: {
          interested_count: p.views || 0,
          is_interested: false
        },
        actions: {
          view_profile: true,
          call: true,
          whatsapp: true,
          inquiry: true
        }
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Feed retrieved successfully',
      data: {
        items
      },
      errors: null,
      meta: {
        pagination: {
          current_page: parseInt(page),
          per_page: limit,
          total,
          last_page: Math.ceil(total / limit)
        }
      }
    });

  } catch (err) {
    next(err);
  }
};
