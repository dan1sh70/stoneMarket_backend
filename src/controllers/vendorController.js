const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper to generate a slug from business name
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// @desc    Create or update business profile
// @route   POST/PUT /api/v1/vendors/profile
// @access  Private (Vendor)
exports.upsertProfile = async (req, res, next) => {
  try {
    const { businessName, category, subcategory, description, gstNumber, contact, address, coordinates } = req.body;
    
    let vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (vendor) {
      // Update
      vendor.businessName = businessName || vendor.businessName;
      vendor.category = category || vendor.category;
      vendor.subcategory = subcategory || vendor.subcategory;
      vendor.description = description || vendor.description;
      vendor.gstNumber = gstNumber || vendor.gstNumber;
      if (contact) vendor.contact = { ...vendor.contact, ...contact };
      if (address) vendor.address = { ...vendor.address, ...address };
      if (coordinates) {
        vendor.location = { type: 'Point', coordinates };
      }
      if (businessName) vendor.slug = generateSlug(businessName);
      
      await vendor.save();
      return res.json({ message: 'Profile updated successfully', vendor });
    } else {
      // Create
      const slug = generateSlug(businessName);
      vendor = await Vendor.create({
        userId: req.user.id,
        businessName,
        slug,
        category,
        subcategory,
        description,
        gstNumber,
        contact,
        address,
        location: coordinates ? { type: 'Point', coordinates } : undefined
      });
      return res.status(201).json({ message: 'Profile created successfully', vendor });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    List vendors with filters
// @route   GET /api/v1/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
  try {
    const { category, state, city, search, page = 1, limit = 10, featured } = req.query;
    
    let query = { status: 'active' };
    if (category) query.category = category;
    if (state) query['address.state'] = state;
    if (city) query['address.city'] = city;
    if (featured) query.listingType = { $in: ['premium', 'top_featured'] };
    
    if (search) {
      query.$text = { $search: search };
    }

    const vendors = await Vendor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Vendor.countDocuments(query);
    
    res.json({
      vendors,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get full vendor profile by slug
// @route   GET /api/v1/vendors/:slug
// @access  Public
exports.getVendorBySlug = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ slug: req.params.slug, status: 'active' });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    // Increment profile views
    vendor.stats.profileViews += 1;
    await vendor.save();
    
    res.json(vendor);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all products of a vendor
// @route   GET /api/v1/vendors/:id/products
// @access  Public
exports.getVendorProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendorId: req.params.id, status: 'active' });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// @desc    Upload GST cert and verification docs
// @route   POST /api/v1/vendors/upload-docs
// @access  Private (Vendor)
exports.uploadDocs = async (req, res, next) => {
  try {
    // Expecting files via multer: req.files
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    
    // Mock save logic (would normally be S3 URL)
    if (req.files) {
       req.files.forEach(f => {
         vendor.verificationDocuments.push({ type: 'document', url: f.path });
       });
       await vendor.save();
    }
    res.json({ message: 'Documents uploaded successfully', documents: vendor.verificationDocuments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get own analytics
// @route   GET /api/v1/vendors/dashboard/stats
// @access  Private (Vendor)
exports.getStats = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    res.json(vendor.stats);
  } catch (err) {
    next(err);
  }
};

// @desc    Save vendor to favorites
// @route   POST /api/v1/vendors/:id/save
// @access  Private (User)
exports.saveVendor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.savedBusinesses.includes(req.params.id)) {
      user.savedBusinesses.push(req.params.id);
      await user.save();
    }
    res.json({ message: 'Vendor saved to favorites' });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove vendor from favorites
// @route   DELETE /api/v1/vendors/:id/save
// @access  Private (User)
exports.removeSavedVendor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedBusinesses = user.savedBusinesses.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.json({ message: 'Vendor removed from favorites' });
  } catch (err) {
    next(err);
  }
};
