const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function twoDigitsToWords(n) {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o !== 0 ? ' ' + ones[o] : '');
}

function threeDigitsToWords(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let res = '';
  if (h > 0) {
    res += ones[h] + ' Hundred';
    if (r > 0) res += ' ';
  }
  if (r > 0) {
    res += twoDigitsToWords(r);
  }
  return res;
}

/**
 * Converts a numeric amount to Indian English words.
 * Handles Crores, Lakhs, Thousands, Hundreds, and Paise.
 * e.g. 1250 -> "One Thousand Two Hundred Fifty Rupees Only"
 * 0 -> "Zero Only"
 */
function amountToWords(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Zero Only';
  }

  const num = Number(amount);
  if (num === 0) {
    return 'Zero Only';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const integerPart = Math.floor(absNum);
  const paisePart = Math.round((absNum - integerPart) * 100);

  if (integerPart === 0 && paisePart === 0) {
    return 'Zero Only';
  }

  // Break integerPart by Indian Numbering System:
  // [Crore (10^7), Lakh (10^5), Thousand (10^3), Hundred/Units (rest)]
  let rem = integerPart;

  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;

  const lakh = Math.floor(rem / 100000);
  rem %= 100000;

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  const hundredAndBelow = rem;

  const parts = [];

  if (crore > 0) {
    parts.push(twoDigitsToWords(crore) + ' Crore');
  }
  if (lakh > 0) {
    parts.push(twoDigitsToWords(lakh) + ' Lakh');
  }
  if (thousand > 0) {
    parts.push(twoDigitsToWords(thousand) + ' Thousand');
  }
  if (hundredAndBelow > 0) {
    parts.push(threeDigitsToWords(hundredAndBelow));
  }

  let words = parts.join(' ').trim();
  if (!words) {
    words = 'Zero';
  }

  words += ' Rupees';

  if (paisePart > 0) {
    words += ' and ' + twoDigitsToWords(paisePart) + ' Paise';
  }

  words += ' Only';

  return isNegative ? 'Minus ' + words : words;
}

module.exports = {
  amountToWords
};
