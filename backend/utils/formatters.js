/**
 * Currency, Number & Date Formatting Utilities for Indian Merchant Financials
 */

export function formatINR(amount, compact = false) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  if (compact) {
    if (absNum >= 10000000) {
      return `${isNegative ? '-' : ''}₹${(absNum / 10000000).toFixed(2)} Cr`;
    }
    if (absNum >= 100000) {
      return `${isNegative ? '-' : ''}₹${(absNum / 100000).toFixed(2)} L`;
    }
    if (absNum >= 1000) {
      return `${isNegative ? '-' : ''}₹${(absNum / 1000).toFixed(1)}k`;
    }
  }

  // Standard Indian Currency Format (e.g. 82,40,000)
  const parts = absNum.toFixed(0).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatPercentage(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  const num = Number(value);
  return `${num >= 0 ? '' : ''}${num.toFixed(decimals)}%`;
}

export function formatDateTime(isoOrDateStr) {
  if (!isoOrDateStr) return 'N/A';
  try {
    const d = new Date(isoOrDateStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(isoOrDateStr);
  }
}
