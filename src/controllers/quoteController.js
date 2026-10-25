const QuoteRequest = require('../models/QuoteRequest');
const QuoteResponse = require('../models/QuoteResponse');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const BusinessFavorite = require('../models/BusinessFavorite');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create Quote Request (Single or Multi-supplier dispatch)
// @route   POST /api/quotes or /api/quote-requests
// @access  Private (User/Buyer)
exports.createQuoteRequest = async (req, res, next) => {
  try {
    const {
      business_id,
      businessId,
      supplier_id,
      business_ids, // For multi-supplier broadcast
      product_id,
      productId,
      requirement_id,
      requirementId,
      quantity,
      unit = 'Sq.Ft',
      size,
      thickness,
      finish,
      grade,
      delivery_location,
      required_delivery_date,
      additional_specifications,
      message,
      attachments,
      contact_info,
      buyerContact
    } = req.body;

    const targetBusinessId = business_id || businessId || supplier_id;
    const targetProductId = product_id || productId;
    const targetRequirementId = requirement_id || requirementId;
    const resolvedContact = contact_info || buyerContact;

    if (!quantity || quantity <= 0) {
      return errorResponse(res, 'Quantity must be a positive number', null, 400);
    }
    if (!message) {
      return errorResponse(res, 'Message is required for quote request', null, 400);
    }

    // Check buyer business profile if exists
    const buyerProfile = await BusinessProfile.findOne({ userId: req.user.id, business_type: 'buyer' });

    // Multi-supplier dispatch
    if (Array.isArray(business_ids) && business_ids.length > 0) {
      // Validate all business IDs exist
      const foundBusinesses = await BusinessProfile.find({ _id: { $in: business_ids } });
      if (foundBusinesses.length === 0) {
        return errorResponse(res, 'None of the provided suppliers were found', null, 404);
      }

      // Create parent broadcast record
      const parentQuote = await QuoteRequest.create({
        userId: req.user.id,
        buyerProfileId: buyerProfile?._id,
        assignedSuppliers: foundBusinesses.map(b => b._id),
        requirementId: targetRequirementId,
        buyerContact: resolvedContact,
        quantity,
        unit,
        size,
        thickness,
        finish,
        grade,
        delivery_location,
        required_delivery_date,
        additional_specifications,
        message,
        attachments,
        status: 'sent_to_suppliers'
      });

      // Create individual supplier child requests
      const childQuotes = await Promise.all(
        foundBusinesses.map(b => 
          QuoteRequest.create({
            userId: req.user.id,
            businessId: b._id,
            buyerProfileId: buyerProfile?._id,
            parentQuoteId: parentQuote._id,
            requirementId: targetRequirementId,
            buyerContact: resolvedContact,
            quantity,
            unit,
            size,
            thickness,
            finish,
            grade,
            delivery_location,
            required_delivery_date,
            additional_specifications,
            message,
            attachments,
            status: 'submitted'
          })
        )
      );

      return successResponse(res, 'Quote requested to multiple suppliers successfully', {
        parentQuoteId: parentQuote._id,
        dispatchedCount: childQuotes.length,
        quotes: childQuotes
      }, 201);
    }

    // Single supplier dispatch
    if (!targetBusinessId) {
      return errorResponse(res, 'Target business/supplier ID is required', null, 400);
    }

    const business = await BusinessProfile.findById(targetBusinessId);
    if (!business) {
      return errorResponse(res, 'Supplier not found', null, 404);
    }

    // If product specified, verify it belongs to this supplier
    if (targetProductId) {
      const product = await Product.findById(targetProductId);
      if (!product) {
        return errorResponse(res, 'Product not found', null, 404);
      }
      if (product.vendorId.toString() !== business._id.toString()) {
        return errorResponse(res, 'Product does not belong to the selected supplier', null, 400);
      }
    }

    const quote = await QuoteRequest.create({
      userId: req.user.id,
      businessId: business._id,
      buyerProfileId: buyerProfile?._id,
      productId: targetProductId,
      requirementId: targetRequirementId,
      buyerContact: resolvedContact,
      quantity,
      unit,
      size,
      thickness,
      finish,
      grade,
      delivery_location,
      required_delivery_date,
      additional_specifications,
      message,
      attachments,
      status: 'submitted'
    });

    return successResponse(res, 'Quote requested successfully', quote, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Get Quote Details
// @route   GET /api/quotes/:id
// @access  Private (Buyer, Assigned Supplier, Admin)
exports.getQuoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await QuoteRequest.findById(id)
      .populate('businessId', 'company_name address owners')
      .populate('buyerProfileId', 'company_name address')
      .populate('productId', 'name images priceRange')
      .populate('requirementId', 'title material quantity')
      .lean();

    if (!quote) {
      return errorResponse(res, 'Quote request not found', null, 404);
    }

    // Check authorization
    const isBuyer = quote.userId.toString() === req.user.id;
    const supplierBusiness = await BusinessProfile.findOne({ userId: req.user.id });
    const isSupplier = supplierBusiness && quote.businessId?._id?.toString() === supplierBusiness._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSupplier && !isAdmin) {
      return errorResponse(res, 'Not authorized to view this quote request', null, 403);
    }

    // If supplier is viewing for the first time, auto-mark viewed
    if (isSupplier && quote.status === 'submitted') {
      await QuoteRequest.findByIdAndUpdate(id, { status: 'viewed' });
      quote.status = 'viewed';
    }

    return successResponse(res, 'Quote request details retrieved successfully', quote);
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Quotes for Authenticated Buyer
// @route   GET /api/buyer/quotes
// @access  Private (Buyer)
exports.getBuyerQuotes = async (req, res, next) => {
  try {
    const quotes = await QuoteRequest.find({ userId: req.user.id })
      .populate('businessId', 'company_name address')
      .populate('productId', 'name images')
      .populate('requirementId', 'title material')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 'Buyer quotes retrieved successfully', quotes);
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Quote Requests Assigned to Authenticated Supplier
// @route   GET /api/supplier/quote-requests
// @access  Private (Supplier)
exports.getSupplierQuoteRequests = async (req, res, next) => {
  try {
    const supplierBusiness = await BusinessProfile.findOne({ userId: req.user.id });
    if (!supplierBusiness) {
      return errorResponse(res, 'Supplier business profile not found for this user', null, 404);
    }

    const quotes = await QuoteRequest.find({
      $or: [
        { businessId: supplierBusiness._id },
        { assignedSuppliers: supplierBusiness._id }
      ]
    })
      .populate('productId', 'name images')
      .populate('requirementId', 'title material quantity')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 'Supplier quote requests retrieved successfully', quotes);
  } catch (err) {
    next(err);
  }
};

// @desc    Supplier Submits Response to Quote Request
// @route   POST /api/quotes/:id/responses
// @access  Private (Assigned Supplier)
exports.respondToQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      offered_price,
      currency = 'INR',
      unit = 'Sq.Ft',
      available_quantity,
      taxes = 0,
      shipping_cost = 0,
      estimated_delivery_time,
      offer_validity,
      terms_and_conditions,
      response_attachments
    } = req.body;

    if (offered_price === undefined || offered_price === null || offered_price < 0) {
      return errorResponse(res, 'Valid offered price is required', null, 400);
    }

    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return errorResponse(res, 'Quote request not found', null, 404);
    }

    const supplierBusiness = await BusinessProfile.findOne({ userId: req.user.id });
    if (!supplierBusiness) {
      return errorResponse(res, 'Supplier profile required to respond to quote', null, 403);
    }

    // Verify supplier is assigned to this quote
    const isAssigned = 
      (quote.businessId && quote.businessId.toString() === supplierBusiness._id.toString()) ||
      (quote.assignedSuppliers && quote.assignedSuppliers.some(s => s.toString() === supplierBusiness._id.toString()));

    if (!isAssigned && req.user.role !== 'admin') {
      return errorResponse(res, 'You are not assigned to respond to this quotation request', null, 403);
    }

    // Create or update response
    const existingResponse = await QuoteResponse.findOne({ quoteRequestId: id, supplierId: supplierBusiness._id });
    let response;

    if (existingResponse) {
      existingResponse.offered_price = offered_price;
      existingResponse.currency = currency;
      existingResponse.unit = unit;
      existingResponse.available_quantity = available_quantity;
      existingResponse.taxes = taxes;
      existingResponse.shipping_cost = shipping_cost;
      existingResponse.estimated_delivery_time = estimated_delivery_time;
      existingResponse.offer_validity = offer_validity;
      existingResponse.terms_and_conditions = terms_and_conditions;
      if (response_attachments) existingResponse.response_attachments = response_attachments;
      existingResponse.status = 'submitted';
      response = await existingResponse.save();
    } else {
      response = await QuoteResponse.create({
        quoteRequestId: id,
        supplierId: supplierBusiness._id,
        supplierUserId: req.user.id,
        offered_price,
        currency,
        unit,
        available_quantity,
        taxes,
        shipping_cost,
        estimated_delivery_time,
        offer_validity,
        terms_and_conditions,
        response_attachments,
        status: 'submitted'
      });
    }

    // Update quote status
    quote.status = 'responded';
    await quote.save();

    return successResponse(res, 'Quote response submitted successfully', response, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Get Responses for a Quote Request (with Strict Supplier Isolation)
// @route   GET /api/quotes/:id/responses
// @access  Private (Buyer or Assigned Supplier)
exports.getQuoteResponses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return errorResponse(res, 'Quote request not found', null, 404);
    }

    const isBuyer = quote.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const supplierBusiness = await BusinessProfile.findOne({ userId: req.user.id });

    // Buyer or Admin: can see all responses for this quote
    if (isBuyer || isAdmin) {
      const responses = await QuoteResponse.find({ quoteRequestId: id })
        .populate('supplierId', 'company_name address rating review_count')
        .sort({ createdAt: -1 })
        .lean();
      return successResponse(res, 'Quote responses retrieved successfully', responses);
    }

    // Supplier: strictly see ONLY their own response. Never reveal other suppliers' quotes!
    if (supplierBusiness) {
      const response = await QuoteResponse.findOne({ quoteRequestId: id, supplierId: supplierBusiness._id })
        .populate('supplierId', 'company_name address')
        .lean();

      if (!response) {
        return successResponse(res, 'No response submitted by your business yet', []);
      }
      return successResponse(res, 'Your quote response retrieved successfully', [response]);
    }

    return errorResponse(res, 'Not authorized to view responses for this quote', null, 403);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle business favorite (Backward compatible)
// @route   POST /api/traders/:id/favorite, POST /api/buyers/:id/favorite
exports.toggleBusinessFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exists = await BusinessFavorite.findOne({ userId: req.user.id, businessId: id });

    if (exists) {
      if (req.method === 'DELETE') {
        await BusinessFavorite.deleteOne({ _id: exists._id });
        return successResponse(res, 'Business removed from favorites', null);
      }
      return successResponse(res, 'Business is already favorited', null);
    }

    if (req.method === 'POST') {
      await BusinessFavorite.create({ userId: req.user.id, businessId: id });
      return successResponse(res, 'Business favorited successfully', null, 201);
    }

    return errorResponse(res, 'Invalid request method', null, 400);
  } catch (err) {
    next(err);
  }
};
