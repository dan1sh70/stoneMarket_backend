const PDFDocument = require('pdfkit');

/**
 * Generate PDF for Supplier Quotation
 * Returns a Promise that resolves with a Buffer.
 */
function generateQuotationPdf(quoteResponse, quoteRequest) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const supplier = quoteResponse.manufacturer_id || quoteResponse.supplierId || {};
      const reqDoc = quoteRequest || quoteResponse.inquiry_id || quoteResponse.quoteRequestId || {};

      // Header Bar
      doc.rect(40, 40, 515, 45).fill('#1A202C');
      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('STONE MARKET INDIA', 55, 48)
        .fontSize(11)
        .font('Helvetica')
        .text('SUPPLIER QUOTATION', 55, 66);

      let currentY = 105;

      // Quote Reference Bar
      doc.rect(40, currentY, 515, 30).fill('#F7FAFC');
      doc.rect(40, currentY, 515, 30).stroke('#E2E8F0');
      doc.fillColor('#2D3748').fontSize(10).font('Helvetica-Bold');
      const qNum = quoteResponse.quote_number || quoteResponse.reference_number || quoteResponse._id;
      doc.text(`Quotation ID: ${qNum}`, 50, currentY + 10);

      const statusText = (quoteResponse.quote_status || quoteResponse.status || 'submitted').toUpperCase().replace(/_/g, ' ');
      doc.fillColor('#2B6CB0').text(`Status: ${statusText}`, 380, currentY + 10);
      currentY += 45;

      // 2-Column: Supplier Details (Left) and Customer / Inquiry Ref (Right)
      doc.rect(40, currentY, 250, 100).stroke('#E2E8F0');
      doc.rect(305, currentY, 250, 100).stroke('#E2E8F0');

      // Left: Supplier Details
      doc.fillColor('#2D3748').fontSize(11).font('Helvetica-Bold')
        .text('Supplier Details', 50, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
      
      const supplierName = supplier.company_name || supplier.businessName || 'Verified Stone Supplier';
      const supplierCity = supplier.address?.district || supplier.address?.state || supplier.delivery_location || 'India';
      const supplierRating = supplier.rating ? `Rating: ${supplier.rating.toFixed(1)}/5 (${supplier.review_count || 0} reviews)` : 'Verified Supplier';

      doc.text(`Company: ${supplierName}`, 50, currentY + 28);
      doc.text(`Location: ${supplierCity}`, 50, currentY + 43);
      if (supplier.gst_number) {
        doc.text(`GST: ${supplier.gst_number}`, 50, currentY + 58);
      } else {
        doc.text(`Verified: Yes`, 50, currentY + 58);
      }
      doc.text(supplierRating, 50, currentY + 73);

      // Right: Quotation & Requirement Info
      doc.fillColor('#2D3748').fontSize(11).font('Helvetica-Bold')
        .text('Quotation Terms', 315, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#4A5568');

      const quoteDate = quoteResponse.createdAt ? new Date(quoteResponse.createdAt).toLocaleDateString('en-IN') : 'N/A';
      const valDateVal = quoteResponse.validity_date || quoteResponse.offer_validity;
      const validityDate = valDateVal ? new Date(valDateVal).toLocaleDateString('en-IN') : '30 Days';

      doc.text(`Quote Date: ${quoteDate}`, 315, currentY + 28);
      doc.text(`Validity: Valid until ${validityDate}`, 315, currentY + 43);
      doc.text(`Delivery: ${quoteResponse.delivery_timeline || quoteResponse.estimated_delivery_time || '10-15 business days'}`, 315, currentY + 58);
      const inqRef = reqDoc.inquiry_number || reqDoc.reference_number || reqDoc._id || 'Standard RFQ';
      doc.text(`Inquiry Ref: ${inqRef}`, 315, currentY + 73);

      currentY += 120;

      // Product & Itemized Financial Table
      doc.fillColor('#1A202C').fontSize(12).font('Helvetica-Bold')
        .text('Quoted Items & Pricing Breakdown', 40, currentY);
      currentY += 18;

      const tableTop = currentY;
      doc.rect(40, tableTop, 515, 22).fill('#EDF2F7');
      doc.fillColor('#2D3748').fontSize(9).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop + 6);
      doc.text('Qty / Unit', 260, tableTop + 6);
      doc.text('Rate', 360, tableTop + 6);
      doc.text('Amount (INR)', 450, tableTop + 6, { align: 'right', width: 95 });

      currentY += 22;

      const productName = reqDoc.requirement_title || reqDoc.productId?.name || reqDoc.subject || 'Stone Material';
      const qty = quoteResponse.quoted_quantity || reqDoc.required_quantity || reqDoc.quantity || quoteResponse.available_quantity || 1;
      const unit = quoteResponse.quantity_unit || quoteResponse.unit || reqDoc.quantity_unit || reqDoc.unit || 'Sq.Ft';
      const rate = quoteResponse.unit_price || quoteResponse.offered_price || 0;
      const baseSubtotal = quoteResponse.subtotal || (qty * rate);

      doc.rect(40, currentY, 515, 24).fill('#FFFFFF').stroke('#E2E8F0');
      doc.fillColor('#2D3748').font('Helvetica').fontSize(9);
      doc.text(productName, 50, currentY + 6);
      doc.text(`${qty} ${unit}`, 260, currentY + 6);
      doc.text(`Rs. ${Number(rate).toFixed(2)}`, 360, currentY + 6);
      doc.text(`Rs. ${Number(baseSubtotal).toFixed(2)}`, 450, currentY + 6, { align: 'right', width: 95 });

      currentY += 32;

      // Financial Calculation Summary Box (Right aligned)
      const summaryLeft = 320;
      const summaryWidth = 235;

      const taxes = quoteResponse.tax_amount || quoteResponse.taxes || 0;
      const shipping = quoteResponse.shipping_charges || quoteResponse.shipping_cost || 0;
      const discount = quoteResponse.discount || 0;
      const additional = quoteResponse.additional_charges || 0;
      const grandTotal = quoteResponse.total_amount || quoteResponse.estimated_total || (baseSubtotal + taxes + shipping + additional - discount);

      const summaryRows = [
        ['Subtotal', `Rs. ${Number(baseSubtotal).toFixed(2)}`],
        ['Taxes (GST)', `Rs. ${Number(taxes).toFixed(2)}`],
        ['Transportation / Freight', `Rs. ${Number(shipping).toFixed(2)}`]
      ];
      if (discount > 0) {
        summaryRows.push(['Discount', `- Rs. ${Number(discount).toFixed(2)}`]);
      }
      if (additional > 0) {
        summaryRows.push(['Additional Handling', `Rs. ${Number(additional).toFixed(2)}`]);
      }

      summaryRows.forEach(([lbl, val]) => {
        doc.fillColor('#4A5568').font('Helvetica').fontSize(9);
        doc.text(lbl, summaryLeft, currentY);
        doc.text(val, summaryLeft + 120, currentY, { align: 'right', width: 110 });
        currentY += 16;
      });

      doc.moveTo(summaryLeft, currentY).lineTo(summaryLeft + summaryWidth, currentY).stroke('#CBD5E0');
      currentY += 6;

      doc.fillColor('#1A202C').font('Helvetica-Bold').fontSize(11);
      doc.text('Grand Total', summaryLeft, currentY);
      doc.fillColor('#2B6CB0').text(`Rs. ${Number(grandTotal).toFixed(2)}`, summaryLeft + 120, currentY, { align: 'right', width: 110 });

      currentY += 35;

      // Terms & Conditions / Payment terms
      const paymentInfo = quoteResponse.payment_terms || quoteResponse.terms_and_conditions;
      if (paymentInfo) {
        doc.fillColor('#1A202C').fontSize(11).font('Helvetica-Bold')
          .text('Payment Terms & Conditions', 40, currentY);
        currentY += 16;
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        let termsText = paymentInfo;
        if (quoteResponse.advance_payment || quoteResponse.balance_payment) {
          termsText += ` (Advance: ${quoteResponse.advance_payment || 0}%, Balance: ${quoteResponse.balance_payment || 100}%)`;
        }
        if (quoteResponse.warranty) {
          termsText += `\nWarranty: ${quoteResponse.warranty}`;
        }
        doc.text(termsText, 40, currentY, { width: 515 });
        currentY += 35;
      }

      // Footer
      doc.moveTo(40, 780).lineTo(555, 780).stroke('#CBD5E0');
      doc.font('Helvetica').fontSize(8).fillColor('#A0AEC0')
        .text('Generated via Stone Market India Platform | All quotations subject to supplier confirmation', 40, 788, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateQuotationPdf };
