const PDFDocument = require('pdfkit');

/**
 * Generate PDF for Lead Requirement Details
 * @param {Object} lead - Populated Lead document with inquiry, buyer, manufacturer
 * @returns {Promise<Buffer>}
 */
function generateLeadPdf(lead) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Brand Header Bar (#163B5C Navy)
      doc.rect(40, 40, 515, 50).fill('#163B5C');
      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('STONE MARKET INDIA', 55, 50)
        .fontSize(10)
        .font('Helvetica')
        .text('MANUFACTURER REQUIREMENT LEAD SPECIFICATION', 55, 70);

      let currentY = 105;

      // Lead Summary Banner
      doc.rect(40, currentY, 515, 36).fill('#F1F4FA');
      doc.rect(40, currentY, 515, 36).stroke('#CBD5E1');

      doc.fillColor('#172033').fontSize(11).font('Helvetica-Bold');
      const leadNum = lead.lead_number || `#LD${lead._id.toString().slice(-6)}`;
      doc.text(`Lead Number: ${leadNum}`, 50, currentY + 12);

      const statusText = (lead.lead_status || 'new').toUpperCase().replace(/_/g, ' ');
      doc.fillColor('#2563EB').text(`Status: ${statusText}`, 410, currentY + 12);
      currentY += 50;

      // 2-Column Section: Buyer Contact & Requirement Timeline
      doc.rect(40, currentY, 250, 110).stroke('#E2E8F0');
      doc.rect(305, currentY, 250, 110).stroke('#E2E8F0');

      // Left: Buyer Contact
      doc.fillColor('#163B5C').fontSize(11).font('Helvetica-Bold')
        .text('Buyer Information', 50, currentY + 10);
      doc.font('Helvetica').fontSize(9).fillColor('#475569');

      const inquiry = lead.inquiry_id || {};
      const buyer = lead.buyer_id || {};
      const buyerBiz = lead.buyer_business_id || {};
      const contactName = inquiry.contactInfo?.name || buyer.name || 'Valued Buyer';
      const companyName = buyerBiz.company_name || inquiry.contactInfo?.company || 'Verified Real Estate / Construction Buyer';
      const phone = inquiry.contactInfo?.mobile || buyer.mobile || buyer.phone || 'Authorized Buyer';
      const email = inquiry.contactInfo?.email || buyer.email || 'N/A';

      doc.text(`Contact Person: ${contactName}`, 50, currentY + 30);
      doc.text(`Company: ${companyName}`, 50, currentY + 46);
      doc.text(`Phone: ${phone}`, 50, currentY + 62);
      doc.text(`Email: ${email}`, 50, currentY + 78);
      doc.text(`Delivery City: ${inquiry.deliveryLocation?.city || inquiry.delivery_location || 'Rajasthan'}`, 50, currentY + 94);

      // Right: Lead Logistics & Timeline
      doc.fillColor('#163B5C').fontSize(11).font('Helvetica-Bold')
        .text('Logistics & Budget', 315, currentY + 10);
      doc.font('Helvetica').fontSize(9).fillColor('#475569');

      const budgetStr = lead.budget_min && lead.budget_max
        ? `INR ${lead.budget_min.toLocaleString()} - ${lead.budget_max.toLocaleString()}`
        : 'Estimated Budget Available Upon Quote';
      const urgencyStr = (lead.urgency || 'Within 15 Days').replace(/_/g, ' ').toUpperCase();
      const assignedStr = new Date(lead.assigned_at || lead.createdAt).toLocaleDateString('en-IN');

      doc.text(`Urgency: ${urgencyStr}`, 315, currentY + 30);
      doc.text(`Budget: ${budgetStr}`, 315, currentY + 46);
      doc.text(`Assigned On: ${assignedStr}`, 315, currentY + 62);
      doc.text(`Usage / Application: ${lead.usage_application || 'Flooring / Construction'}`, 315, currentY + 78);
      doc.text(`Priority: ${(lead.priority || 'Normal').toUpperCase()}`, 315, currentY + 94);

      currentY += 125;

      // Stone Material & Technical Specifications Section
      doc.rect(40, currentY, 515, 120).stroke('#CBD5E1');
      doc.fillColor('#163B5C').fontSize(11).font('Helvetica-Bold')
        .text('Product & Technical Specifications', 50, currentY + 10);

      doc.font('Helvetica').fontSize(9).fillColor('#1E293B');
      const prodName = inquiry.requirement_title || inquiry.subject || inquiry.material || 'Granite / Marble Slabs';
      const qty = `${inquiry.quantity || 500} ${inquiry.unit || 'Sq.ft'}`;
      const size = inquiry.size || '10 x 6 ft Gangsaw';
      const thickness = inquiry.thickness || '20 mm';
      const finish = inquiry.finish || 'Mirror Polished';
      const grade = inquiry.grade || inquiry.quality || 'Premium Export Grade';

      doc.text(`Product Name: ${prodName}`, 50, currentY + 30);
      doc.text(`Required Quantity: ${qty}`, 50, currentY + 46);
      doc.text(`Dimensions / Size: ${size}`, 50, currentY + 62);
      doc.text(`Thickness: ${thickness}`, 50, currentY + 78);
      doc.text(`Finish: ${finish}`, 300, currentY + 46);
      doc.text(`Quality / Grade: ${grade}`, 300, currentY + 62);
      doc.text(`Delivery Location: ${inquiry.deliveryLocation?.city || inquiry.delivery_location || 'Jaipur, Rajasthan'}`, 300, currentY + 78);

      currentY += 135;

      // Additional Buyer Requirement Summary
      doc.rect(40, currentY, 515, 60).fill('#F8FAFC');
      doc.rect(40, currentY, 515, 60).stroke('#E2E8F0');
      doc.fillColor('#163B5C').fontSize(10).font('Helvetica-Bold')
        .text('Buyer Requirement Summary:', 50, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      const reqText = inquiry.requirements || inquiry.message || 'Looking for premium quality material. Please quote best price with delivery timeline.';
      doc.text(reqText, 50, currentY + 24, { width: 495, height: 30 });

      currentY += 75;

      // Footer
      doc.fontSize(8).fillColor('#94A3B8')
        .text('Generated via Stone Market India Manufacturer Portal. Confidential & Authorized Use Only.', 40, currentY, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateLeadPdf
};
