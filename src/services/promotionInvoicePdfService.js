const PDFDocument = require('pdfkit');

/**
 * Generate PDF buffer for Promotion Invoice
 * @param {Object} invoice PromotionInvoice document (populated or object)
 * @returns {Promise<Buffer>}
 */
function generatePromotionInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const seller = invoice.seller_details || {};
      const buyer = invoice.buyer_details || {};

      // Top Brand Bar (Blue for Feed, Orange for Listing)
      const isFeed = invoice.promotion_type === 'feed';
      const brandColor = isFeed ? '#2563EB' : '#EA580C'; // Blue or Orange

      doc.rect(40, 40, 515, 60).fill(brandColor);
      doc.fillColor('#FFFFFF')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('STONE MARKET INDIA', 55, 52)
        .fontSize(10)
        .font('Helvetica')
        .text('TAX INVOICE — DIGITAL ADVERTISING & PROMOTIONS', 55, 76);

      let currentY = 115;

      // Invoice Meta Info Bar
      doc.rect(40, currentY, 515, 45).fill('#F8FAFC');
      doc.rect(40, currentY, 515, 45).stroke('#E2E8F0');

      doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Bold');
      doc.text(`Invoice No: ${invoice.invoice_number}`, 55, currentY + 10);
      const invDate = invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString();
      doc.text(`Invoice Date: ${invDate}`, 55, currentY + 26);

      doc.text(`Order Ref: ${invoice.order_id?.order_number || invoice.order_id || 'N/A'}`, 240, currentY + 10);
      doc.text(`Transaction Ref: ${invoice.transaction_reference || 'N/A'}`, 240, currentY + 26);

      doc.fillColor('#059669').fontSize(11).text(`Status: ${invoice.payment_status?.toUpperCase() || 'PAID'}`, 430, currentY + 18);

      currentY += 60;

      // Seller and Buyer Columns
      doc.rect(40, currentY, 250, 115).stroke('#CBD5E1');
      doc.rect(305, currentY, 250, 115).stroke('#CBD5E1');

      // Seller Details
      doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text('Issued By (Service Provider):', 50, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      doc.text(seller.company_name || 'Stone Market India Pvt. Ltd.', 50, currentY + 25);
      doc.text(seller.address || 'RIICO Industrial Area, Kishangarh, Rajasthan', 50, currentY + 38, { width: 230 });
      doc.text(`GSTIN: ${seller.gstin || '08AAAAA0000A1Z5'}`, 50, currentY + 68);
      doc.text(`State: ${seller.state || 'Rajasthan'} (Code: ${seller.state_code || '08'})`, 50, currentY + 81);
      doc.text(`Email: ${seller.email || 'billing@stonemarketindia.com'}`, 50, currentY + 94);

      // Buyer Details
      doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text('Billed To (Advertiser):', 315, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      doc.text(buyer.company_name || 'Manufacturer / Business', 315, currentY + 25);
      doc.text(buyer.billing_address || 'India', 315, currentY + 38, { width: 230 });
      doc.text(`GSTIN: ${buyer.gstin || 'Unregistered / Consumer'}`, 315, currentY + 68);
      doc.text(`State: ${buyer.state || 'Rajasthan'} (Code: ${buyer.state_code || '08'})`, 315, currentY + 81);
      doc.text(`Phone: ${buyer.phone || 'N/A'}`, 315, currentY + 94);

      currentY += 130;

      // Table Header
      doc.rect(40, currentY, 515, 25).fill('#F1F5F9');
      doc.rect(40, currentY, 515, 25).stroke('#CBD5E1');
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold');
      doc.text('SI', 50, currentY + 8);
      doc.text('Description of Promotion Service', 80, currentY + 8);
      doc.text('Duration', 310, currentY + 8);
      doc.text('SAC Code', 380, currentY + 8);
      doc.text('Amount (INR)', 465, currentY + 8);

      currentY += 25;

      // Table Row
      doc.rect(40, currentY, 515, 45).stroke('#E2E8F0');
      doc.fillColor('#1E293B').font('Helvetica').fontSize(9);
      doc.text('1', 50, currentY + 10);
      
      const typeLabel = isFeed ? 'Feed Product Discovery Promotion' : 'Manufacturer Profile Directory Boost';
      doc.font('Helvetica-Bold').text(`${typeLabel} - ${invoice.package_name}`, 80, currentY + 10);
      doc.font('Helvetica').fontSize(8).fillColor('#64748B').text(`Campaign ID: ${invoice.campaign_id?.campaign_id || invoice.campaign_id || 'N/A'}`, 80, currentY + 24);
      
      doc.font('Helvetica').fontSize(9).fillColor('#1E293B');
      doc.text(`${invoice.duration_days} Days`, 310, currentY + 10);
      doc.text('998365', 380, currentY + 10); // SAC code for Internet advertising
      doc.text(`Rs. ${(Number(invoice.taxable_amount) || 0).toFixed(2)}`, 465, currentY + 10);

      currentY += 55;

      // Summary / Totals Breakdown
      const summaryLeft = 320;
      doc.rect(summaryLeft, currentY, 235, 125).stroke('#CBD5E1');

      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text('Taxable Value (Subtotal):', summaryLeft + 15, currentY + 10);
      doc.text(`Rs. ${(Number(invoice.taxable_amount) || 0).toFixed(2)}`, summaryLeft + 155, currentY + 10);

      if (invoice.cgst_amount > 0 || invoice.sgst_amount > 0) {
        doc.text(`CGST @ ${invoice.cgst_rate || 9}%:`, summaryLeft + 15, currentY + 28);
        doc.text(`Rs. ${(Number(invoice.cgst_amount) || 0).toFixed(2)}`, summaryLeft + 155, currentY + 28);

        doc.text(`SGST @ ${invoice.sgst_rate || 9}%:`, summaryLeft + 15, currentY + 46);
        doc.text(`Rs. ${(Number(invoice.sgst_amount) || 0).toFixed(2)}`, summaryLeft + 155, currentY + 46);
      } else {
        doc.text(`IGST @ ${invoice.igst_rate || 18}%:`, summaryLeft + 15, currentY + 28);
        doc.text(`Rs. ${(Number(invoice.igst_amount || invoice.gst_amount) || 0).toFixed(2)}`, summaryLeft + 155, currentY + 28);
      }

      doc.text(`Total GST (18%):`, summaryLeft + 15, currentY + 64);
      doc.text(`Rs. ${(Number(invoice.gst_amount) || 0).toFixed(2)}`, summaryLeft + 155, currentY + 64);

      // Line
      doc.moveTo(summaryLeft + 10, currentY + 82).lineTo(summaryLeft + 225, currentY + 82).stroke('#E2E8F0');

      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11);
      doc.text('Total Payable:', summaryLeft + 15, currentY + 95);
      doc.text(`Rs. ${(Number(invoice.total_amount) || 0).toFixed(2)}`, summaryLeft + 150, currentY + 95);

      // Notes & Bank details on Left
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold').text('Payment Information:', 45, currentY + 10);
      doc.font('Helvetica').fontSize(8).fillColor('#475569');
      doc.text('Payment Gateway: Razorpay / UPI / Card', 45, currentY + 24);
      doc.text(`Transaction Reference: ${invoice.transaction_reference || 'N/A'}`, 45, currentY + 36);
      doc.text('Payment Status: Confirmed & Reconciled', 45, currentY + 48);

      doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold').text('Terms & Conditions:', 45, currentY + 66);
      doc.font('Helvetica').fontSize(7.5).fillColor('#64748B');
      doc.text('1. Digital advertising services are non-refundable once campaign activation is complete.', 45, currentY + 78, { width: 260 });
      doc.text('2. This is a computer-generated invoice and requires no physical signature under the IT Act.', 45, currentY + 95, { width: 260 });

      // Footer
      currentY += 150;
      doc.rect(40, currentY, 515, 30).fill('#F8FAFC');
      doc.fillColor('#64748B').fontSize(8).font('Helvetica')
        .text('Stone Market India — Transforming Stone Commerce Across India | www.stonemarketindia.com', 55, currentY + 10, { align: 'center', width: 485 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generatePromotionInvoicePdf
};
