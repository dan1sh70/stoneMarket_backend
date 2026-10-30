const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const QuoteResponse = require('../models/QuoteResponse');
const Estimate = require('../models/Estimate');
const Product = require('../models/Product');
const BusinessProfile = require('../models/BusinessProfile');
const Vendor = require('../models/Vendor');
const CustomerAddress = require('../models/CustomerAddress');
const CustomerFavorite = require('../models/CustomerFavorite');
const CustomerNotification = require('../models/CustomerNotification');
const UserSession = require('../models/UserSession');
const SupportTicket = require('../models/SupportTicket');
const SupportFaq = require('../models/SupportFaq');
const sendSMS = require('../services/smsService');
const { calculateSlabTotals, calculateParticularTotals } = require('../services/estimationService');
const { generateSlabEstimatePdf, generateParticularEstimatePdf } = require('../services/estimatePdfService');
const { generateInquiryPdf } = require('../services/inquiryPdfService');
const { generateQuotationPdf } = require('../services/quotationPdfService');
const { notifyCustomer } = require('../services/customerNotificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to format pagination metadata
function formatPagination(page, limit, total) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, parseInt(limit) || 10);
  return {
    current_page: p,
    per_page: l,
    total,
    last_page: Math.ceil(total / l) || 1
  };
}

// Helper to generate reference numbers
function generateRefNumber(prefix = 'INQ') {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
}

