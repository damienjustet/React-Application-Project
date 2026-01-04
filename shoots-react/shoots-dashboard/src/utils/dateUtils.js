/**
 * Date utility functions for consistent date formatting across the app
 */

const MONTH_MAP = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}

/**
 * Convert display date format "Dec 10, 2025" or "Dec 10" to date input format "2025-12-10"
 * @param {string} displayDate - Date in format "MMM DD, YYYY" or "MMM DD"
 * @returns {string} Date in format "YYYY-MM-DD"
 */
export function displayToInputDate(displayDate) {
  const parsed = parseDisplayDate(displayDate)
  if (!parsed.month || !parsed.day) {
    return ''
  }
  const month = MONTH_MAP[parsed.month]
  const year = parsed.year || new Date().getFullYear()
  return `${year}-${month}-${String(parsed.day).padStart(2, '0')}`
}

/**
 * Parse a display date string to extract month, day, and year
 * Supports formats: "Dec 10, 2025", "Dec 10 2025", "Dec 10"
 * @param {string} dateStr - The display date string
 * @returns {{month: string, day: number, year: number|null}}
 */
export function parseDisplayDate(dateStr) {
  if (!dateStr) return { month: '', day: 0, year: null }
  
  // Handle "Dec 10, 2025" or "Dec 10 2025" format
  const withYearMatch = dateStr.match(/(\w{3})\s+(\d{1,2}),?\s*(\d{4})/)
  if (withYearMatch) {
    return {
      month: withYearMatch[1],
      day: parseInt(withYearMatch[2]),
      year: parseInt(withYearMatch[3])
    }
  }
  
  // Handle "Dec 10" format (legacy, assume current year)
  const withoutYearMatch = dateStr.match(/(\w{3})\s+(\d{1,2})/)
  if (withoutYearMatch) {
    return {
      month: withoutYearMatch[1],
      day: parseInt(withoutYearMatch[2]),
      year: null
    }
  }
  
  return { month: '', day: 0, year: null }
}

/**
 * Check if a transaction date matches a given month and year
 * @param {string} transactionDate - The transaction date string
 * @param {string} month - The month abbreviation (e.g., "Dec")
 * @param {number} year - The year
 * @returns {boolean}
 */
export function matchesMonthYear(transactionDate, month, year) {
  const parsed = parseDisplayDate(transactionDate)
  if (parsed.year !== null) {
    return parsed.month === month && parsed.year === year
  }
  // Legacy dates without year - match only by month
  return parsed.month === month
}

/**
 * Convert date input format "2024-12-10" to display format "Dec 10, 2024"
 * @param {string} inputDate - Date in format "YYYY-MM-DD"
 * @returns {string} Date in format "MMM DD, YYYY"
 */
export function inputToDisplayDate(inputDate) {
  const dateObj = new Date(inputDate)
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Get the current date
 * @returns {Date}
 */
export function getCurrentDate() {
  return new Date()
}

/**
 * Generate an array of 12 months with years for the chart, including future months to complete 6-month intervals
 * Starting from 6 months before the current month and ending 5 months after the current month
 * @returns {Array<{month: string, year: number, label: string, shortLabel: string}>}
 */
export function getLastNMonths(count = 12) {
  const months = []
  const now = getCurrentDate()
  
  // Start from 6 months before current month (to show past data)
  // Go through current month to 5 months in the future (to complete the interval)
  for (let i = -6; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    months.push({
      month: monthName,
      year: year,
      label: `${monthName} ${year}`,
      shortLabel: monthName
    })
  }
  
  return months
}
