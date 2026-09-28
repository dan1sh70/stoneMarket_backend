const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Inquiry = require('../models/Inquiry');
const ProductInterest = require('../models/ProductInterest');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Add new product
// @route   POST /api/v1/products
// @access  Private (Vendor)
exports.createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(400).json({ message: 'Please create a vendor profile first' });

    const product = await Product.create({
      vendorId: vendor._id,
      ...req.body
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// @desc    List products with filters
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, graniteColor, miningLocation, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'active' };
    if (category) query.category = category;
    if (graniteColor) query.graniteColors = { $in: [graniteColor] };
    if (miningLocation) query.miningLocation = miningLocation;

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// @desc    Get product details
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendorId', 'businessName contact address badges');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Increment view
    product.views += 1;
    await product.save();
    
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Vendor)
exports.updateProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    let product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Vendor)
exports.deleteProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload product images
// @route   POST /api/v1/products/:id/images
// @access  Private (Vendor)
exports.uploadImages = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.files) {
      const paths = req.files.map(f => f.path);
      product.images.push(...paths);
      // Ensure limit
      if(product.images.length > 10) product.images = product.images.slice(0, 10);
      await product.save();
    }
    
    res.json({ message: 'Images uploaded', images: product.images });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Product Detail (Upgraded for Home Page)
// @route   GET /api/products/:id/detail
// @access  Public
exports.getProductDetail = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'businessName category logo coverImage address contact')
      .lean();
      
    if (!product) return errorResponse(res, 'Product not found', null, 404);
    
    // Track views asynchronously
    Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    const interested_count = await ProductInterest.countDocuments({ productId: product._id });
    let is_interested = false;
    
    if (req.user) {
      is_interested = await ProductInterest.exists({ productId: product._id, userId: req.user.id });
    }

    const vendor = product.vendorId || {};

    const responseData = {
      id: product._id,
      name: product.name,
      price: product.priceRange?.min || 0,
      currency: "INR",
      price_unit: product.priceRange?.unit || "Sq.Ft",
      description: product.description,
      images: product.images || [],
      specifications: {
        material: product.specifications?.find(s => s.key === 'Material')?.value || 'Granite',
        finish: product.specifications?.find(s => s.key === 'Finish')?.value || 'Polished',
        size: product.specifications?.find(s => s.key === 'Size')?.value?.split(',') || [],
        thickness: product.specifications?.find(s => s.key === 'Thickness')?.value?.split(',') || [],
        quality: product.specifications?.find(s => s.key === 'Quality')?.value?.split(',') || [],
        quantity: 5000,
        quantity_unit: "Sq.Ft"
      },
      business: {
        id: vendor._id,
        name: vendor.businessName,
        type: vendor.category,
        logo: vendor.logo,
        contact: vendor.contact
      },
      location: {
        state: vendor.address?.state,
        district: vendor.address?.city,
        area: vendor.address?.line1,
        country: "India"
      },
      interested_count,
      is_interested: !!is_interested
    };

    return successResponse(res, 'Product retrieved successfully', responseData);
  } catch (err) {
    next(err);
  }
};

// @desc    Create Product Inquiry
// @route   POST /api/products/:id/inquiry
// @access  Private
exports.createProductInquiry = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const { quantity, message } = req.body;

    const inquiry = await Inquiry.create({
      senderId: req.user.id,
      vendorId: product.vendorId,
      productId: product._id,
      category: product.category || 'Mining',
      message: message,
      quantity: quantity,
      status: 'new'
    });

    return successResponse(res, 'Inquiry sent successfully', inquiry, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Product Interest
// @route   POST /api/products/:id/interest
// @access  Private
exports.toggleProductInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exists = await ProductInterest.findOne({ userId: req.user.id, productId: id });

    if (exists) {
      if (req.method === 'DELETE') {
        await ProductInterest.deleteOne({ _id: exists._id });
        return successResponse(res, 'Interest removed', null);
      }
      return successResponse(res, 'Already interested', null);
    }

    if (req.method === 'POST') {
      await ProductInterest.create({ userId: req.user.id, productId: id });
      return successResponse(res, 'Interest recorded', null, 201);
    }
    
    return errorResponse(res, 'Invalid request', null, 400);
  } catch (err) {
    next(err);
  }
};

// @desc    Get Product Interest Status
// @route   GET /api/products/:id/interest
// @access  Private
exports.getProductInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interested_count = await ProductInterest.countDocuments({ productId: id });
    const is_interested = await ProductInterest.exists({ userId: req.user.id, productId: id });

    return successResponse(res, 'Interest status retrieved', {
      interested_count,
      is_interested: !!is_interested
    });
  } catch (err) {
    next(err);
  }
};
