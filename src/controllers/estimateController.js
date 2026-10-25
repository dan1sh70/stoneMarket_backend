const Estimate = require('../models/Estimate');
const EstimateAuditLog = require('../models/EstimateAuditLog');
const MeasurementUnit = require('../models/MeasurementUnit');
const { calculateSlabTotals, calculateParticularTotals } = require('../services/estimationService');
const { generateSlabEstimatePdf, generateParticularEstimatePdf } = require('../services/estimatePdfService');

/**
 * Generate unique estimate reference number.
 * e.g. EST-SLAB-2026-00001 or EST-PART-2026-00001
 */
function generateReferenceNumber(type) {
  const prefix = type === 'slab' ? 'EST-SLAB' : 'EST-PART';
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${randomPart}`;
}

// ----------------------------------------------------
// A. SLAB ESTIMATE CONTROLLERS
// ----------------------------------------------------

/**
 * POST /api/v1/estimates/slab
 * Create a new Slab Estimate.
 */
exports.createSlabEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      company_details_enabled,
      company_name,
      company_mobile,
      company_email,
      company_address,
      payment_terms,
      party_name,
      party_address,
      party_contact,
      estimate_date,
      colour_quality,
      vehicle_number,
      block_lot_number,
      measured_by,
      measurement_unit = 'inch',
      area_unit = 'sqft',
      unit_price = 0,
      notes,
      measurement_rows = []
    } = req.body;

    if (!party_name) {
      return res.status(400).json({ success: false, message: 'Party name is required.' });
    }

    if (measurement_rows.length > 700) {
      return res.status(400).json({
        success: false,
        message: 'Maximum allowed measurement rows is 700 per estimate.'
      });
    }

    // Authoritative calculation
    const { rows, totalArea, totalAmount } = calculateSlabTotals(
      measurement_rows,
      measurement_unit,
      area_unit,
      unit_price
    );

    const refNumber = generateReferenceNumber('slab');

    const estimate = await Estimate.create({
      reference_number: refNumber,
      owner_user_id: userId,
      estimate_type: 'slab',
      company_details_enabled: Boolean(company_details_enabled),
      company_name_snapshot: company_name || '',
      company_mobile_snapshot: company_mobile || '',
      company_email_snapshot: company_email || '',
      company_address_snapshot: company_address || '',
      payment_terms_snapshot: payment_terms || '',
      party_name,
      party_address: party_address || '',
      party_contact: party_contact || '',
      estimate_date: estimate_date ? new Date(estimate_date) : new Date(),
      notes: notes || '',
      subtotal: totalAmount,
      total_amount: totalAmount,
      status: 'draft',
      slab_details: {
        colour_quality: colour_quality || '',
        vehicle_number: vehicle_number || '',
        block_lot_number: block_lot_number || '',
        measured_by: measured_by || '',
        measurement_unit,
        area_unit,
        unit_price: Number(unit_price) || 0,
        total_area: totalArea,
        measurement_rows: rows
      }
    });

    // Audit log
    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'CREATED',
      new_values: { total_amount: totalAmount, total_area: totalArea }
    });

    return res.status(201).json({
      success: true,
      message: 'Slab estimate created successfully.',
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/slab
 * List user's Slab Estimates.
 */
exports.listSlabEstimates = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { page = 1, limit = 20, search, status } = req.query;

    const query = { owner_user_id: userId, estimate_type: 'slab' };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { reference_number: { $regex: search, $options: 'i' } },
        { party_name: { $regex: search, $options: 'i' } },
        { 'slab_details.colour_quality': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Estimate.countDocuments(query);
    const estimates = await Estimate.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: estimates,
      meta: {
        current_page: Number(page),
        per_page: Number(limit),
        total,
        last_page: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/slab/:id
 * Get single Slab Estimate with ownership check.
 */
exports.getSlabEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'slab'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Slab estimate not found.' });
    }

    // Ownership check (unless admin)
    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to this estimate is denied.' });
    }

    return res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/estimates/slab/:id
 * Update Slab Estimate.
 */
exports.updateSlabEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'slab'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Slab estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify this estimate.' });
    }

    const {
      company_details_enabled,
      company_name,
      company_mobile,
      company_email,
      company_address,
      payment_terms,
      party_name,
      party_address,
      party_contact,
      estimate_date,
      colour_quality,
      vehicle_number,
      block_lot_number,
      measured_by,
      measurement_unit,
      area_unit,
      unit_price,
      notes,
      measurement_rows
    } = req.body;

    const previousValues = {
      total_amount: estimate.total_amount,
      total_area: estimate.slab_details?.total_area
    };

    if (company_details_enabled !== undefined) estimate.company_details_enabled = Boolean(company_details_enabled);
    if (company_name !== undefined) estimate.company_name_snapshot = company_name;
    if (company_mobile !== undefined) estimate.company_mobile_snapshot = company_mobile;
    if (company_email !== undefined) estimate.company_email_snapshot = company_email;
    if (company_address !== undefined) estimate.company_address_snapshot = company_address;
    if (payment_terms !== undefined) estimate.payment_terms_snapshot = payment_terms;

    if (party_name !== undefined) estimate.party_name = party_name;
    if (party_address !== undefined) estimate.party_address = party_address;
    if (party_contact !== undefined) estimate.party_contact = party_contact;
    if (estimate_date !== undefined) estimate.estimate_date = new Date(estimate_date);
    if (notes !== undefined) estimate.notes = notes;

    const mUnit = measurement_unit || estimate.slab_details.measurement_unit;
    const aUnit = area_unit || estimate.slab_details.area_unit;
    const uPrice = unit_price !== undefined ? Number(unit_price) : estimate.slab_details.unit_price;
    const mRows = measurement_rows !== undefined ? measurement_rows : estimate.slab_details.measurement_rows;

    if (mRows.length > 700) {
      return res.status(400).json({ success: false, message: 'Maximum 700 rows permitted.' });
    }

    const { rows, totalArea, totalAmount } = calculateSlabTotals(mRows, mUnit, aUnit, uPrice);

    estimate.slab_details.colour_quality = colour_quality !== undefined ? colour_quality : estimate.slab_details.colour_quality;
    estimate.slab_details.vehicle_number = vehicle_number !== undefined ? vehicle_number : estimate.slab_details.vehicle_number;
    estimate.slab_details.block_lot_number = block_lot_number !== undefined ? block_lot_number : estimate.slab_details.block_lot_number;
    estimate.slab_details.measured_by = measured_by !== undefined ? measured_by : estimate.slab_details.measured_by;
    estimate.slab_details.measurement_unit = mUnit;
    estimate.slab_details.area_unit = aUnit;
    estimate.slab_details.unit_price = uPrice;
    estimate.slab_details.total_area = totalArea;
    estimate.slab_details.measurement_rows = rows;

    estimate.subtotal = totalAmount;
    estimate.total_amount = totalAmount;

    await estimate.save();

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'UPDATED',
      previous_values: previousValues,
      new_values: { total_amount: totalAmount, total_area: totalArea }
    });

    return res.status(200).json({
      success: true,
      message: 'Slab estimate updated successfully.',
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/estimates/slab/:id
 */
exports.deleteSlabEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'slab'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Slab estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot delete this estimate.' });
    }

    await Estimate.deleteOne({ _id: estimate._id });

    return res.status(200).json({
      success: true,
      message: 'Slab estimate deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/slab/:id/pdf
 * Export Slab Estimate as PDF.
 */
exports.getSlabEstimatePdf = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'slab'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Slab estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to this PDF is denied.' });
    }

    const pdfBuffer = await generateSlabEstimatePdf(estimate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Estimate_${estimate.reference_number}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};


// ----------------------------------------------------
// B. PARTICULAR ESTIMATE CONTROLLERS
// ----------------------------------------------------

/**
 * POST /api/v1/estimates/particular
 * Create a new Particular Estimate.
 */
exports.createParticularEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      company_details_enabled,
      company_name,
      company_mobile,
      company_email,
      company_address,
      payment_terms,
      party_name,
      party_address,
      party_contact,
      estimate_date,
      notes,
      items = [],
      initial_payment
    } = req.body;

    if (!party_name) {
      return res.status(400).json({ success: false, message: 'Party name is required.' });
    }

    // Process initial payments array if supplied
    const initialPayments = [];
    if (initial_payment && Number(initial_payment.amount) > 0) {
      initialPayments.push({
        amount: Number(initial_payment.amount),
        payment_date: initial_payment.payment_date ? new Date(initial_payment.payment_date) : new Date(),
        payment_method: initial_payment.payment_method || 'cash',
        transaction_reference: initial_payment.transaction_reference || '',
        notes: initial_payment.notes || 'Advance Payment',
        status: 'completed',
        created_by: userId
      });
    }

    // Calculate totals
    const calc = calculateParticularTotals(items, initialPayments);

    const refNumber = generateReferenceNumber('particular');

    const estimate = await Estimate.create({
      reference_number: refNumber,
      owner_user_id: userId,
      estimate_type: 'particular',
      company_details_enabled: Boolean(company_details_enabled),
      company_name_snapshot: company_name || '',
      company_mobile_snapshot: company_mobile || '',
      company_email_snapshot: company_email || '',
      company_address_snapshot: company_address || '',
      payment_terms_snapshot: payment_terms || '',
      party_name,
      party_address: party_address || '',
      party_contact: party_contact || '',
      estimate_date: estimate_date ? new Date(estimate_date) : new Date(),
      notes: notes || '',
      subtotal: calc.totalAmount,
      total_amount: calc.totalAmount,
      status: 'draft',
      particular_details: {
        items: calc.items,
        total_quantity: calc.totalQuantity,
        quantity_summary: calc.quantitySummary,
        payments: initialPayments,
        total_paid: calc.totalPaid,
        remaining_balance: calc.remainingBalance,
        payment_status: calc.paymentStatus,
        amount_in_words: calc.amountInWords
      }
    });

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'CREATED',
      new_values: {
        total_amount: calc.totalAmount,
        total_paid: calc.totalPaid,
        remaining_balance: calc.remainingBalance
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Particular estimate created successfully.',
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/particular
 * List Particular Estimates.
 */
exports.listParticularEstimates = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { page = 1, limit = 20, search, status, payment_status } = req.query;

    const query = { owner_user_id: userId, estimate_type: 'particular' };
    if (status) query.status = status;
    if (payment_status) query['particular_details.payment_status'] = payment_status;
    if (search) {
      query.$or = [
        { reference_number: { $regex: search, $options: 'i' } },
        { party_name: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Estimate.countDocuments(query);
    const estimates = await Estimate.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: estimates,
      meta: {
        current_page: Number(page),
        per_page: Number(limit),
        total,
        last_page: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/particular/:id
 */
exports.getParticularEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Particular estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied.' });
    }

    return res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/estimates/particular/:id
 */
exports.updateParticularEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Particular estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify this estimate.' });
    }

    const {
      company_details_enabled,
      company_name,
      company_mobile,
      company_email,
      company_address,
      payment_terms,
      party_name,
      party_address,
      party_contact,
      estimate_date,
      notes,
      items
    } = req.body;

    const previousValues = {
      total_amount: estimate.total_amount,
      remaining_balance: estimate.particular_details?.remaining_balance
    };

    if (company_details_enabled !== undefined) estimate.company_details_enabled = Boolean(company_details_enabled);
    if (company_name !== undefined) estimate.company_name_snapshot = company_name;
    if (company_mobile !== undefined) estimate.company_mobile_snapshot = company_mobile;
    if (company_email !== undefined) estimate.company_email_snapshot = company_email;
    if (company_address !== undefined) estimate.company_address_snapshot = company_address;
    if (payment_terms !== undefined) estimate.payment_terms_snapshot = payment_terms;

    if (party_name !== undefined) estimate.party_name = party_name;
    if (party_address !== undefined) estimate.party_address = party_address;
    if (party_contact !== undefined) estimate.party_contact = party_contact;
    if (estimate_date !== undefined) estimate.estimate_date = new Date(estimate_date);
    if (notes !== undefined) estimate.notes = notes;

    const currentItems = items !== undefined ? items : estimate.particular_details.items;
    const currentPayments = estimate.particular_details.payments || [];

    const calc = calculateParticularTotals(currentItems, currentPayments);

    estimate.subtotal = calc.totalAmount;
    estimate.total_amount = calc.totalAmount;

    estimate.particular_details.items = calc.items;
    estimate.particular_details.total_quantity = calc.totalQuantity;
    estimate.particular_details.quantity_summary = calc.quantitySummary;
    estimate.particular_details.total_paid = calc.totalPaid;
    estimate.particular_details.remaining_balance = calc.remainingBalance;
    estimate.particular_details.payment_status = calc.paymentStatus;
    estimate.particular_details.amount_in_words = calc.amountInWords;

    await estimate.save();

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'UPDATED',
      previous_values: previousValues,
      new_values: {
        total_amount: calc.totalAmount,
        remaining_balance: calc.remainingBalance
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Particular estimate updated successfully.',
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/estimates/particular/:id
 */
exports.deleteParticularEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Particular estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot delete this estimate.' });
    }

    await Estimate.deleteOne({ _id: estimate._id });

    return res.status(200).json({
      success: true,
      message: 'Particular estimate deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/particular/:id/pdf
 */
exports.getParticularEstimatePdf = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Particular estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to this PDF is denied.' });
    }

    const pdfBuffer = await generateParticularEstimatePdf(estimate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Estimate_${estimate.reference_number}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};


// ----------------------------------------------------
// C. PAYMENTS MANAGEMENT FOR PARTICULAR ESTIMATES
// ----------------------------------------------------

/**
 * POST /api/v1/estimates/particular/:id/payments
 * Record an advance or partial payment.
 */
exports.addPayment = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Particular estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot add payment to this estimate.' });
    }

    const { amount, payment_date, payment_method, transaction_reference, notes } = req.body;
    const payAmt = Number(amount);

    if (!payAmt || payAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    const newPayment = {
      amount: payAmt,
      payment_date: payment_date ? new Date(payment_date) : new Date(),
      payment_method: payment_method || 'cash',
      transaction_reference: transaction_reference || '',
      notes: notes || '',
      status: 'completed',
      created_by: userId,
      created_at: new Date()
    };

    estimate.particular_details.payments.push(newPayment);

    // Recalculate totals and balance
    const calc = calculateParticularTotals(
      estimate.particular_details.items,
      estimate.particular_details.payments
    );

    estimate.particular_details.total_paid = calc.totalPaid;
    estimate.particular_details.remaining_balance = calc.remainingBalance;
    estimate.particular_details.payment_status = calc.paymentStatus;
    estimate.particular_details.amount_in_words = calc.amountInWords;

    await estimate.save();

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'PAYMENT_ADDED',
      new_values: {
        payment_amount: payAmt,
        remaining_balance: calc.remainingBalance
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: {
        estimate_id: estimate._id,
        total_amount: estimate.total_amount,
        total_paid: calc.totalPaid,
        remaining_balance: calc.remainingBalance,
        payment_status: calc.paymentStatus,
        amount_in_words: calc.amountInWords,
        payments: estimate.particular_details.payments
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/particular/:id/payments
 */
exports.getPayments = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Particular estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        total_amount: estimate.total_amount,
        total_paid: estimate.particular_details.total_paid,
        remaining_balance: estimate.particular_details.remaining_balance,
        payment_status: estimate.particular_details.payment_status,
        amount_in_words: estimate.particular_details.amount_in_words,
        payments: estimate.particular_details.payments
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/estimates/particular/:id/payments/:payment_id/reverse
 * Reverses a payment rather than destructively deleting it.
 */
exports.reversePayment = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      estimate_type: 'particular'
    });

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const payment = estimate.particular_details.payments.id(req.params.payment_id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (payment.status === 'reversed') {
      return res.status(400).json({ success: false, message: 'Payment has already been reversed.' });
    }

    payment.status = 'reversed';

    const calc = calculateParticularTotals(
      estimate.particular_details.items,
      estimate.particular_details.payments
    );

    estimate.particular_details.total_paid = calc.totalPaid;
    estimate.particular_details.remaining_balance = calc.remainingBalance;
    estimate.particular_details.payment_status = calc.paymentStatus;
    estimate.particular_details.amount_in_words = calc.amountInWords;

    await estimate.save();

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'PAYMENT_REVERSED',
      new_values: {
        reversed_payment_id: req.params.payment_id,
        remaining_balance: calc.remainingBalance
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Payment reversed successfully.',
      data: {
        total_amount: estimate.total_amount,
        total_paid: calc.totalPaid,
        remaining_balance: calc.remainingBalance,
        payment_status: calc.paymentStatus,
        amount_in_words: calc.amountInWords
      }
    });
  } catch (err) {
    next(err);
  }
};


// ----------------------------------------------------
// D. SHARED ESTIMATE OPERATIONS
// ----------------------------------------------------

/**
 * GET /api/v1/estimates
 * Unified listing of all user estimates (both Slab and Particular).
 */
exports.listAllEstimates = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { page = 1, limit = 20, type, status, search } = req.query;

    const query = { owner_user_id: userId };
    if (type) query.estimate_type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { reference_number: { $regex: search, $options: 'i' } },
        { party_name: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Estimate.countDocuments(query);
    const estimates = await Estimate.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: estimates,
      meta: {
        current_page: Number(page),
        per_page: Number(limit),
        total,
        last_page: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/:id
 * Retrieve any estimate by ID with ownership check.
 */
exports.getEstimateById = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findById(req.params.id);

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied.' });
    }

    return res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/estimates/:id/finalize
 */
exports.finalizeEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findById(req.params.id);

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    estimate.status = 'finalized';
    await estimate.save();

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'FINALIZED'
    });

    return res.status(200).json({
      success: true,
      message: 'Estimate finalized successfully.',
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/estimates/:id/cancel
 */
exports.cancelEstimate = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const estimate = await Estimate.findById(req.params.id);

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found.' });
    }

    if (estimate.owner_user_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    estimate.status = 'cancelled';
    await estimate.save();

    await EstimateAuditLog.create({
      estimate_id: estimate._id,
      actor_user_id: userId,
      action: 'CANCELLED'
    });

    return res.status(200).json({
      success: true,
      message: 'Estimate cancelled successfully.',
      data: estimate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/estimates/units
 * Return available measurement units catalogue.
 */
exports.getMeasurementUnits = async (req, res, next) => {
  try {
    const units = await MeasurementUnit.find({ is_active: true });
    return res.status(200).json({
      success: true,
      data: units
    });
  } catch (err) {
    next(err);
  }
};
