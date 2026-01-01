/**
 * Date utility functions for consistent date formatting across the app
 */

const MONTH_MAP = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}

/**
 * Convert display date format "Dec 10" to date input format "2024-12-10"
 * @param {string} displayDate - Date in format "MMM DD"
 * @returns {string} Date in format "YYYY-MM-DD"
 */
export function displayToInputDate(displayDate) {
  const [monthStr, day] = displayDate.split(' ')
  const month = MONTH_MAP[monthStr]
  const year = new Date().getFullYear()
  return `${year}-${month}-${day.padStart(2, '0')}`
}

/**
 * Convert date input format "2024-12-10" to display format "Dec 10"
 * @param {string} inputDate - Date in format "YYYY-MM-DD"
 * @returns {string} Date in format "MMM DD"
 */
export function inputToDisplayDate(inputDate) {
  const dateObj = new Date(inputDate)
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Get current date in input format "YYYY-MM-DD"
 * @returns {string} Current date in format "YYYY-MM-DD"
 */
export function getCurrentInputDate() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current date in display format "MMM DD"
 * @returns {string} Current date in format "MMM DD"
 */
export function getCurrentDisplayDate() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
