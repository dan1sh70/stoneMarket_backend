const PromotionInvoice = require('../models/PromotionInvoice');
const BusinessProfile = require('../models/BusinessProfile');
const { generatePromotionInvoicePdf } = require('../services/promotionInvoicePdfService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/manufacturer/invoices
 * List all promotion invoices for authenticated manufacturer
 */
async function getManufacturerInvoices(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await BusinessProfile.findOne({ userId, business_type: 'manufacturer' });

    const query = profile ? {
      $or: [{ manufacturer_id: profile._id }, { userId }]
    } : { userId };

    const invoices = await PromotionInvoice.find(query)
      .populate('campaign_id', 'campaign_id campaign_name campaign_type duration_days')
      .populate('order_id', 'order_number')
      .sort({ createdAt: -1 });

    const formatted = invoices.map(inv => ({
      _id: inv._id,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      promotion_type: inv.promotion_type,
      package_name: inv.package_name,
      duration_days: inv.duration_days,
      taxable_amount: inv.taxable_amount,
      gst_amount: inv.gst_amount,
      total_amount: inv.total_amount,
      payment_status: inv.payment_status,
      transaction_reference: inv.transaction_reference,
      campaign_name: inv.campaign_id?.campaign_name || 'Promotion Campaign',
      order_number: inv.order_id?.order_number || 'N/A',
      download_url: `/api/manufacturer/invoices/${inv._id}/download`
    }));

    return successResponse(res, 'Invoices retrieved successfully', {
      count: formatted.length,
      invoices: formatted
    });
  } catch (error) {
    console.error('Error in getManufacturerInvoices:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/invoices/:id
 * Get single invoice details
 */
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const invoice = await PromotionInvoice.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { invoice_number: id }
      ].filter(Boolean)
    }).populate('campaign_id').populate('order_id').populate('payment_id');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', null, 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && invoice.userId.toString() !== userId.toString()) {
      const profile = await BusinessProfile.findOne({ userId, business_type: 'manufacturer' });
      if (!profile || invoice.manufacturer_id.toString() !== profile._id.toString()) {
        return errorResponse(res, 'Not authorized to view this invoice', null, 403);
      }
    }

    return successResponse(res, 'Invoice retrieved successfully', invoice);
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/invoices/:id/download
 * Download invoice PDF stream
 */
async function downloadInvoicePdf(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const invoice = await PromotionInvoice.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { invoice_number: id }
      ].filter(Boolean)
    }).populate('campaign_id').populate('order_id');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', null, 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && invoice.userId.toString() !== userId.toString()) {
      const profile = await BusinessProfile.findOne({ userId, business_type: 'manufacturer' });
      if (!profile || invoice.manufacturer_id.toString() !== profile._id.toString()) {
        return errorResponse(res, 'Not authorized to download this invoice', null, 403);
      }
    }

    const pdfBuffer = await generatePromotionInvoicePdf(invoice);

    const filename = `Invoice-${invoice.invoice_number}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('Error in downloadInvoicePdf:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getManufacturerInvoices,
  getInvoiceById,
  downloadInvoicePdf
};
