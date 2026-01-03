/**
 * Currency utility functions for handling monetary input
 */

/**
 * Formats cents as dollars with proper currency formatting
 * @param {number} cents - The amount in cents
 * @returns {string} Formatted dollar amount (e.g., "12.99")
 */
export function formatCentsAsDollars(cents) {
  const dollars = cents / 100;
  return dollars.toFixed(2);
}

/**
 * Formats a dollar amount for display with currency symbol
 * @param {number} dollars - The amount in dollars
 * @returns {string} Formatted string (e.g., "$12.99")
 */
export function formatDollarDisplay(dollars) {
  return `$${parseFloat(dollars).toFixed(2)}`;
}

/**
 * Converts raw numeric input (without decimals) to cents
 * @param {string} input - Raw numeric input (e.g., "1299" for $12.99)
 * @returns {number} Amount in cents
 */
export function inputToCents(input) {
  // Remove any non-numeric characters
  const cleaned = input.replace(/[^\d]/g, '');
  
  // Handle empty input
  if (!cleaned || cleaned === '0' || cleaned === '00' || cleaned === '000') {
    return 0;
  }
  
  // Convert to number (already in cents)
  return parseInt(cleaned, 10);
}
