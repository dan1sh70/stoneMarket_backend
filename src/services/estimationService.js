const { amountToWords } = require('../utils/amountToWords');

// Conversion factors to metres
const LENGTH_TO_METRES = {
  cm: 0.01,
  inch: 0.0254,
  feet: 0.3048
};

const SQM_TO_SQFT = 10.7639104167;

/**
 * Calculate single slab row area.
 * @param {number} length 
 * @param {number} width 
 * @param {string} measurementUnit 'cm' | 'inch' | 'feet'
 * @param {string} areaUnit 'sqft' | 'sqm'
 * @returns {number} area in areaUnit rounded to 4 decimals
 */
function calculateSlabRowArea(length, width, measurementUnit = 'inch', areaUnit = 'sqft') {
  const l = Number(length) || 0;
  const w = Number(width) || 0;

  if (l <= 0 || w <= 0) return 0;

  const factor = LENGTH_TO_METRES[measurementUnit] || LENGTH_TO_METRES.inch;
  const lengthM = l * factor;
  const widthM = w * factor;
  const areaM2 = lengthM * widthM;

  let calculatedArea = areaM2;
  if (areaUnit === 'sqft') {
    calculatedArea = areaM2 * SQM_TO_SQFT;
  }

  // 4 decimal precision for row area
  return Math.round(calculatedArea * 10000) / 10000;
}

/**
 * Recalculate complete Slab Estimate rows, total area and total amount.
 */
function calculateSlabTotals(rows = [], measurementUnit = 'inch', areaUnit = 'sqft', unitPrice = 0) {
  let totalArea = 0;
  const calculatedRows = rows.map((r, index) => {
    const l = Number(r.length) || 0;
    const w = Number(r.width) || 0;
    const rowArea = calculateSlabRowArea(l, w, measurementUnit, areaUnit);
    totalArea += rowArea;
    return {
      _id: r._id,
      serial_number: index + 1,
      length: l,
      width: w,
      calculated_area: rowArea
    };
  });

  totalArea = Math.round(totalArea * 10000) / 10000;
  const price = Number(unitPrice) || 0;
  const totalAmount = Math.round((totalArea * price) * 100) / 100;

  return {
    rows: calculatedRows,
    totalArea,
    totalAmount
  };
}

/**
 * Recalculate complete Particular Estimate items, summary, payments, and remaining balance.
 */
function calculateParticularTotals(items = [], payments = []) {
  let totalAmount = 0;
  const unitTotals = {};

  const calculatedItems = items.map((item, index) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unit_price) || 0;
    const itemAmount = Math.round((q * p) * 100) / 100;
    totalAmount += itemAmount;

    const u = (item.unit || 'sqft').trim().toLowerCase();
    unitTotals[u] = (unitTotals[u] || 0) + q;

    return {
      _id: item._id,
      serial_number: index + 1,
      particular_name: item.particular_name || `Item #${index + 1}`,
      quantity: q,
      unit: item.unit || 'sqft',
      unit_price: p,
      calculated_amount: itemAmount
    };
  });

  totalAmount = Math.round(totalAmount * 100) / 100;

  // Quantity summary grouped by unit
  const quantitySummary = Object.keys(unitTotals).map(unit => ({
    unit,
    total_quantity: Math.round(unitTotals[unit] * 100) / 100
  }));

  // If all items have the same unit, total_quantity is the sum, otherwise sum of all quantities
  const totalQuantity = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  // Active Payments calculation (exclude reversed)
  const validPayments = (payments || []).filter(p => !p.status || p.status === 'completed');
  const totalPaid = Math.round(validPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) * 100) / 100;
  const remainingBalance = Math.round((totalAmount - totalPaid) * 100) / 100;

  let paymentStatus = 'unpaid';
  if (totalPaid > 0 && remainingBalance > 0) {
    paymentStatus = 'partially_paid';
  } else if (remainingBalance === 0 && totalPaid > 0) {
    paymentStatus = 'paid';
  } else if (remainingBalance < 0) {
    paymentStatus = 'overpaid';
  } else if (totalPaid === 0) {
    paymentStatus = 'unpaid';
  }

  const words = amountToWords(remainingBalance);

  return {
    items: calculatedItems,
    totalQuantity: Math.round(totalQuantity * 100) / 100,
    quantitySummary,
    totalAmount,
    totalPaid,
    remainingBalance,
    paymentStatus,
    amountInWords: words
  };
}

module.exports = {
  LENGTH_TO_METRES,
  SQM_TO_SQFT,
  calculateSlabRowArea,
  calculateSlabTotals,
  calculateParticularTotals
};
