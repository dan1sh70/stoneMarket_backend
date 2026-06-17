const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

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
