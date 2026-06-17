const Inquiry = require('../models/Inquiry');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Submit inquiry
// @route   POST /api/v1/inquiries
// @access  Private (User/Buyer)
exports.submitInquiry = async (req, res, next) => {
  try {
    const { vendorId, productId, category, subject, message, requirements, contactInfo } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    // Category routing logic (Point 21-24)
    if (vendor.category !== category) {
      return res.status(400).json({ 
        message: `Inquiry routing failed: Target vendor is in '${vendor.category}', but inquiry is for '${category}'.` 
      });
    }

    const inquiry = await Inquiry.create({
      senderId: req.user.id,
      vendorId,
      productId,
      category,
      subject,
      message,
      requirements,
      contactInfo
    });

    // Optionally: Update sender's inquiryHistory
    await User.findByIdAndUpdate(req.user.id, { $push: { inquiryHistory: inquiry._id } });

    // Optionally: Increment vendor's inquiriesReceived stat
    vendor.stats.inquiriesReceived += 1;
    await vendor.save();

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
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
      .populate('productId', 'name')
      .sort('-createdAt');
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all received leads
// @route   GET /api/v1/inquiries/received
// @access  Private (Vendor)
exports.getReceivedInquiries = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(400).json({ message: 'Vendor profile required' });

    const inquiries = await Inquiry.find({ vendorId: vendor._id })
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
      .populate('productId', 'name images');
      
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    // Authorization logic
    const isSender = inquiry.senderId._id.toString() === req.user.id;
    const isVendorOwner = inquiry.vendorId.userId.toString() === req.user.id;
    
    if (!isSender && !isVendorOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this inquiry' });
    }

    // Auto-update status to viewed if vendor is reading a 'new' inquiry
    if (isVendorOwner && inquiry.status === 'new') {
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
// @access  Private (Vendor)
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const inquiry = await Inquiry.findOne({ _id: req.params.id, vendorId: vendor._id });
    
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
// @access  Private (Vendor)
exports.respondToInquiry = async (req, res, next) => {
  try {
    const { message } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const inquiry = await Inquiry.findOne({ _id: req.params.id, vendorId: vendor._id });
    
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
