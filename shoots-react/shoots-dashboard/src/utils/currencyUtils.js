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

/**
 * Formats raw input for display in the input field
 * @param {string} input - Raw numeric input
 * @returns {string} Formatted display string (e.g., "12.99")
 */
export function formatInputDisplay(input) {
  const cents = inputToCents(input);
  return formatCentsAsDollars(cents);
}

/**
 * Handles input change for currency fields
 * @param {string} value - New input value
 * @param {Function} setValue - State setter function
 */
export function handleCurrencyInput(value, setValue) {
  // Remove any non-numeric characters
  const cleaned = value.replace(/[^\d]/g, '');
  
  // Limit to reasonable length (max $999,999.99 = 99999999 cents)
  if (cleaned.length > 8) {
    return;
  }
  
  // Store the raw numeric value
  setValue(cleaned);
}

/**
 * Gets the dollar value from raw input
 * @param {string} input - Raw numeric input
 * @returns {number} Amount in dollars
 */
export function getInputAsDollars(input) {
  const cents = inputToCents(input);
  return cents / 100;
}
