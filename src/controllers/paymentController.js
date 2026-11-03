const PromotionCampaign = require('../models/PromotionCampaign');
const PromotionOrder = require('../models/PromotionOrder');
const Payment = require('../models/Payment');
const PromotionInvoice = require('../models/PromotionInvoice');
const CampaignActivityLog = require('../models/CampaignActivityLog');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const paymentService = require('../services/paymentService');
const { verifyPaymentSchema } = require('../validations/promotion.validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * POST /api/payments/create-order
 * Create or retrieve a gateway order for a promotion order
 */
async function createPaymentOrder(req, res) {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return errorResponse(res, 'order_id is required', null, 400);
    }

    const order = await PromotionOrder.findOne({
      $or: [
        { _id: order_id.match(/^[0-9a-fA-F]{24}$/) ? order_id : null },
        { order_number: order_id }
      ].filter(Boolean)
    }).populate('campaign_id').populate('package_id');

    if (!order) {
      return errorResponse(res, 'Promotion order not found', null, 404);
    }

    if (order.order_status === 'completed') {
      return errorResponse(res, 'This order has already been paid and processed', null, 400);
    }

    // Generate or return existing gateway order
    const gatewayOrder = await paymentService.createGatewayOrder({
      amount: order.total_amount,
      currency: 'INR',
      receipt: order.order_number,
      notes: {
        order_id: order._id.toString(),
        campaign_id: order.campaign_id?._id?.toString()
      }
    });

    order.gateway_order_id = gatewayOrder.gateway_order_id;
    await order.save();

    return successResponse(res, 'Payment gateway order created', {
      order_id: order._id,
      order_number: order.order_number,
      gateway_order_id: gatewayOrder.gateway_order_id,
      amount: order.total_amount,
      currency: 'INR',
      key_id: paymentService.keyId
    });
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/payments/verify
 * Cryptographically verify payment signature, activate campaign, and generate invoice
 */
async function verifyPayment(req, res) {
  try {
    const { error, value } = verifyPaymentSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 400);
    }

    const { order_id, gateway_order_id, gateway_payment_id, gateway_signature } = value;

    // Retrieve order
    const order = await PromotionOrder.findOne({
      $or: [
        { _id: order_id.match(/^[0-9a-fA-F]{24}$/) ? order_id : null },
        { order_number: order_id }
      ].filter(Boolean)
    }).populate('campaign_id').populate('package_id').populate('manufacturer_id');

    if (!order) {
      return errorResponse(res, 'Promotion order not found', null, 404);
    }

    // Idempotency check: if already completed, return existing success response
    if (order.order_status === 'completed') {
      const existingPayment = await Payment.findOne({ order_id: order._id, payment_status: 'successful' });
      const existingInvoice = await PromotionInvoice.findOne({ order_id: order._id });
      return successResponse(res, 'Payment already verified and campaign active', {
        campaign_id: order.campaign_id?.campaign_id,
        campaign_status: 'active',
        order_status: 'completed',
        payment_reference: existingPayment?.payment_reference || gateway_payment_id,
        invoice_number: existingInvoice?.invoice_number || null
      });
    }

    // Verify signature securely
    const isValidSignature = paymentService.verifyPaymentSignature({
      orderId: gateway_order_id,
      paymentId: gateway_payment_id,
      signature: gateway_signature
    });

    if (!isValidSignature) {
      // Record failed payment attempt
      await Payment.create({
        payment_reference: `PAY-FAIL-${Date.now()}`,
        order_id: order._id,
        campaign_id: order.campaign_id._id,
        manufacturer_id: order.manufacturer_id._id,
        userId: order.userId,
        gateway_order_id,
        gateway_payment_id,
        gateway_signature,
        transaction_reference: gateway_payment_id,
        amount: order.total_amount,
        payment_status: 'failed',
        error_message: 'Cryptographic signature mismatch'
      });

      return errorResponse(res, 'Invalid payment signature. Verification failed.', null, 400);
    }

    // 1. Record successful payment
    const paymentRef = `PAY-SMI-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const payment = await Payment.create({
      payment_reference: paymentRef,
      order_id: order._id,
      campaign_id: order.campaign_id._id,
      manufacturer_id: order.manufacturer_id._id,
      userId: order.userId,
      payment_gateway: 'razorpay',
      gateway_order_id,
      gateway_payment_id,
      gateway_signature,
      transaction_reference: gateway_payment_id,
      amount: order.total_amount,
      currency: 'INR',
      payment_status: 'successful',
      payment_verified_at: new Date()
    });

    // 2. Update PromotionOrder
    order.order_status = 'completed';
    await order.save();

    // 3. Activate Campaign
    const campaign = await PromotionCampaign.findById(order.campaign_id._id);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + campaign.duration_days * 24 * 60 * 60 * 1000);

    campaign.campaign_status = 'active';
    campaign.start_date = startDate;
    campaign.end_date = endDate;
    await campaign.save();

    // 4. Activate marketplace boosts
    if (campaign.campaign_type === 'feed' && campaign.product_id) {
      await Product.findByIdAndUpdate(campaign.product_id, {
        is_promoted: true,
        active_promotion_id: campaign._id,
        promotion_priority: campaign.priority_score
      });
    } else if (campaign.campaign_type === 'listing') {
      await BusinessProfile.findByIdAndUpdate(campaign.manufacturer_id, {
        is_promoted: true,
        active_promotion_id: campaign._id,
        promotion_priority: campaign.priority_score,
        promoted_badge: 'Featured Supplier'
      });
    }

    // 5. Generate Tax Invoice (GST 18%)
    const invoiceNumber = `INV-SMI-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const profile = order.manufacturer_id;
    const buyerState = profile.address?.state || 'Rajasthan';
    const taxCalc = paymentService.calculateGst(campaign.subtotal, buyerState);

    const invoice = await PromotionInvoice.create({
      invoice_number: invoiceNumber,
      invoice_date: new Date(),
      manufacturer_id: profile._id,
      userId: order.userId,
      campaign_id: campaign._id,
      order_id: order._id,
      payment_id: payment._id,
      seller_details: {
        company_name: 'Stone Market India Pvt. Ltd.',
        legal_name: 'Stone Market India Private Limited',
        address: 'RIICO Industrial Area, Kishangarh, Rajasthan - 305801',
        state: 'Rajasthan',
        state_code: '08',
        gstin: '08AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        phone: '+91 98765 43210',
        email: 'billing@stonemarketindia.com'
      },
      buyer_details: {
        company_name: profile.company_name,
        billing_address: profile.address?.full_address || `${profile.address?.district || 'Jaipur'}, ${profile.address?.state || 'Rajasthan'}`,
        state: buyerState,
        state_code: buyerState.toLowerCase() === 'rajasthan' ? '08' : '27',
        gstin: profile.gst_number || '',
        phone: profile.owners?.[0]?.phone || '',
        email: profile.owners?.[0]?.email || ''
      },
      promotion_type: campaign.campaign_type,
      package_name: order.package_id?.package_name || 'Standard Promotion Package',
      duration_days: campaign.duration_days,
      taxable_amount: taxCalc.subtotal,
      gst_rate: taxCalc.gst_rate,
      cgst_rate: taxCalc.cgst_rate,
      cgst_amount: taxCalc.cgst_amount,
      sgst_rate: taxCalc.sgst_rate,
      sgst_amount: taxCalc.sgst_amount,
      igst_rate: taxCalc.igst_rate,
      igst_amount: taxCalc.igst_amount,
      gst_amount: taxCalc.gst_amount,
      total_amount: taxCalc.total_amount,
      payment_status: 'paid',
      transaction_reference: gateway_payment_id
    });

    // 6. Audit Logs
    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'payment_successful',
      previous_status: 'pending_payment',
      new_status: 'active',
      performed_by: order.userId,
      metadata: { payment_id: payment._id, invoice_number: invoice.invoice_number }
    });

    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'activated',
      previous_status: 'pending_payment',
      new_status: 'active',
      performed_by: order.userId,
      metadata: { start_date: startDate, end_date: endDate }
    });

    return successResponse(res, 'Payment verified successfully and campaign activated', {
      campaign_id: campaign.campaign_id,
      campaign_status: campaign.campaign_status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      order_number: order.order_number,
      payment_reference: payment.payment_reference,
      transaction_reference: gateway_payment_id,
      invoice_number: invoice.invoice_number,
      invoice_id: invoice._id,
      total_paid: taxCalc.total_amount
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/payments/webhook
 * Razorpay / Indian Payment Gateway Webhook
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payloadString = JSON.stringify(req.body);

    // If webhook secret configured, verify signature
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = paymentService.verifyWebhookSignature({
        payloadString,
        signature
      });
      if (!isValid) {
        return errorResponse(res, 'Invalid webhook signature', null, 400);
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity || {};
      const gatewayOrderId = paymentEntity.order_id;
      const gatewayPaymentId = paymentEntity.id;

      if (gatewayOrderId) {
        const order = await PromotionOrder.findOne({ gateway_order_id: gatewayOrderId })
          .populate('campaign_id').populate('package_id').populate('manufacturer_id');

        if (order && order.order_status !== 'completed') {
          // Trigger same activation workflow
          order.order_status = 'completed';
          await order.save();

          const campaign = await PromotionCampaign.findById(order.campaign_id._id);
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + campaign.duration_days * 24 * 60 * 60 * 1000);

          campaign.campaign_status = 'active';
          campaign.start_date = startDate;
          campaign.end_date = endDate;
          await campaign.save();

          if (campaign.campaign_type === 'feed' && campaign.product_id) {
            await Product.findByIdAndUpdate(campaign.product_id, {
              is_promoted: true,
              active_promotion_id: campaign._id,
              promotion_priority: campaign.priority_score
            });
          } else if (campaign.campaign_type === 'listing') {
            await BusinessProfile.findByIdAndUpdate(campaign.manufacturer_id, {
              is_promoted: true,
              active_promotion_id: campaign._id,
              promotion_priority: campaign.priority_score,
              promoted_badge: 'Featured Supplier'
            });
          }
        }
      }
    }

    return successResponse(res, 'Webhook processed successfully', { received: true });
  } catch (error) {
    console.error('Error in handleWebhook:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/payments/:id/status
 * Get Payment Record Status
 */
async function getPaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { payment_reference: id },
        { gateway_payment_id: id },
        { transaction_reference: id }
      ].filter(Boolean)
    }).populate('order_id').populate('campaign_id');

    if (!payment) {
      return errorResponse(res, 'Payment record not found', null, 404);
    }

    return successResponse(res, 'Payment status retrieved', payment);
  } catch (error) {
    console.error('Error in getPaymentStatus:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentStatus
};
