const PDFDocument = require('pdfkit');

/**
 * Generate PDF for Slab Estimate.
 * Returns a Promise that resolves with a Buffer.
 */
function generateSlabEstimatePdf(estimate) {
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
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('STONE MARKET INDIA - SLAB ESTIMATE', 50, 52);

      let currentY = 100;

      // Optional Company Details
      if (estimate.company_details_enabled) {
        doc.fillColor('#2D3748').fontSize(11).font('Helvetica-Bold');
        doc.text(estimate.company_name_snapshot || 'Company Details', 40, currentY);
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        currentY += 15;
        if (estimate.company_address_snapshot) {
          doc.text(`Address: ${estimate.company_address_snapshot}`, 40, currentY);
          currentY += 13;
        }
        const contacts = [];
        if (estimate.company_mobile_snapshot) contacts.push(`Mob: ${estimate.company_mobile_snapshot}`);
        if (estimate.company_email_snapshot) contacts.push(`Email: ${estimate.company_email_snapshot}`);
        if (contacts.length) {
          doc.text(contacts.join(' | '), 40, currentY);
          currentY += 13;
        }
        if (estimate.payment_terms_snapshot) {
          doc.text(`Payment Terms: ${estimate.payment_terms_snapshot}`, 40, currentY);
          currentY += 13;
        }
        currentY += 5;
        doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#CBD5E0');
        currentY += 12;
      }

      // Metadata Block (2 columns)
      const leftColX = 40;
      const rightColX = 300;
      const metaStartY = currentY;

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#2D3748');
      doc.text(`Reference No: ${estimate.reference_number}`, leftColX, currentY);
      doc.text(`Estimate Date: ${new Date(estimate.estimate_date).toLocaleDateString('en-IN')}`, rightColX, currentY);
      currentY += 15;

      doc.text(`Party Name: ${estimate.party_name}`, leftColX, currentY);
      doc.text(`Colour / Quality: ${estimate.slab_details?.colour_quality || 'N/A'}`, rightColX, currentY);
      currentY += 15;

      if (estimate.slab_details?.vehicle_number || estimate.slab_details?.block_lot_number) {
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        doc.text(`Vehicle No: ${estimate.slab_details?.vehicle_number || 'N/A'}`, leftColX, currentY);
        doc.text(`Block / Lot No: ${estimate.slab_details?.block_lot_number || 'N/A'}`, rightColX, currentY);
        currentY += 15;
      }

      if (estimate.slab_details?.measured_by) {
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        doc.text(`Measured By: ${estimate.slab_details.measured_by}`, leftColX, currentY);
        currentY += 15;
      }

      const mUnit = estimate.slab_details?.measurement_unit || 'inch';
      const aUnit = estimate.slab_details?.area_unit || 'sqft';
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#2B6CB0');
      doc.text(`Measurement Unit: ${mUnit.toUpperCase()} | Area Unit: ${aUnit.toUpperCase()}`, leftColX, currentY);
      currentY += 20;

      // Table Header
      const colSNo = 40;
      const colLen = 120;
      const colWid = 240;
      const colArea = 380;

      doc.rect(40, currentY, 515, 20).fill('#EDF2F7');
      doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(9);
      doc.text('S.No', colSNo + 5, currentY + 5);
      doc.text(`Length (${mUnit})`, colLen, currentY + 5);
      doc.text(`Width (${mUnit})`, colWid, currentY + 5);
      doc.text(`Calculated Area (${aUnit})`, colArea, currentY + 5);
      currentY += 25;

      // Table Rows
      const rows = estimate.slab_details?.measurement_rows || [];
      doc.font('Helvetica').fontSize(9).fillColor('#2D3748');

      rows.forEach(r => {
        // Page break check
        if (currentY > 730) {
          doc.addPage();
          currentY = 40;
          // Redraw header on new page
          doc.rect(40, currentY, 515, 20).fill('#EDF2F7');
          doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(9);
          doc.text('S.No', colSNo + 5, currentY + 5);
          doc.text(`Length (${mUnit})`, colLen, currentY + 5);
          doc.text(`Width (${mUnit})`, colWid, currentY + 5);
          doc.text(`Calculated Area (${aUnit})`, colArea, currentY + 5);
          currentY += 25;
          doc.font('Helvetica').fontSize(9).fillColor('#2D3748');
        }

        doc.text(String(r.serial_number), colSNo + 5, currentY);
        doc.text(String(r.length), colLen, currentY);
        doc.text(String(r.width), colWid, currentY);
        doc.text(String(r.calculated_area.toFixed(4)), colArea, currentY);
        currentY += 16;
      });

      currentY += 10;
      doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#CBD5E0');
      currentY += 15;

      // Summary Box
      if (currentY > 710) {
        doc.addPage();
        currentY = 40;
      }

      doc.rect(300, currentY, 255, 65).fill('#F7FAFC').stroke('#CBD5E0');
      doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(10);
      doc.text(`Total Area: ${estimate.slab_details?.total_area || 0} ${aUnit}`, 315, currentY + 12);
      doc.text(`Rate: ₹${estimate.slab_details?.unit_price || 0} / ${aUnit}`, 315, currentY + 28);
      doc.fillColor('#2B6CB0').fontSize(11);
      doc.text(`Grand Total: ₹${(estimate.total_amount || 0).toLocaleString('en-IN')}`, 315, currentY + 45);

      if (estimate.notes) {
        doc.fillColor('#4A5568').font('Helvetica').fontSize(9);
        doc.text(`Notes: ${estimate.notes}`, 40, currentY + 15, { width: 240 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate PDF for Particular Estimate.
 * Returns a Promise that resolves with a Buffer.
 */
function generateParticularEstimatePdf(estimate) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Header Bar
      doc.rect(40, 40, 515, 45).fill('#2B6CB0');
      doc.fillColor('#FFFFFF')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('STONE MARKET INDIA - ESTIMATE & INVOICE', 50, 52);

      let currentY = 100;

      // Optional Company Details
      if (estimate.company_details_enabled) {
        doc.fillColor('#2D3748').fontSize(11).font('Helvetica-Bold');
        doc.text(estimate.company_name_snapshot || 'Company Details', 40, currentY);
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        currentY += 15;
        if (estimate.company_address_snapshot) {
          doc.text(`Address: ${estimate.company_address_snapshot}`, 40, currentY);
          currentY += 13;
        }
        const contacts = [];
        if (estimate.company_mobile_snapshot) contacts.push(`Mob: ${estimate.company_mobile_snapshot}`);
        if (estimate.company_email_snapshot) contacts.push(`Email: ${estimate.company_email_snapshot}`);
        if (contacts.length) {
          doc.text(contacts.join(' | '), 40, currentY);
          currentY += 13;
        }
        if (estimate.payment_terms_snapshot) {
          doc.text(`Payment Terms: ${estimate.payment_terms_snapshot}`, 40, currentY);
          currentY += 13;
        }
        currentY += 5;
        doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#CBD5E0');
        currentY += 12;
      }

      // Metadata Block
      const leftColX = 40;
      const rightColX = 300;

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#2D3748');
      doc.text(`Estimate No: ${estimate.reference_number}`, leftColX, currentY);
      doc.text(`Estimate Date: ${new Date(estimate.estimate_date).toLocaleDateString('en-IN')}`, rightColX, currentY);
      currentY += 15;

      doc.text(`Customer / Party: ${estimate.party_name}`, leftColX, currentY);
      if (estimate.party_contact) {
        doc.text(`Contact: ${estimate.party_contact}`, rightColX, currentY);
      }
      currentY += 15;

      if (estimate.party_address) {
        doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
        doc.text(`Address: ${estimate.party_address}`, leftColX, currentY, { width: 500 });
        currentY += 18;
      }

      currentY += 10;

      // Items Table Header
      const colSNo = 40;
      const colDesc = 80;
      const colQty = 260;
      const colUnit = 330;
      const colRate = 390;
      const colAmt = 470;

      doc.rect(40, currentY, 515, 20).fill('#EDF2F7');
      doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(9);
      doc.text('S.No', colSNo + 5, currentY + 5);
      doc.text('Particular / Item Description', colDesc, currentY + 5);
      doc.text('Qty', colQty, currentY + 5);
      doc.text('Unit', colUnit, currentY + 5);
      doc.text('Rate (₹)', colRate, currentY + 5);
      doc.text('Amount (₹)', colAmt, currentY + 5);
      currentY += 25;

      // Items Table Rows
      const items = estimate.particular_details?.items || [];
      doc.font('Helvetica').fontSize(9).fillColor('#2D3748');

      items.forEach(item => {
        if (currentY > 710) {
          doc.addPage();
          currentY = 40;
          doc.rect(40, currentY, 515, 20).fill('#EDF2F7');
          doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(9);
          doc.text('S.No', colSNo + 5, currentY + 5);
          doc.text('Particular / Item Description', colDesc, currentY + 5);
          doc.text('Qty', colQty, currentY + 5);
          doc.text('Unit', colUnit, currentY + 5);
          doc.text('Rate (₹)', colRate, currentY + 5);
          doc.text('Amount (₹)', colAmt, currentY + 5);
          currentY += 25;
          doc.font('Helvetica').fontSize(9).fillColor('#2D3748');
        }

        doc.text(String(item.serial_number), colSNo + 5, currentY);
        doc.text(item.particular_name, colDesc, currentY, { width: 170 });
        doc.text(String(item.quantity), colQty, currentY);
        doc.text(item.unit, colUnit, currentY);
        doc.text(String(item.unit_price.toFixed(2)), colRate, currentY);
        doc.text(String(item.calculated_amount.toFixed(2)), colAmt, currentY);
        currentY += 18;
      });

      currentY += 10;
      doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#CBD5E0');
      currentY += 15;

      // Payments Section if any
      const payments = (estimate.particular_details?.payments || []).filter(p => p.status === 'completed');
      if (payments.length > 0) {
        if (currentY > 670) {
          doc.addPage();
          currentY = 40;
        }

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#2D3748');
        doc.text('Payment / Advance Ledger:', 40, currentY);
        currentY += 15;

        payments.forEach(p => {
          doc.font('Helvetica').fontSize(9).fillColor('#4A5568');
          const pDate = new Date(p.payment_date).toLocaleDateString('en-IN');
          doc.text(`• ${pDate} - ${p.payment_method.toUpperCase()}: ₹${p.amount.toLocaleString('en-IN')}${p.transaction_reference ? ' (Ref: ' + p.transaction_reference + ')' : ''}`, 50, currentY);
          currentY += 14;
        });
        currentY += 10;
      }

      // Financials Summary
      if (currentY > 670) {
        doc.addPage();
        currentY = 40;
      }

      doc.rect(300, currentY, 255, 80).fill('#F7FAFC').stroke('#CBD5E0');
      doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(10);
      doc.text(`Total Amount: ₹${(estimate.total_amount || 0).toLocaleString('en-IN')}`, 315, currentY + 12);
      doc.text(`Total Paid: ₹${(estimate.particular_details?.total_paid || 0).toLocaleString('en-IN')}`, 315, currentY + 28);
      
      const balance = estimate.particular_details?.remaining_balance || 0;
      doc.fillColor(balance > 0 ? '#C53030' : '#2F855A').fontSize(11);
      doc.text(`Remaining Balance: ₹${balance.toLocaleString('en-IN')}`, 315, currentY + 46);
      doc.fillColor('#4A5568').fontSize(9);
      doc.text(`Status: ${(estimate.particular_details?.payment_status || 'unpaid').toUpperCase()}`, 315, currentY + 63);

      // Amount in words
      doc.fillColor('#2D3748').font('Helvetica-Bold').fontSize(9);
      doc.text(`Amount in Words:`, 40, currentY + 12);
      doc.font('Helvetica-Oblique').fillColor('#4A5568');
      doc.text(estimate.particular_details?.amount_in_words || 'Zero Only', 40, currentY + 28, { width: 240 });

      if (estimate.notes) {
        doc.font('Helvetica-Bold').fillColor('#2D3748');
        doc.text(`Notes:`, 40, currentY + 52);
        doc.font('Helvetica').fillColor('#4A5568');
        doc.text(estimate.notes, 75, currentY + 52, { width: 200 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateSlabEstimatePdf,
  generateParticularEstimatePdf
};