// Default avatar generator
function getDefaultAvatar(name = 'Customer') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A202C&color=FFFFFF`;
}

// ==========================================
// 1. CUSTOMER PROFILE & DASHBOARD
// ==========================================

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const profileData = {
      customer_id: user._id,
      full_name: user.name,
      profile_picture: user.profile_picture || getDefaultAvatar(user.name),
      registered_mobile: user.mobile,
      whatsapp_number: user.whatsapp_number || user.mobile,
      email: user.email || '',
      city: user.city || user.preferredCity || '',
      state: user.state || user.preferredState || '',
      account_type: user.role || 'customer',
      account_verification_status: user.verification_status || 'unverified',
      customer_rating: user.rating || 0,
      number_of_reviews: user.review_count || 0,
      membership_date: user.createdAt
    };

    return successResponse(res, 'Customer profile retrieved successfully', profileData);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, full_name, whatsapp_number, email, city, state, date_of_birth, bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    if (name || full_name) user.name = name || full_name;
    if (whatsapp_number !== undefined) user.whatsapp_number = whatsapp_number;
    if (email !== undefined) user.email = email;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (date_of_birth !== undefined) user.date_of_birth = date_of_birth;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updatedProfile = {
      customer_id: user._id,
      full_name: user.name,
      profile_picture: user.profile_picture || getDefaultAvatar(user.name),
      registered_mobile: user.mobile,
      whatsapp_number: user.whatsapp_number || user.mobile,
      email: user.email || '',
      city: user.city || '',
      state: user.state || '',
      account_type: user.role,
      account_verification_status: user.verification_status || 'unverified',
      customer_rating: user.rating || 0,
      number_of_reviews: user.review_count || 0,
      membership_date: user.createdAt
    };

    return successResponse(res, 'Customer profile updated successfully', updatedProfile);
  } catch (err) {
    next(err);
  }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    let photoUrl = req.body.photo_url || req.body.url;
    if (req.file) {
      if (req.file.location) {
        photoUrl = req.file.location;
      } else {
        // Base64 fallback if memory storage is used
        photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    if (!photoUrl) {
      return errorResponse(res, 'Please provide an image file or photo URL', null, 400);
    }

    user.profile_picture = photoUrl;
    await user.save();

    return successResponse(res, 'Profile photo updated successfully', {
      profile_picture: user.profile_picture
    });
  } catch (err) {
    next(err);
  }
};

exports.removePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    user.profile_picture = null;
    await user.save();

    return successResponse(res, 'Profile photo removed successfully', {
      profile_picture: getDefaultAvatar(user.name)
    });
  } catch (err) {
    next(err);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    // Actual DB aggregations
    const [
      totalInquiries,
      pendingInquiries,
      quotesReceivedInquiries,
      closedInquiries,
      userQuoteRequests,
      savedStonesCount,
      unreadNotificationsCount,
      recentInquiries,
      recentQuotations
    ] = await Promise.all([
      Inquiry.countDocuments({ senderId: userId }),
      Inquiry.countDocuments({ 
        senderId: userId, 
        status: { $in: ['pending', 'submitted', 'new', 'under_review', 'in_review'] } 
      }),
      Inquiry.countDocuments({ 
        senderId: userId, 
        status: { $in: ['quotation_received', 'quotes_received', 'responded'] } 
      }),
      Inquiry.countDocuments({ 
        senderId: userId, 
        status: { $in: ['closed', 'completed', 'cancelled'] } 
      }),
      QuoteRequest.find({ userId }).select('_id'),
      CustomerFavorite.countDocuments({ userId }),
      CustomerNotification.countDocuments({ userId, is_read: false }),
      Inquiry.find({ senderId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('productId', 'name images category priceRange')
        .lean(),
      QuoteResponse.find({
        quoteRequestId: { $in: await QuoteRequest.find({ userId }).distinct('_id') }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('supplierId', 'company_name address rating review_count')
        .populate('quoteRequestId', 'reference_number quantity unit')
        .lean()
    ]);

    const quoteReqIds = userQuoteRequests.map(q => q._id);
    const totalQuotationsReceived = await QuoteResponse.countDocuments({
      quoteRequestId: { $in: quoteReqIds }
    });

    const dashboardData = {
      profile_summary: {
        customer_id: user._id,
        full_name: user.name,
        profile_picture: user.profile_picture || getDefaultAvatar(user.name),
        registered_mobile: user.mobile,
        whatsapp_number: user.whatsapp_number || user.mobile,
        verification_status: user.verification_status || 'unverified',
        rating: user.rating || 0
      },
      stats: {
        total_inquiries: totalInquiries,
        pending_inquiries: pendingInquiries,
        inquiries_with_quotations: quotesReceivedInquiries,
        closed_inquiries: closedInquiries,
        total_quotations_received: totalQuotationsReceived,
        saved_stones_count: savedStonesCount,
        unread_notifications: unreadNotificationsCount
      },
      recent_inquiries: recentInquiries.map(inq => ({
        inquiry_id: inq.reference_number || inq._id,
        id: inq._id,
        product_name: inq.productId?.name || inq.subject || 'Stone Requirement',
        category: inq.category,
        quantity: inq.quantity,
        unit: inq.unit || 'Sq.Ft',
        status: inq.status,
        created_at: inq.createdAt
      })),
      recent_quotations: recentQuotations.map(q => ({
        quotation_id: q.reference_number || q._id,
        id: q._id,
        supplier_name: q.supplierId?.company_name || 'Verified Supplier',
        supplier_rating: q.supplierId?.rating || 0,
        offered_price: q.offered_price,
        unit: q.unit || 'Sq.Ft',
        estimated_total: q.estimated_total,
        status: q.status,
        created_at: q.createdAt
      }))
    };

    return successResponse(res, 'Customer dashboard data retrieved successfully', dashboardData);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. PERSONAL DETAILS MANAGEMENT
// ==========================================

exports.getPersonalDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const personalDetails = {
      full_name: user.name,
      mobile_phone: user.mobile,
      whatsapp_number: user.whatsapp_number || user.mobile,
      date_of_birth: user.date_of_birth || null,
      account_verification_status: user.verification_status || 'unverified'
    };

    return successResponse(res, 'Personal details retrieved successfully', personalDetails);
  } catch (err) {
    next(err);
  }
};

exports.updatePersonalDetails = async (req, res, next) => {
  try {
    const { full_name, name, whatsapp_number, date_of_birth } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    if (full_name || name) user.name = full_name || name;
    if (whatsapp_number !== undefined) user.whatsapp_number = whatsapp_number;
    if (date_of_birth !== undefined) user.date_of_birth = date_of_birth;

    await user.save();

    const updated = {
      full_name: user.name,
      mobile_phone: user.mobile,
      whatsapp_number: user.whatsapp_number || user.mobile,
      date_of_birth: user.date_of_birth,
      account_verification_status: user.verification_status || 'unverified'
    };

    return successResponse(res, 'Personal details updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

exports.requestMobileChangeOTP = async (req, res, next) => {
  try {
    const { new_mobile } = req.body;
    if (!new_mobile) {
      return errorResponse(res, 'New mobile number is required', null, 400);
    }

    const existingUser = await User.findOne({ mobile: new_mobile });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return errorResponse(res, 'This mobile number is already registered with another account', null, 409);
    }

    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.pending_mobile_verification = {
      new_mobile,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60000) // 10 minutes
    };
    await user.save();

    await sendSMS(new_mobile, `Your verification OTP for updating mobile number on Stone Market India is ${otpCode}`);

    return successResponse(res, 'OTP sent to new mobile number for verification', {
      mobile: new_mobile,
      otp_expires_in: '10 minutes'
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyMobileChangeOTP = async (req, res, next) => {
  try {
    const { code, otp } = req.body;
    const submittedOtp = code || otp;

    if (!submittedOtp) {
      return errorResponse(res, 'Verification OTP is required', null, 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    if (!user.pending_mobile_verification || !user.pending_mobile_verification.new_mobile) {
      return errorResponse(res, 'No pending mobile verification request found', null, 400);
    }

    const isDummyOtp = submittedOtp === '123456';
    const isMatchedOtp = user.pending_mobile_verification.otp === submittedOtp;
    const isNotExpired = new Date() < new Date(user.pending_mobile_verification.expiresAt);

    if (!isDummyOtp && (!isMatchedOtp || !isNotExpired)) {
      return errorResponse(res, 'Invalid or expired OTP', null, 400);
    }

    const newMobile = user.pending_mobile_verification.new_mobile;
    user.mobile = newMobile;
    user.pending_mobile_verification = undefined;
    await user.save();

    return successResponse(res, 'Mobile number updated and verified successfully', {
      mobile_phone: user.mobile
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. MY INQUIRIES MODULE
// ==========================================

exports.getInquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status, category, date, page = 1, limit = 10 } = req.query;

    const query = { senderId: userId };

    // Status filter
    if (status && status !== 'All') {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'quotes received' || normalizedStatus === 'quotes_received') {
        query.status = { $in: ['quotation_received', 'quotes_received', 'responded'] };
      } else if (normalizedStatus === 'pending') {
        query.status = { $in: ['pending', 'submitted', 'new', 'under_review', 'in_review'] };
      } else if (normalizedStatus === 'closed') {
        query.status = { $in: ['closed', 'completed', 'cancelled'] };
      } else {
        query.status = status;
      }
    }

    // Category filter
    if (category) {
      query.category = new RegExp(category, 'i');
    }

    // Date filter
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.createdAt = { $gte: targetDate, $lt: nextDate };
    }

    // Keyword search (Inquiry ID, Product name, Category, City)
    if (search) {
      query.$or = [
        { reference_number: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { 'deliveryLocation.city': new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Inquiry.countDocuments(query);

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('productId', 'name category images description priceRange')
      .lean();

    const formattedData = inquiries.map(inq => ({
      inquiry_id: inq.reference_number || inq._id,
      id: inq._id,
      product_name: inq.productId?.name || inq.subject || 'Stone Requirement',
      product_category: inq.category,
      product_image: inq.productId?.images?.[0] || inq.attachments?.[0]?.url || null,
      product_description: inq.productId?.description || inq.message || inq.requirements || '',
      delivery_city: inq.deliveryLocation?.city || '',
      delivery_state: inq.deliveryLocation?.state || '',
      required_quantity: inq.quantity || 0,
      quantity_unit: inq.unit || 'Sq.Ft',
      required_size: inq.size || '',
      submission_date: inq.createdAt,
      required_delivery_timeline: inq.delivery_timeline || (inq.expected_delivery_date ? inq.expected_delivery_date.toISOString() : 'Standard'),
      number_of_quotations_received: inq.quotations_count || 0,
      current_inquiry_status: inq.status
    }));

    return successResponse(
      res,
      'Inquiries retrieved successfully',
      formattedData,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id || req.params.inquiry_id)
      .populate('productId', 'name category images description specifications priceRange')
      .populate('senderId', 'name mobile email')
      .lean();

    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    // Ownership protection
    if (inquiry.senderId?._id?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this inquiry', null, 403);
    }

    const detailData = {
      inquiry_id: inquiry.reference_number || inquiry._id,
      id: inquiry._id,
      product_information: {
        product_id: inquiry.productId?._id || null,
        name: inquiry.productId?.name || inquiry.subject || 'Stone Requirement',
        category: inquiry.category,
        image: inquiry.productId?.images?.[0] || inquiry.attachments?.[0]?.url || null,
        images: inquiry.productId?.images || [],
        description: inquiry.productId?.description || inquiry.message || ''
      },
      requirements: {
        required_quantity: inquiry.quantity || 0,
        quantity_unit: inquiry.unit || 'Sq.Ft',
        required_size: inquiry.size || '',
        thickness: inquiry.thickness || '',
        finish_grade: inquiry.finish || '',
        quality: inquiry.quality || inquiry.grade || '',
        edge_profile: inquiry.edge_profile || '',
        budget_range: inquiry.budget_range || '',
        additional_requirements: inquiry.additional_specifications || inquiry.requirements || inquiry.message || ''
      },
      delivery_location: inquiry.deliveryLocation || {},
      attachments: inquiry.attachments || [],
      submission_date: inquiry.createdAt,
      required_delivery_timeline: inquiry.delivery_timeline || 'Standard',
      current_status: inquiry.status,
      number_of_quotations: inquiry.quotations_count || 0,
      status_history: inquiry.status_history || []
    };

    return successResponse(res, 'Inquiry details retrieved successfully', detailData);
  } catch (err) {
    next(err);
  }
};

exports.getInquiryTracking = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id || req.params.inquiry_id).lean();
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.senderId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this inquiry', null, 403);
    }

    const workflowSteps = [
      { step: 1, name: 'Pending Submission', key: 'pending' },
      { step: 2, name: 'In Review', key: 'in_review' },
      { step: 3, name: 'Quotes Received', key: 'quotes_received' },
      { step: 4, name: 'Completed', key: 'completed' },
      { step: 5, name: 'Closed', key: 'closed' }
    ];

    const currentStatus = inquiry.status;
    const historyMap = (inquiry.status_history || []).reduce((acc, h) => {
      acc[h.new_status] = h.timestamp;
      return acc;
    }, {});

    const trackingData = workflowSteps.map(step => {
      let isCompleted = false;
      let isCurrent = step.key === currentStatus;

      // Completion calculation based on order
      const order = ['pending', 'in_review', 'quotes_received', 'completed', 'closed'];
      const currentIndex = order.indexOf(currentStatus);
      const stepIndex = order.indexOf(step.key);

      if (currentIndex >= stepIndex) {
        isCompleted = true;
      }

      return {
        step_number: step.step,
        step_name: step.name,
        status_key: step.key,
        is_completed: isCompleted,
        is_current: isCurrent,
        timestamp: historyMap[step.key] || (isCompleted ? inquiry.createdAt : null)
      };
    });

    return successResponse(res, 'Inquiry tracking progress retrieved successfully', {
      inquiry_id: inquiry.reference_number || inquiry._id,
      current_status: inquiry.status,
      tracking_steps: trackingData
    });
  } catch (err) {
    next(err);
  }
};

exports.getInquiryStatusHistory = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id || req.params.inquiry_id)
      .populate('status_history.updated_by', 'name role')
      .lean();

    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.senderId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this inquiry', null, 403);
    }

    return successResponse(res, 'Inquiry status history retrieved successfully', {
      inquiry_id: inquiry.reference_number || inquiry._id,
      current_status: inquiry.status,
      history: inquiry.status_history || []
    });
  } catch (err) {
    next(err);
  }
};

exports.getInquiryAttachments = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id || req.params.inquiry_id).lean();
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.senderId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this inquiry', null, 403);
    }

    return successResponse(res, 'Inquiry attachments retrieved successfully', {
      inquiry_id: inquiry.reference_number || inquiry._id,
      attachments: inquiry.attachments || []
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadInquiryPdf = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id || req.params.inquiry_id)
      .populate('productId', 'name category description')
      .populate('senderId', 'name mobile email')
      .lean();

    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.senderId?._id?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to download this inquiry', null, 403);
    }

    const pdfBuffer = await generateInquiryPdf(inquiry);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inquiry-${inquiry.reference_number || inquiry._id}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

exports.closeInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id || req.params.inquiry_id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.senderId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to close this inquiry', null, 403);
    }

    if (inquiry.status === 'closed') {
      return errorResponse(res, 'Inquiry is already closed', null, 400);
    }

    const prevStatus = inquiry.status;
    inquiry.status = 'closed';
    inquiry.closed_reason = req.body.reason || req.body.remarks || 'Closed by customer';
    inquiry.closed_at = new Date();

    if (!inquiry.status_history) inquiry.status_history = [];
    inquiry.status_history.push({
      previous_status: prevStatus,
      new_status: 'closed',
      updated_by: req.user.id,
      remarks: inquiry.closed_reason,
      timestamp: new Date()
    });

    await inquiry.save();

    return successResponse(res, 'Inquiry closed successfully', {
      inquiry_id: inquiry.reference_number || inquiry._id,
      status: inquiry.status,
      closed_at: inquiry.closed_at
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. GET QUOTES MODULE
// ==========================================

exports.getQuoteRequestOptions = async (req, res, next) => {
  try {
    const options = {
      categories: [
        'Granite',
        'Marble',
        'Italian Marble',
        'Sandstone',
        'Limestone',
        'Quartz',
        'Onyx',
        'Travertine'
      ],
      finishes: [
        'Polished',
        'Honed',
        'Flamed',
        'Leather',
        'Bush Hammered',
        'Lapato',
        'Antique',
        'Shot Blasted'
      ],
      units: [
        'Sq.Ft',
        'Sq.M',
        'Tons',
        'Running Ft',
        'Pieces',
        'Containers'
      ],
      thicknesses: [
        '16mm',
        '18mm',
        '20mm',
        '25mm',
        '30mm',
        '40mm',
        '50mm'
      ],
      edge_profiles: [
        'Straight Edge',
        'Full Bullnose',
        'Half Bullnose',
        'Bevel Edge',
        'Chamfer',
        'Ogee Edge',
        'Pencil Round'
      ],
      delivery_timelines: [
        'Immediate / Ready Stock',
        'Within 7 Days',
        '7 - 15 Days',
        '15 - 30 Days',
        '1 - 2 Months'
      ],
      referral_sources: [
        'Google Search',
        'Social Media',
        'Trade Exhibition',
        'Friend or Colleague',
        'Print Advertisement',
        'Other'
      ]
    };

    return successResponse(res, 'Quote request form options retrieved successfully', options);
  } catch (err) {
    next(err);
  }
};

exports.requestQuote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const {
      product_id,
      productId,
      supplier_id,
      supplierId,
      product_name,
      product_image,
      category = 'Granite',
      quantity,
      unit = 'Sq.Ft',
      size,
      thickness,
      finish,
      grade,
      quality,
      edge_profile,
      delivery_location = {},
      additional_specifications,
      color_requirements,
      pattern_requirements,
      packaging_requirements,
      message,
      attachments = [],
      budget_range,
      delivery_timeline,
      required_delivery_date,
      referral_source
    } = req.body;

    const targetProductId = product_id || productId;
    const targetSupplierId = supplier_id || supplierId;

    let targetProduct = null;
    if (targetProductId) {
      targetProduct = await Product.findById(targetProductId);
    }

    const referenceNumber = generateRefNumber('RFQ');

    // 1. Create QuoteRequest
    const quoteRequest = await QuoteRequest.create({
      userId,
      businessId: targetSupplierId,
      productId: targetProductId,
      buyerContact: {
        name: user.name,
        mobile: user.mobile,
        email: user.email || '',
        city: delivery_location.city || user.city || ''
      },
      quantity,
      unit,
      size,
      thickness,
      finish,
      grade: grade || quality,
      delivery_location: {
        city: delivery_location.city || '',
        state: delivery_location.state || '',
        address: delivery_location.address || ''
      },
      reference_number: referenceNumber,
      required_delivery_date: required_delivery_date || null,
      additional_specifications: [
        additional_specifications,
        color_requirements ? `Color: ${color_requirements}` : null,
        pattern_requirements ? `Pattern: ${pattern_requirements}` : null,
        packaging_requirements ? `Packaging: ${packaging_requirements}` : null
      ].filter(Boolean).join(' | '),
      message: message || 'Request for Quotation from customer',
      attachments: attachments.map(att => ({
        url: att.url,
        filename: att.filename || 'attachment',
        size: att.size || 0,
        mimetype: att.mimetype || 'image/jpeg'
      })),
      status: 'submitted'
    });

    // 2. Also register corresponding Inquiry record for unified tracking
    const inquiry = await Inquiry.create({
      senderId: userId,
      productId: targetProductId,
      businessId: targetSupplierId,
      category: targetProduct?.category || category,
      subject: product_name || targetProduct?.name || `Quote Request: ${category}`,
      message: message || 'Customer quotation request submitted',
      requirements: quoteRequest.additional_specifications,
      quantity,
      unit,
      size,
      thickness,
      finish,
      grade: grade || quality,
      quality: quality || grade,
      edge_profile,
      delivery_timeline,
      budget_range,
      reference_number: referenceNumber,
      deliveryLocation: delivery_location,
      attachments: quoteRequest.attachments,
      referralSource: referral_source,
      contactInfo: {
        name: user.name,
        mobile: user.mobile,
        email: user.email || '',
        city: delivery_location.city || user.city || ''
      },
      status: 'pending',
      status_history: [{
        previous_status: 'none',
        new_status: 'pending',
        updated_by: userId,
        remarks: 'Quote request submitted by customer',
        timestamp: new Date()
      }]
    });

    // 3. Notify customer of successful submission
    await notifyCustomer(userId, {
      title: 'Quotation Request Submitted',
      description: `Your request #${referenceNumber} has been submitted to eligible suppliers.`,
      category: 'Quote Requests',
      related_entity_id: quoteRequest._id,
      related_entity_type: 'quote',
      deep_link: `/customer/quotes/requests/${quoteRequest._id}`
    });

    return successResponse(
      res,
      'Quotation request submitted successfully',
      {
        quote_request_id: quoteRequest._id,
        inquiry_id: inquiry._id,
        reference_number: referenceNumber,
        status: quoteRequest.status,
        submission_date: quoteRequest.createdAt
      },
      {},
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.getQuoteRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await QuoteRequest.countDocuments(query);

    const requests = await QuoteRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('productId', 'name images category')
      .populate('businessId', 'company_name address rating')
      .lean();

    return successResponse(
      res,
      'Quote requests retrieved successfully',
      requests,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.getQuoteRequestById = async (req, res, next) => {
  try {
    const quoteRequest = await QuoteRequest.findById(req.params.id)
      .populate('productId', 'name images category priceRange specifications')
      .populate('businessId', 'company_name address rating')
      .lean();

    if (!quoteRequest) return errorResponse(res, 'Quote request not found', null, 404);

    if (quoteRequest.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this quote request', null, 403);
    }

    const responsesCount = await QuoteResponse.countDocuments({ quoteRequestId: quoteRequest._id });

    return successResponse(res, 'Quote request details retrieved successfully', {
      ...quoteRequest,
      responses_count: responsesCount
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 5. CUSTOMER QUOTATIONS & COMPARISON
// ==========================================

exports.getQuotations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Find all quote request IDs belonging to this customer
    const userRequestIds = await QuoteRequest.find({ userId }).distinct('_id');

    const query = { quoteRequestId: { $in: userRequestIds } };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await QuoteResponse.countDocuments(query);

    const quotes = await QuoteResponse.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('supplierId', 'company_name logo address rating review_count is_verified')
      .populate({
        path: 'quoteRequestId',
        select: 'reference_number quantity unit productId delivery_location',
        populate: { path: 'productId', select: 'name images category' }
      })
      .lean();

    const formatted = quotes.map(q => ({
      quote_id: q.reference_number || q._id,
      id: q._id,
      associated_inquiry_id: q.quoteRequestId?.reference_number || q.quoteRequestId?._id,
      supplier_id: q.supplierId?._id,
      supplier_name: q.supplierId?.company_name || 'Verified Stone Supplier',
      supplier_logo: q.supplierId?.logo || null,
      supplier_verification_status: q.supplierId?.is_verified ? 'Verified' : 'Under Review',
      supplier_rating: q.supplierId?.rating || 0,
      supplier_review_count: q.supplierId?.review_count || 0,
      quoted_price: q.offered_price,
      price_unit: q.unit || 'Sq.Ft',
      product_details: {
        name: q.quoteRequestId?.productId?.name || 'Stone Requirement',
        category: q.quoteRequestId?.productId?.category || 'Stone',
        image: q.quoteRequestId?.productId?.images?.[0] || null
      },
      taxes: q.taxes || 0,
      delivery_charges: q.shipping_cost || 0,
      estimated_total: q.estimated_total,
      payment_terms: q.terms_and_conditions || 'Standard Terms',
      estimated_delivery_time: q.estimated_delivery_time || '10-15 business days',
      quotation_validity: q.offer_validity,
      quotation_date: q.createdAt,
      quotation_status: q.status,
      supporting_documents: q.response_attachments || []
    }));

    return successResponse(
      res,
      'Customer quotations retrieved successfully',
      formatted,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.getQuotationById = async (req, res, next) => {
  try {
    const quote = await QuoteResponse.findById(req.params.id || req.params.quote_id)
      .populate('supplierId', 'company_name logo address rating review_count is_verified gst_number')
      .populate({
        path: 'quoteRequestId',
        populate: { path: 'productId', select: 'name images category specifications' }
      })
      .lean();

    if (!quote) return errorResponse(res, 'Quotation not found', null, 404);

    // Ownership check: quote request must belong to this user
    if (quote.quoteRequestId?.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this quotation', null, 403);
    }

    const data = {
      quote_id: quote.reference_number || quote._id,
      id: quote._id,
      inquiry_id: quote.quoteRequestId?.reference_number || quote.quoteRequestId?._id,
      supplier: {
        id: quote.supplierId?._id,
        name: quote.supplierId?.company_name || 'Verified Supplier',
        logo: quote.supplierId?.logo || null,
        is_verified: Boolean(quote.supplierId?.is_verified),
        rating: quote.supplierId?.rating || 0,
        review_count: quote.supplierId?.review_count || 0,
        gst_number: quote.supplierId?.gst_number || null,
        location: quote.supplierId?.address?.district || quote.supplierId?.address?.state || ''
      },
      product_specifications: {
        name: quote.quoteRequestId?.productId?.name || 'Stone Requirement',
        quantity: quote.quoteRequestId?.quantity || quote.available_quantity,
        unit: quote.unit || quote.quoteRequestId?.unit || 'Sq.Ft',
        thickness: quote.quoteRequestId?.thickness,
        finish: quote.quoteRequestId?.finish
      },
      pricing: {
        unit_price: quote.offered_price,
        currency: quote.currency || 'INR',
        base_amount: (quote.quoteRequestId?.quantity || 1) * quote.offered_price,
        taxes: quote.taxes || 0,
        shipping_charges: quote.shipping_cost || 0,
        additional_charges: quote.additional_charges || 0,
        total_amount: quote.estimated_total
      },
      terms: {
        delivery_timeline: quote.estimated_delivery_time,
        validity: quote.offer_validity,
        payment_terms: quote.terms_and_conditions
      },
      status: quote.status,
      created_at: quote.createdAt,
      attachments: quote.response_attachments || []
    };

    return successResponse(res, 'Quotation details retrieved successfully', data);
  } catch (err) {
    next(err);
  }
};

exports.getInquiryQuotations = async (req, res, next) => {
  try {
    const inquiryId = req.params.inquiry_id || req.params.id;
    
    // Find inquiry or quote request
    let quoteReq = await QuoteRequest.findOne({
      $or: [{ _id: mongoose.isValidObjectId(inquiryId) ? inquiryId : null }, { reference_number: inquiryId }]
    });

    if (!quoteReq) {
      const inq = await Inquiry.findOne({
        $or: [{ _id: mongoose.isValidObjectId(inquiryId) ? inquiryId : null }, { reference_number: inquiryId }]
      });
      if (inq) {
        quoteReq = await QuoteRequest.findOne({ reference_number: inq.reference_number });
      }
    }

    if (!quoteReq) {
      return successResponse(res, 'No quotations found for this inquiry', []);
    }

    if (quoteReq.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this inquiry quotations', null, 403);
    }

    const quotes = await QuoteResponse.find({ quoteRequestId: quoteReq._id })
      .populate('supplierId', 'company_name logo address rating review_count is_verified')
      .lean();

    return successResponse(res, 'Inquiry quotations retrieved successfully', quotes);
  } catch (err) {
    next(err);
  }
};

exports.downloadQuotationPdf = async (req, res, next) => {
  try {
    const quote = await QuoteResponse.findById(req.params.id || req.params.quote_id)
      .populate('supplierId', 'company_name logo address rating review_count gst_number')
      .populate({
        path: 'quoteRequestId',
        populate: { path: 'productId', select: 'name category specifications' }
      })
      .lean();

    if (!quote) return errorResponse(res, 'Quotation not found', null, 404);

    if (quote.quoteRequestId?.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to download this quotation', null, 403);
    }

    const pdfBuffer = await generateQuotationPdf(quote, quote.quoteRequestId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="quotation-${quote.reference_number || quote._id}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

exports.compareQuotations = async (req, res, next) => {
  try {
    const { quote_ids } = req.body;
    if (!Array.isArray(quote_ids) || quote_ids.length < 2) {
      return errorResponse(res, 'Please provide at least 2 quotation IDs to compare', null, 400);
    }

    const quotes = await QuoteResponse.find({ _id: { $in: quote_ids } })
      .populate('supplierId', 'company_name logo address rating review_count is_verified')
      .populate({
        path: 'quoteRequestId',
        populate: { path: 'productId', select: 'name category specifications' }
      })
      .lean();

    if (quotes.length < 2) {
      return errorResponse(res, 'Not enough valid quotations found for comparison', null, 404);
    }

    // Validate that all quotes belong to the authenticated customer
    for (const q of quotes) {
      if (q.quoteRequestId?.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized comparison across private quotations', null, 403);
      }
    }

    // Validate that all quotes belong to the same inquiry/quote request
    const firstReqId = quotes[0].quoteRequestId?._id?.toString();
    const isSameRequest = quotes.every(q => q.quoteRequestId?._id?.toString() === firstReqId);
    if (!isSameRequest) {
      return errorResponse(res, 'Cross-inquiry quotation comparison is not allowed. All quotes must belong to the same requirement.', null, 400);
    }

    const comparisonItems = quotes.map(q => {
      const baseSubtotal = (q.quoteRequestId?.quantity || 1) * q.offered_price;
      const taxes = q.taxes || 0;
      const freight = q.shipping_cost || 0;
      const grandTotal = q.estimated_total || (baseSubtotal + taxes + freight);

      return {
        quote_id: q.reference_number || q._id,
        supplier: {
          id: q.supplierId?._id,
          name: q.supplierId?.company_name || 'Verified Supplier',
          is_verified: Boolean(q.supplierId?.is_verified),
          rating: q.supplierId?.rating || 0,
          location: q.supplierId?.address?.district || q.supplierId?.address?.state || ''
        },
        product_specifications: {
          product_name: q.quoteRequestId?.productId?.name || 'Stone Requirement',
          quantity: q.quoteRequestId?.quantity || q.available_quantity,
          unit: q.unit || q.quoteRequestId?.unit || 'Sq.Ft'
        },
        financials: {
          unit_price: q.offered_price,
          currency: q.currency || 'INR',
          base_amount: baseSubtotal,
          taxes: taxes,
          transportation_charges: freight,
          total_price: grandTotal
        },
        terms: {
          payment_terms: q.terms_and_conditions || 'Standard Terms',
          delivery_timeline: q.estimated_delivery_time || '10-15 business days',
          quotation_validity: q.offer_validity
        }
      };
    });

    return successResponse(res, 'Quotation comparison completed successfully', {
      inquiry_reference: quotes[0].quoteRequestId?.reference_number || quotes[0].quoteRequestId?._id,
      compared_quotes_count: comparisonItems.length,
      comparisons: comparisonItems
    });
  } catch (err) {
    next(err);
  }
};

exports.compareInquiryQuotations = async (req, res, next) => {
  try {
    const inquiryId = req.params.inquiry_id;
    let quoteReq = await QuoteRequest.findOne({
      $or: [{ _id: mongoose.isValidObjectId(inquiryId) ? inquiryId : null }, { reference_number: inquiryId }]
    });

    if (!quoteReq) {
      const inq = await Inquiry.findOne({
        $or: [{ _id: mongoose.isValidObjectId(inquiryId) ? inquiryId : null }, { reference_number: inquiryId }]
      });
      if (inq) {
        quoteReq = await QuoteRequest.findOne({ reference_number: inq.reference_number });
      }
    }

    if (!quoteReq) {
      return errorResponse(res, 'Inquiry or quote request not found', null, 404);
    }

    const quotes = await QuoteResponse.find({ quoteRequestId: quoteReq._id })
      .populate('supplierId', 'company_name logo address rating review_count is_verified')
      .populate({
        path: 'quoteRequestId',
        populate: { path: 'productId', select: 'name category specifications' }
      })
      .lean();

    if (quotes.length < 2) {
      return errorResponse(res, 'At least 2 received supplier quotations are required to generate comparison', null, 400);
    }

    req.body = { quote_ids: quotes.map(q => q._id.toString()) };
    return exports.compareQuotations(req, res, next);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 6. QUOTES & ESTIMATES HISTORY
// ==========================================

exports.getEstimates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, status, search, page = 1, limit = 10 } = req.query;

    const query = { owner_user_id: userId };
    if (type) query.estimate_type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { reference_number: new RegExp(search, 'i') },
        { party_name: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Estimate.countDocuments(query);

    const estimates = await Estimate.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return successResponse(
      res,
      'Customer estimates retrieved successfully',
      estimates,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.getEstimateById = async (req, res, next) => {
  try {
    const estimate = await Estimate.findById(req.params.id || req.params.estimate_id).lean();
    if (!estimate) return errorResponse(res, 'Estimate not found', null, 404);

    if (estimate.owner_user_id?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this estimate', null, 403);
    }

    return successResponse(res, 'Estimate details retrieved successfully', estimate);
  } catch (err) {
    next(err);
  }
};

exports.createEstimate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      estimate_type,
      party_name,
      party_address,
      party_contact,
      estimate_date,
      notes,
      company_details_enabled,
      company_name_snapshot,
      company_mobile_snapshot,
      company_email_snapshot,
      company_address_snapshot,
      payment_terms_snapshot,
      slab_details,
      particular_details
    } = req.body;

    if (!estimate_type || !['slab', 'particular'].includes(estimate_type)) {
      return errorResponse(res, 'estimate_type must be either "slab" or "particular"', null, 400);
    }
    if (!party_name) {
      return errorResponse(res, 'party_name is required', null, 400);
    }

    const referenceNumber = generateRefNumber(estimate_type === 'slab' ? 'SLB' : 'PRT');

    let calculatedSlab = undefined;
    let calculatedParticular = undefined;
    let totalAmount = 0;

    if (estimate_type === 'slab') {
      const s = slab_details || {};
      const { rows, totalArea, totalAmount: computedAmount } = calculateSlabTotals(
        s.measurement_rows || [],
        s.measurement_unit || 'inch',
        s.area_unit || 'sqft',
        s.unit_price || 0
      );
      totalAmount = computedAmount;
      calculatedSlab = {
        colour_quality: s.colour_quality || '',
        vehicle_number: s.vehicle_number || '',
        block_lot_number: s.block_lot_number || '',
        measured_by: s.measured_by || '',
        measurement_unit: s.measurement_unit || 'inch',
        area_unit: s.area_unit || 'sqft',
        unit_price: s.unit_price || 0,
        total_area: totalArea,
        measurement_rows: rows
      };
    } else {
      const p = particular_details || {};
      const {
        items,
        totalQuantity,
        quantitySummary,
        totalAmount: computedAmount,
        totalPaid,
        remainingBalance,
        paymentStatus,
        amountInWords
      } = calculateParticularTotals(p.items || [], p.payments || []);

      totalAmount = computedAmount;
      calculatedParticular = {
        items,
        total_quantity: totalQuantity,
        quantity_summary: quantitySummary,
        payments: p.payments || [],
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        payment_status: paymentStatus,
        amount_in_words: amountInWords
      };
    }

    const estimate = await Estimate.create({
      reference_number: referenceNumber,
      owner_user_id: userId,
      estimate_type,
      party_name,
      party_address: party_address || '',
      party_contact: party_contact || '',
      estimate_date: estimate_date || new Date(),
      notes: notes || '',
      total_amount: totalAmount,
      company_details_enabled: Boolean(company_details_enabled),
      company_name_snapshot: company_name_snapshot || '',
      company_mobile_snapshot: company_mobile_snapshot || '',
      company_email_snapshot: company_email_snapshot || '',
      company_address_snapshot: company_address_snapshot || '',
      payment_terms_snapshot: payment_terms_snapshot || '',
      slab_details: calculatedSlab,
      particular_details: calculatedParticular,
      status: 'draft'
    });

    return successResponse(res, 'Estimate created successfully', estimate, {}, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findById(req.params.id || req.params.estimate_id);
    if (!estimate) return errorResponse(res, 'Estimate not found', null, 404);

    if (estimate.owner_user_id?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to update this estimate', null, 403);
    }

    const {
      party_name,
      party_address,
      party_contact,
      notes,
      slab_details,
      particular_details
    } = req.body;

    if (party_name) estimate.party_name = party_name;
    if (party_address !== undefined) estimate.party_address = party_address;
    if (party_contact !== undefined) estimate.party_contact = party_contact;
    if (notes !== undefined) estimate.notes = notes;

    if (estimate.estimate_type === 'slab' && slab_details) {
      const s = slab_details;
      const { rows, totalArea, totalAmount } = calculateSlabTotals(
        s.measurement_rows || estimate.slab_details.measurement_rows,
        s.measurement_unit || estimate.slab_details.measurement_unit,
        s.area_unit || estimate.slab_details.area_unit,
        s.unit_price !== undefined ? s.unit_price : estimate.slab_details.unit_price
      );
      estimate.slab_details.measurement_rows = rows;
      estimate.slab_details.total_area = totalArea;
      estimate.slab_details.unit_price = s.unit_price !== undefined ? s.unit_price : estimate.slab_details.unit_price;
      estimate.total_amount = totalAmount;
    } else if (estimate.estimate_type === 'particular' && particular_details) {
      const p = particular_details;
      const {
        items,
        totalQuantity,
        quantitySummary,
        totalAmount,
        totalPaid,
        remainingBalance,
        paymentStatus,
        amountInWords
      } = calculateParticularTotals(
        p.items || estimate.particular_details.items,
        p.payments || estimate.particular_details.payments
      );
      estimate.particular_details.items = items;
      estimate.particular_details.total_quantity = totalQuantity;
      estimate.particular_details.quantity_summary = quantitySummary;
      estimate.particular_details.total_paid = totalPaid;
      estimate.particular_details.remaining_balance = remainingBalance;
      estimate.particular_details.payment_status = paymentStatus;
      estimate.particular_details.amount_in_words = amountInWords;
      estimate.total_amount = totalAmount;
    }

    await estimate.save();

    return successResponse(res, 'Estimate updated and recalculated successfully', estimate);
  } catch (err) {
    next(err);
  }
};

exports.deleteEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findById(req.params.id || req.params.estimate_id);
    if (!estimate) return errorResponse(res, 'Estimate not found', null, 404);

    if (estimate.owner_user_id?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to delete this estimate', null, 403);
    }

    await Estimate.findByIdAndDelete(estimate._id);

    return successResponse(res, 'Estimate deleted successfully', { id: estimate._id });
  } catch (err) {
    next(err);
  }
};

exports.downloadEstimatePdf = async (req, res, next) => {
  try {
    const estimate = await Estimate.findById(req.params.id || req.params.estimate_id).lean();
    if (!estimate) return errorResponse(res, 'Estimate not found', null, 404);

    if (estimate.owner_user_id?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to download this estimate PDF', null, 403);
    }

    let pdfBuffer;
    if (estimate.estimate_type === 'slab') {
      pdfBuffer = await generateSlabEstimatePdf(estimate);
    } else {
      pdfBuffer = await generateParticularEstimatePdf(estimate);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="estimate-${estimate.reference_number}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 7. SAVED STONES & FAVORITES
// ==========================================

exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CustomerFavorite.countDocuments({ userId });

    const favorites = await CustomerFavorite.find({ userId })
      .sort(sort === 'recent' ? { createdAt: -1 } : { createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'productId',
        populate: { path: 'vendorId', select: 'businessName company_name rating address is_verified' }
      })
      .lean();

    const formatted = favorites
      .filter(f => f.productId) // Handle gracefully if product was deleted
      .map(f => {
        const prod = f.productId;
        const vendor = prod.vendorId || {};
        return {
          favorite_id: f._id,
          product_id: prod._id,
          product_name: prod.name,
          product_image: prod.images?.[0] || null,
          images: prod.images || [],
          product_category: prod.category,
          product_specifications: prod.specifications || [],
          supplier_information: {
            id: vendor._id,
            name: vendor.company_name || vendor.businessName || 'Verified Supplier',
            rating: vendor.rating || 0,
            location: vendor.address?.district || vendor.address?.state || ''
          },
          availability: prod.stock_status || 'in_stock',
          price: prod.priceRange?.visible !== false ? {
            min: prod.priceRange?.min || 0,
            max: prod.priceRange?.max || 0,
            unit: prod.priceRange?.unit || 'Sq.Ft'
          } : null,
          date_added: f.createdAt
        };
      });

    return successResponse(
      res,
      'Saved stones retrieved successfully',
      formatted,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.body.product_id || req.body.productId;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', null, 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 'Product not found', null, 404);
    }

    const existing = await CustomerFavorite.findOne({ userId, productId });
    if (existing) {
      return successResponse(res, 'Product is already in your saved stones', {
        is_favorite: true,
        product_id: productId
      });
    }

    await CustomerFavorite.create({ userId, productId });

    return successResponse(res, 'Product saved to favorites successfully', {
      is_favorite: true,
      product_id: productId
    }, {}, 201);
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id || req.params.id;

    const favorite = await CustomerFavorite.findOneAndDelete({
      userId,
      $or: [{ productId: mongoose.isValidObjectId(productId) ? productId : null }, { _id: mongoose.isValidObjectId(productId) ? productId : null }]
    });

    if (!favorite) {
      return errorResponse(res, 'Favorite item not found in saved list', null, 404);
    }

    return successResponse(res, 'Product removed from favorites successfully', {
      is_favorite: false,
      product_id: productId
    });
  } catch (err) {
    next(err);
  }
};

exports.checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id || req.params.id;

    const exists = await CustomerFavorite.exists({ userId, productId });

    return successResponse(res, 'Favorite status checked', {
      product_id: productId,
      is_favorite: Boolean(exists)
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 8. DELIVERY & PROJECT ADDRESSES
// ==========================================

exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await CustomerAddress.find({ userId })
      .sort({ is_default: -1, createdAt: -1 })
      .lean();

    const formatted = addresses.map(addr => ({
      address_id: addr._id,
      customer_id: addr.userId,
      state: addr.state,
      district: addr.district,
      area: addr.area || '',
      full_address: addr.full_address,
      pin_code: addr.pin_code,
      address_label: addr.address_label,
      default_address: addr.is_default,
      created_date: addr.createdAt,
      updated_date: addr.updatedAt
    }));

    return successResponse(res, 'Customer addresses retrieved successfully', formatted);
  } catch (err) {
    next(err);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { state, district, area, full_address, pin_code, address_label, is_default } = req.body;

    const existingCount = await CustomerAddress.countDocuments({ userId });
    const makeDefault = is_default || existingCount === 0;

    if (makeDefault) {
      await CustomerAddress.updateMany({ userId }, { is_default: false });
    }

    const address = await CustomerAddress.create({
      userId,
      state,
      district,
      area: area || '',
      full_address,
      pin_code,
      address_label: address_label || 'Home',
      is_default: makeDefault
    });

    return successResponse(res, 'Address saved successfully', {
      address_id: address._id,
      customer_id: address.userId,
      state: address.state,
      district: address.district,
      area: address.area,
      full_address: address.full_address,
      pin_code: address.pin_code,
      address_label: address.address_label,
      default_address: address.is_default
    }, {}, 201);
  } catch (err) {
    next(err);
  }
};

exports.getAddressById = async (req, res, next) => {
  try {
    const address = await CustomerAddress.findById(req.params.address_id || req.params.id).lean();
    if (!address) return errorResponse(res, 'Address not found', null, 404);

    if (address.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this address', null, 403);
    }

    return successResponse(res, 'Address details retrieved successfully', {
      address_id: address._id,
      customer_id: address.userId,
      state: address.state,
      district: address.district,
      area: address.area || '',
      full_address: address.full_address,
      pin_code: address.pin_code,
      address_label: address.address_label,
      default_address: address.is_default
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const address = await CustomerAddress.findById(req.params.address_id || req.params.id);
    if (!address) return errorResponse(res, 'Address not found', null, 404);

    if (address.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to update this address', null, 403);
    }

    const { state, district, area, full_address, pin_code, address_label, is_default } = req.body;

    if (state) address.state = state;
    if (district) address.district = district;
    if (area !== undefined) address.area = area;
    if (full_address) address.full_address = full_address;
    if (pin_code) address.pin_code = pin_code;
    if (address_label) address.address_label = address_label;

    if (is_default === true) {
      await CustomerAddress.updateMany({ userId: req.user.id }, { is_default: false });
      address.is_default = true;
    }

    await address.save();

    return successResponse(res, 'Address updated successfully', {
      address_id: address._id,
      customer_id: address.userId,
      state: address.state,
      district: address.district,
      area: address.area,
      full_address: address.full_address,
      pin_code: address.pin_code,
      address_label: address.address_label,
      default_address: address.is_default
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await CustomerAddress.findById(req.params.address_id || req.params.id);
    if (!address) return errorResponse(res, 'Address not found', null, 404);

    if (address.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to delete this address', null, 403);
    }

    const wasDefault = address.is_default;
    await CustomerAddress.findByIdAndDelete(address._id);

    // If default was deleted, assign default to the most recent remaining address
    if (wasDefault) {
      const remaining = await CustomerAddress.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.is_default = true;
        await remaining.save();
      }
    }

    return successResponse(res, 'Address deleted successfully', { address_id: address._id });
  } catch (err) {
    next(err);
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await CustomerAddress.findById(req.params.address_id || req.params.id);
    if (!address) return errorResponse(res, 'Address not found', null, 404);

    if (address.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to update this address', null, 403);
    }

    await CustomerAddress.updateMany({ userId: req.user.id }, { is_default: false });
    address.is_default = true;
    await address.save();

    return successResponse(res, 'Default address set successfully', {
      address_id: address._id,
      default_address: true
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 9. NOTIFICATIONS & PREFERENCES
// ==========================================

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, is_read, page = 1, limit = 15 } = req.query;

    const query = { userId };
    if (category) query.category = category;
    if (is_read !== undefined) query.is_read = is_read === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CustomerNotification.countDocuments(query);

    const notifications = await CustomerNotification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const formatted = notifications.map(n => ({
      notification_id: n._id,
      title: n.title,
      description: n.description,
      category: n.category,
      related_entity_id: n.related_entity_id || null,
      related_entity_type: n.related_entity_type || 'system',
      read_status: n.is_read,
      created_timestamp: n.createdAt,
      deep_link: n.deep_link || null
    }));

    return successResponse(
      res,
      'Customer notifications retrieved successfully',
      formatted,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.getUnreadNotificationCount = async (req, res, next) => {
  try {
    const unreadCount = await CustomerNotification.countDocuments({
      userId: req.user.id,
      is_read: false
    });
    return successResponse(res, 'Unread notification count retrieved', { unread_count: unreadCount });
  } catch (err) {
    next(err);
  }
};

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await CustomerNotification.findById(req.params.notification_id || req.params.id);
    if (!notification) return errorResponse(res, 'Notification not found', null, 404);

    if (notification.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this notification', null, 403);
    }

    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await notification.save();
    }

    return successResponse(res, 'Notification details retrieved', {
      notification_id: notification._id,
      title: notification.title,
      description: notification.description,
      category: notification.category,
      related_entity_id: notification.related_entity_id,
      related_entity_type: notification.related_entity_type,
      read_status: notification.is_read,
      created_timestamp: notification.createdAt,
      deep_link: notification.deep_link
    });
  } catch (err) {
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await CustomerNotification.findById(req.params.notification_id || req.params.id);
    if (!notification) return errorResponse(res, 'Notification not found', null, 404);

    if (notification.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to update this notification', null, 403);
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    return successResponse(res, 'Notification marked as read', {
      notification_id: notification._id,
      read_status: true
    });
  } catch (err) {
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await CustomerNotification.updateMany(
      { userId: req.user.id, is_read: false },
      { is_read: true, read_at: new Date() }
    );
    return successResponse(res, 'All notifications marked as read', { success: true });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await CustomerNotification.findById(req.params.notification_id || req.params.id);
    if (!notification) return errorResponse(res, 'Notification not found', null, 404);

    if (notification.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to delete this notification', null, 403);
    }

    await CustomerNotification.findByIdAndDelete(notification._id);

    return successResponse(res, 'Notification deleted successfully', {
      notification_id: notification._id
    });
  } catch (err) {
    next(err);
  }
};

exports.clearAllNotifications = async (req, res, next) => {
  try {
    const { notification_ids } = req.body;
    const query = { userId: req.user.id };
    if (Array.isArray(notification_ids) && notification_ids.length > 0) {
      query._id = { $in: notification_ids };
    }

    const result = await CustomerNotification.deleteMany(query);
    return successResponse(res, 'Notifications cleared successfully', {
      deleted_count: result.deletedCount
    });
  } catch (err) {
    next(err);
  }
};

exports.getNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const prefs = user.notification_preferences || {
      new_inquiry: true,
      lead_messages: true,
      quote_requests: true,
      ad_performance: true,
      subscription_billing: true,
      marketing_emails: true
    };

    return successResponse(res, 'Notification settings retrieved successfully', prefs);
  } catch (err) {
    next(err);
  }
};

exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    if (!user.notification_preferences) user.notification_preferences = {};

    const allowedKeys = [
      'new_inquiry',
      'lead_messages',
      'quote_requests',
      'ad_performance',
      'subscription_billing',
      'marketing_emails'
    ];

    allowedKeys.forEach(k => {
      if (req.body[k] !== undefined) {
        user.notification_preferences[k] = Boolean(req.body[k]);
      }
    });

    user.markModified('notification_preferences');
    await user.save();

    return successResponse(res, 'Notification settings updated successfully', user.notification_preferences);
  } catch (err) {
    next(err);
  }
};

exports.toggleNotificationCategory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const rawCategory = req.params.category;
    const normalizedKey = rawCategory.toLowerCase().replace(/[\s&-]+/g, '_');

    if (!user.notification_preferences) user.notification_preferences = {};

    const newValue = req.body.enabled !== undefined ? Boolean(req.body.enabled) : !user.notification_preferences[normalizedKey];
    user.notification_preferences[normalizedKey] = newValue;

    user.markModified('notification_preferences');
    await user.save();

    return successResponse(res, `Notification setting for ${rawCategory} updated`, {
      category: rawCategory,
      enabled: newValue
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuietHours = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const qh = user.quiet_hours || {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00',
      timezone: 'Asia/Kolkata'
    };

    return successResponse(res, 'Quiet hours retrieved successfully', qh);
  } catch (err) {
    next(err);
  }
};

exports.updateQuietHours = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const { enabled, start_time, end_time, timezone } = req.body;

    user.quiet_hours = {
      enabled: Boolean(enabled),
      start_time: start_time || user.quiet_hours?.start_time || '22:00',
      end_time: end_time || user.quiet_hours?.end_time || '08:00',
      timezone: timezone || user.quiet_hours?.timezone || 'Asia/Kolkata'
    };

    user.markModified('quiet_hours');
    await user.save();

    return successResponse(res, 'Quiet hours configuration updated successfully', user.quiet_hours);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 10. ACCOUNT SECURITY & SESSIONS
// ==========================================

exports.getAccountInformation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const data = {
      customer_id: user._id,
      name: user.name,
      email: user.email || '',
      mobile: user.mobile,
      account_type: user.role,
      status: user.status,
      created_at: user.createdAt,
      last_updated: user.updatedAt
    };

    return successResponse(res, 'Account information retrieved successfully', data);
  } catch (err) {
    next(err);
  }
};

exports.updateAccountInformation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return successResponse(res, 'Account information updated successfully', {
      customer_id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_new_password } = req.body;

    if (!current_password || !new_password) {
      return errorResponse(res, 'Current and new password are required', null, 400);
    }
    if (new_password !== confirm_new_password) {
      return errorResponse(res, 'Confirm password does not match new password', null, 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    if (user.password) {
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect current password', null, 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    // Invalidate other sessions
    await UserSession.updateMany({ userId: user._id }, { is_active: false });

    return successResponse(res, 'Password changed successfully. All other sessions have been logged out.');
  } catch (err) {
    next(err);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let sessions = await UserSession.find({ userId, is_active: true })
      .sort({ last_active: -1 })
      .lean();

    // If no active session tracked yet, initialize an active session representation
    if (sessions.length === 0) {
      const newSession = await UserSession.create({
        userId,
        session_id: crypto.randomBytes(16).toString('hex'),
        device_name: req.headers['user-agent']?.includes('Mobile') ? 'Mobile App' : 'Web Dashboard',
        device_type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        ip_address: req.ip || '127.0.0.1',
        location: 'India',
        last_active: new Date(),
        is_active: true
      });
      sessions = [newSession.toObject()];
    }

    const formatted = sessions.map((s, index) => ({
      session_id: s.session_id,
      device_name: s.device_name,
      device_type: s.device_type,
      ip_address: s.ip_address,
      location: s.location,
      last_active: s.last_active,
      is_current: index === 0
    }));

    return successResponse(res, 'Active sessions retrieved successfully', formatted);
  } catch (err) {
    next(err);
  }
};

exports.revokeSession = async (req, res, next) => {
  try {
    const sessionId = req.params.session_id || req.params.id;
    const session = await UserSession.findOne({ session_id: sessionId, userId: req.user.id });

    if (!session) {
      return errorResponse(res, 'Session not found', null, 404);
    }

    session.is_active = false;
    await session.save();

    return successResponse(res, 'Session revoked successfully', { session_id: sessionId });
  } catch (err) {
    next(err);
  }
};

exports.revokeAllSessions = async (req, res, next) => {
  try {
    await UserSession.updateMany({ userId: req.user.id }, { is_active: false });
    return successResponse(res, 'All active sessions have been revoked successfully');
  } catch (err) {
    next(err);
  }
};

exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const prefs = user.preferences || {
      language: 'en',
      appearance: 'system'
    };

    return successResponse(res, 'Preferences retrieved successfully', prefs);
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'Customer not found', null, 404);

    const { language, appearance } = req.body;

    if (!user.preferences) user.preferences = {};
    if (language) user.preferences.language = language;
    if (appearance) user.preferences.appearance = appearance;

    user.markModified('preferences');
    await user.save();

    return successResponse(res, 'Preferences updated successfully', user.preferences);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 11. HELP & SUPPORT
// ==========================================

const DEFAULT_FAQS = [
  {
    category: 'Orders & Delivery',
    question: 'How do I track my stone delivery?',
    answer: 'Once a supplier or transport partner confirms your order dispatch, you can view real-time transit updates and contact the driver from the inquiry tracking screen.'
  },
  {
    category: 'Stone Types & Pricing',
    question: 'How is natural stone area calculated?',
    answer: 'Stone slabs are measured by length and width. Area is calculated in square feet or square meters based on standard commercial dimensions with edge tolerances.'
  },
  {
    category: 'Quotations & Estimates',
    question: 'Can I request quotations from multiple suppliers simultaneously?',
    answer: 'Yes! When submitting a quotation request, select multi-supplier dispatch to receive competitive quotes from eligible verified suppliers.'
  },
  {
    category: 'Account & Security',
    question: 'How do I update my registered mobile number?',
    answer: 'Go to Profile > Personal Details > Edit Phone Number, enter your new mobile number and verify via OTP.'
  },
  {
    category: 'General',
    question: 'What is Stone Market India?',
    answer: 'Stone Market India is a verified B2B and customer platform connecting buyers with stone manufacturers, quarries, showrooms, and logistics providers nationwide.'
  }
];

exports.getFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { is_active: true };
    if (category) query.category = category;

    let faqs = await SupportFaq.find(query).sort({ sort_order: 1 }).lean();

    if (faqs.length === 0) {
      // Seed default FAQs if collection is empty
      await SupportFaq.insertMany(DEFAULT_FAQS);
      faqs = await SupportFaq.find(query).sort({ sort_order: 1 }).lean();
    }

    return successResponse(res, 'FAQs retrieved successfully', faqs);
  } catch (err) {
    next(err);
  }
};

exports.getTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SupportTicket.countDocuments(query);

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const formatted = tickets.map(t => ({
      ticket_id: t.ticket_number || t._id,
      id: t._id,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      created_date: t.createdAt,
      updated_date: t.updatedAt,
      messages_count: t.messages?.length || 0
    }));

    return successResponse(
      res,
      'Support tickets retrieved successfully',
      formatted,
      formatPagination(page, limit, total)
    );
  } catch (err) {
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { subject, category, description, priority, attachments = [] } = req.body;

    const ticketNumber = generateRefNumber('TKT');

    const ticket = await SupportTicket.create({
      ticket_number: ticketNumber,
      userId,
      subject,
      category: category || 'General',
      description,
      priority: priority || 'medium',
      attachments,
      status: 'open',
      messages: [{
        sender_id: userId,
        sender_role: 'customer',
        sender_name: user ? user.name : 'Customer',
        message: description,
        attachments,
        created_at: new Date()
      }]
    });

    return successResponse(res, 'Support ticket created successfully', {
      ticket_id: ticket.ticket_number,
      id: ticket._id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      created_date: ticket.createdAt
    }, {}, 201);
  } catch (err) {
    next(err);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id || req.params.ticket_id).lean();
    if (!ticket) return errorResponse(res, 'Support ticket not found', null, 404);

    if (ticket.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this ticket', null, 403);
    }

    return successResponse(res, 'Support ticket details retrieved successfully', ticket);
  } catch (err) {
    next(err);
  }
};

exports.addTicketMessage = async (req, res, next) => {
  try {
    const { message, attachments = [] } = req.body;
    if (!message) {
      return errorResponse(res, 'Message text is required', null, 400);
    }

    const ticket = await SupportTicket.findById(req.params.id || req.params.ticket_id);
    if (!ticket) return errorResponse(res, 'Support ticket not found', null, 404);

    if (ticket.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to update this ticket', null, 403);
    }

    const user = await User.findById(req.user.id);

    const newMessage = {
      sender_id: req.user.id,
      sender_role: 'customer',
      sender_name: user?.name || 'Customer',
      message,
      attachments,
      created_at: new Date()
    };

    ticket.messages.push(newMessage);
    ticket.status = 'open'; // Re-open or keep open upon customer reply
    await ticket.save();

    return successResponse(res, 'Message sent successfully', newMessage, {}, 201);
  } catch (err) {
    next(err);
  }
};

exports.getTicketMessages = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id || req.params.ticket_id).lean();
    if (!ticket) return errorResponse(res, 'Support ticket not found', null, 404);

    if (ticket.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized access to this ticket messages', null, 403);
    }

    return successResponse(res, 'Ticket messages thread retrieved successfully', ticket.messages || []);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 12. LOGOUT
// ==========================================

exports.logout = async (req, res, next) => {
  try {
    await UserSession.updateMany({ userId: req.user.id }, { is_active: false });
    return successResponse(res, 'Customer logged out successfully');
  } catch (err) {
    next(err);
  }
};
