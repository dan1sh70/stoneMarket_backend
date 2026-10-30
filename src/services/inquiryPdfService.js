const PDFDocument = require('pdfkit');

/**
 * Generate PDF for Customer Inquiry
 * Returns a Promise that resolves with a Buffer.
 */
function generateInquiryPdf(inquiry) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Header Bar
      doc.rect(40, 40, 515, 45).fill('#1A202C');
      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('STONE MARKET INDIA', 55, 48)
        .fontSize(11)
        .font('Helvetica')
        .text('CUSTOMER INQUIRY & REQUIREMENT SUMMARY', 55, 66);

      let currentY = 105;

      // Inquiry Reference & Status Banner
      doc.rect(40, currentY, 515, 30).fill('#F7FAFC');
      doc.rect(40, currentY, 515, 30).stroke('#E2E8F0');
      doc.fillColor('#2D3748').fontSize(10).font('Helvetica-Bold');
      doc.text(`Inquiry Reference: ${inquiry.reference_number || inquiry._id}`, 50, currentY + 10);
      
      const statusText = (inquiry.status || 'pending').toUpperCase().replace(/_/g, ' ');
      doc.fillColor('#3182CE').text(`Status: ${statusText}`, 380, currentY + 10);
      currentY += 45;

      // 2-Column Section: Customer Info & Submission Details
      doc.rect(40, currentY, 250, 95).stroke('#E2E8F0');
      doc.rect(305, currentY, 250, 95).stroke('#E2E8F0');

      // Left: Customer Info
      doc.fillColor('#2D3748').fontSize(11).font('Helvetica-Bold')
        .text('Customer Information', 50, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
      const contact = inquiry.contactInfo || {};
      const sender = inquiry.senderId || {};
      const customerName = contact.name || sender.name || 'Valued Customer';
      const customerMobile = contact.mobile || sender.mobile || 'N/A';
      const customerEmail = contact.email || sender.email || 'N/A';
      const customerCity = contact.city || inquiry.deliveryLocation?.city || 'N/A';

      doc.text(`Name: ${customerName}`, 50, currentY + 28);
      doc.text(`Mobile: ${customerMobile}`, 50, currentY + 43);
      doc.text(`Email: ${customerEmail}`, 50, currentY + 58);
      doc.text(`Location: ${customerCity}`, 50, currentY + 73);

      // Right: Inquiry Info
      doc.fillColor('#2D3748').fontSize(11).font('Helvetica-Bold')
        .text('Submission Details', 315, currentY + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
      const createdDate = inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString('en-IN') : 'N/A';
      doc.text(`Date Submitted: ${createdDate}`, 315, currentY + 28);
      doc.text(`Category: ${inquiry.category || 'Natural Stone'}`, 315, currentY + 43);
      doc.text(`Timeline: ${inquiry.delivery_timeline || 'Standard Delivery'}`, 315, currentY + 58);
      doc.text(`Quotations: ${inquiry.quotations_count || 0} Received`, 315, currentY + 73);

      currentY += 115;

      // Stone Requirement Specifications Table
      doc.fillColor('#1A202C').fontSize(12).font('Helvetica-Bold')
        .text('Stone Specifications & Requirements', 40, currentY);
      currentY += 18;

      const tableTop = currentY;
      doc.rect(40, tableTop, 515, 22).fill('#EDF2F7');
      doc.fillColor('#2D3748').fontSize(9).font('Helvetica-Bold');
      doc.text('Specification', 50, tableTop + 6);
      doc.text('Required Details', 250, tableTop + 6);

      currentY += 22;

      const specs = [
        ['Product / Material', inquiry.productId?.name || inquiry.subject || 'Stone Inquiry'],
        ['Required Quantity', `${inquiry.quantity || 'N/A'} ${inquiry.unit || 'Sq.Ft'}`],
        ['Dimensions / Size', inquiry.size || 'Standard Slabs'],
        ['Thickness', inquiry.thickness || 'Standard (18mm)'],
        ['Finish / Surface', inquiry.finish || 'Polished'],
        ['Edge Profile', inquiry.edge_profile || 'Straight'],
        ['Grade / Quality', inquiry.grade || inquiry.quality || 'Standard Commercial'],
        ['Budget Range', inquiry.budget_range || 'Market Competitive']
      ];

      specs.forEach(([key, value], idx) => {
        const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F7FAFC';
        doc.rect(40, currentY, 515, 20).fill(rowBg);
        doc.rect(40, currentY, 515, 20).stroke('#E2E8F0');
        doc.fillColor('#4A5568').font('Helvetica').fontSize(9);
        doc.text(key, 50, currentY + 5);
        doc.fillColor('#1A202C').font('Helvetica-Bold');
        doc.text(value, 250, currentY + 5);
        currentY += 20;
      });

      currentY += 15;

      // Delivery Location & Instructions
      doc.fillColor('#1A202C').fontSize(11).font('Helvetica-Bold')
        .text('Delivery & Project Destination', 40, currentY);
      currentY += 16;
      doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
      const delLoc = inquiry.deliveryLocation || {};
      const delStr = [delLoc.address, delLoc.city, delLoc.state].filter(Boolean).join(', ') || 'Direct Dispatch';
      doc.text(`Destination Address: ${delStr}`, 40, currentY);
      currentY += 18;

      if (inquiry.requirements || inquiry.message || inquiry.additional_specifications) {
        doc.fillColor('#1A202C').fontSize(11).font('Helvetica-Bold')
          .text('Additional Instructions & Notes', 40, currentY);
        currentY += 16;
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        const notes = inquiry.additional_specifications || inquiry.requirements || inquiry.message;
        doc.text(notes, 40, currentY, { width: 515 });
        currentY += 35;
      }

      // Footer
      doc.moveTo(40, 780).lineTo(555, 780).stroke('#CBD5E0');
      doc.font('Helvetica').fontSize(8).fillColor('#A0AEC0')
        .text('Generated via Stone Market India Platform | www.stonemarketindia.com', 40, 788, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInquiryPdf };
