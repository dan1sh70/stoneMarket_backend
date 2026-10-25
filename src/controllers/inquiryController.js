const Inquiry = require('../models/Inquiry');
const Vendor = require('../models/Vendor');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Submit inquiry
// @route   POST /api/v1/inquiries or /api/inquiries
// @access  Private (User/Buyer)
exports.submitInquiry = async (req, res, next) => {
  try {
    const {
      vendorId,
      businessId,
      buyerId,
      productId,
      category,
      supplierType,
      subject,
      message,
      requirements,
      quantity,
      unit,
      size,
      thickness,
      finish,
      grade,
      deliveryLocation,
      attachments,
      referralSource,
      contactInfo
    } = req.body;

    let targetVendor = null;
    let targetBusiness = null;
    let resolvedCategory = category;

    if (vendorId) {
      targetVendor = await Vendor.findById(vendorId);
      if (!targetVendor) {
        targetBusiness = await BusinessProfile.findById(vendorId);
        if (!targetBusiness) return res.status(404).json({ message: 'Vendor or business not found' });
      }
    } else if (businessId) {
      targetBusiness = await BusinessProfile.findById(businessId);
      if (!targetBusiness) {
        targetVendor = await Vendor.findById(businessId);
        if (!targetVendor) return res.status(404).json({ message: 'Supplier not found' });
      }
    }

    // Product verification: if productId is given, verify it belongs to this vendor/business
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const productVendorId = product.vendorId ? product.vendorId.toString() : '';
      const allowedTargetIds = [
        targetVendor?._id?.toString(),
        targetBusiness?._id?.toString()
      ].filter(Boolean);

      if (!allowedTargetIds.includes(productVendorId)) {
        return res.status(400).json({ 
          message: 'Product does not belong to the selected supplier' 
        });
      }
    }

    // Category routing logic for existing vendor tests
    if (targetVendor && category && targetVendor.category && targetVendor.category !== category) {
      return res.status(400).json({ 
        message: `Inquiry routing failed: Target vendor is in '${targetVendor.category}', but inquiry is for '${category}'.` 
      });
    }

    if (!resolvedCategory) {
      resolvedCategory = targetVendor?.category || targetBusiness?.business_type || 'General';
    }

    const inquiry = await Inquiry.create({
      senderId: req.user.id,
      vendorId: targetVendor?._id || targetBusiness?._id,
      businessId: targetBusiness?._id,
      buyerId,
      productId,
      supplierType: supplierType || targetBusiness?.business_type || targetVendor?.category,
      category: resolvedCategory,
      subject,
      message,
      requirements,
      quantity,
      unit,
      size,
      thickness,
      finish,
      grade,
      deliveryLocation,
      attachments,
      referralSource,
      contactInfo
    });

    // Update sender's inquiryHistory
    await User.findByIdAndUpdate(req.user.id, { $push: { inquiryHistory: inquiry._id } });

    // Increment vendor's inquiriesReceived stat
    if (targetVendor && targetVendor.stats) {
      targetVendor.stats.inquiriesReceived = (targetVendor.stats.inquiriesReceived || 0) + 1;
      await targetVendor.save();
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry._id,
      inquiry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all inquiries sent by buyer
// @route   GET /api/v1/inquiries/sent
// @access  Private (User/Buyer)
exports.getSentInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ senderId: req.user.id })
      .populate('vendorId', 'businessName')
      .populate('businessId', 'company_name address')
      .populate('productId', 'name')
      .sort('-createdAt');
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all received leads
// @route   GET /api/v1/inquiries/received
// @access  Private (Vendor / Supplier)
exports.getReceivedInquiries = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const business = await BusinessProfile.findOne({ userId: req.user.id });

    if (!vendor && !business) {
      return res.status(400).json({ message: 'Vendor or business profile required' });
    }

    const queryOr = [];
    if (vendor) queryOr.push({ vendorId: vendor._id });
    if (business) queryOr.push({ businessId: business._id }, { vendorId: business._id });

    const inquiries = await Inquiry.find({ $or: queryOr })
      .populate('senderId', 'name mobile email')
      .populate('productId', 'name')
      .sort('-createdAt');
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single inquiry detail
// @route   GET /api/v1/inquiries/:id
// @access  Private (User or Vendor)
exports.getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('senderId', 'name mobile email')
      .populate('vendorId', 'businessName userId')
      .populate('businessId', 'company_name userId')
      .populate('productId', 'name images');
      
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    // Authorization logic
    const isSender = inquiry.senderId._id.toString() === req.user.id;
    const isVendorOwner = inquiry.vendorId?.userId?.toString() === req.user.id;
    const isBusinessOwner = inquiry.businessId?.userId?.toString() === req.user.id;
    
    if (!isSender && !isVendorOwner && !isBusinessOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this inquiry' });
    }

    // Auto-update status to viewed if supplier is reading a 'new' inquiry
    if ((isVendorOwner || isBusinessOwner) && inquiry.status === 'new') {
      inquiry.status = 'viewed';
      await inquiry.save();
    }

    res.json(inquiry);
  } catch (err) {
    next(err);
  }
};

// @desc    Update inquiry status
// @route   PUT /api/v1/inquiries/:id/status
// @access  Private (Vendor / Supplier)
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const business = await BusinessProfile.findOne({ userId: req.user.id });

    const queryOr = [];
    if (vendor) queryOr.push({ vendorId: vendor._id });
    if (business) queryOr.push({ businessId: business._id }, { vendorId: business._id });

    const inquiry = await Inquiry.findOne({ _id: req.params.id, $or: queryOr });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });

    inquiry.status = status;
    await inquiry.save();
    
    res.json({ message: 'Inquiry status updated', inquiry });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit vendor response
// @route   POST /api/v1/inquiries/:id/respond
// @access  Private (Vendor / Supplier)
exports.respondToInquiry = async (req, res, next) => {
  try {
    const { message } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const business = await BusinessProfile.findOne({ userId: req.user.id });

    const queryOr = [];
    if (vendor) queryOr.push({ vendorId: vendor._id });
    if (business) queryOr.push({ businessId: business._id }, { vendorId: business._id });

    const inquiry = await Inquiry.findOne({ _id: req.params.id, $or: queryOr });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });

    inquiry.vendorResponse = {
      message,
      respondedAt: Date.now()
    };
    inquiry.status = 'responded';
    await inquiry.save();
    
    res.json({ message: 'Response submitted', inquiry });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all inquiries with filters (Admin)
// @route   GET /api/v1/inquiries/admin/all
// @access  Private (Admin)
exports.getAllInquiriesAdmin = async (req, res, next) => {
  try {
    const { category, vendorId, date, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (vendorId) query.vendorId = vendorId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const inquiries = await Inquiry.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
      
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};
