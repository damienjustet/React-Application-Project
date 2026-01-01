/**
 * Recurring transaction detection utilities
 * Analyzes spending patterns to automatically identify recurring bills
 */

/**
 * Calculate similarity between two strings (merchant names)
 * Uses Levenshtein-like fuzzy matching
 */
function stringSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  let matches = 0
  const minLen = Math.min(s1.length, s2.length)
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++
  }
  return matches / Math.max(s1.length, s2.length)
}

/**
 * Detect if amounts are similar (allows 5% variance for price changes)
 */
function amountsSimilar(amount1, amount2) {
  const variance = Math.abs(amount1 - amount2)
  const average = (amount1 + amount2) / 2
  return (variance / average) <= 0.05 // 5% tolerance
}

/**
 * Calculate days between transactions
 */
function daysBetween(date1Str, date2Str) {
  const d1 = new Date(date1Str + ' 2024')
  const d2 = new Date(date2Str + ' 2024')
  return Math.abs((d2 - d1) / (1000 * 60 * 60 * 24))
}

/**
 * Detect recurring patterns in transactions
 * Returns array of detected recurring subscriptions
 */
export function detectRecurringTransactions(transactions) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const detected = []
  const processed = new Set()

  expenseTransactions.forEach((transaction, index) => {
    if (processed.has(index)) return

    const matches = []
    
    // Find similar transactions
    expenseTransactions.forEach((other, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return
      
      const merchantMatch = stringSimilarity(transaction.merchant, other.merchant) > 0.7
      const amountMatch = amountsSimilar(transaction.amount, other.amount)
      
      if (merchantMatch && amountMatch) {
        matches.push({ transaction: other, index: otherIndex })
      }
    })

    // Need at least 2 occurrences to be recurring
    if (matches.length >= 1) {
      const allMatches = [transaction, ...matches.map(m => m.transaction)]
      
      // Calculate frequency
      let frequency = 'monthly'
      if (allMatches.length >= 2) {
        const days = daysBetween(allMatches[0].date, allMatches[1].date)
        if (days >= 350) frequency = 'yearly'
        else if (days >= 80 && days <= 100) frequency = 'quarterly'
        else if (days >= 25 && days <= 35) frequency = 'monthly'
        else if (days >= 6 && days <= 8) frequency = 'weekly'
      }

      // Check for price increases
      const amounts = allMatches.map(t => t.amount).sort((a, b) => a - b)
      const hasIncrease = amounts[amounts.length - 1] > amounts[0]
      const priceChange = hasIncrease ? amounts[amounts.length - 1] - amounts[0] : 0

      // Calculate if unused (last transaction > 60 days ago)
      const lastTransaction = allMatches[0] // Most recent is first
      const daysSinceLast = daysBetween(lastTransaction.date, new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      detected.push({
        id: `detected-${index}`,
        merchant: transaction.merchant,
        amount: transaction.amount,
        averageAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
        category: transaction.category,
        frequency,
        icon: transaction.icon,
        occurrences: allMatches.length,
        isAutoDetected: true,
        hasIncrease,
        priceChange,
        isPaid: false,
        lastCharge: lastTransaction.date,
        nextCharge: estimateNextCharge(lastTransaction.date, frequency),
        possiblyUnused: daysSinceLast > 60,
        transactions: allMatches
      })

      // Mark as processed
      processed.add(index)
      matches.forEach(m => processed.add(m.index))
    }
  })

  return detected
}

/**
 * Estimate next charge date based on frequency
 */
function estimateNextCharge(lastChargeDate, frequency) {
  const date = new Date(lastChargeDate + ' 2024')
  
  switch(frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Calculate total monthly recurring cost
 */
export function calculateMonthlyTotal(recurringItems) {
  return recurringItems.reduce((total, item) => {
    const amount = item.averageAmount || item.amount
    switch(item.frequency) {
      case 'weekly':
        return total + (amount * 4.33)
      case 'monthly':
        return total + amount
      case 'quarterly':
        return total + (amount / 3)
      case 'yearly':
        return total + (amount / 12)
      default:
        return total + amount
    }
  }, 0)
}

/**
 * Calculate yearly cost for a recurring item
 */
export function calculateYearlyCost(item) {
  const amount = item.averageAmount || item.amount
  switch(item.frequency) {
    case 'weekly':
      return amount * 52
    case 'monthly':
      return amount * 12
    case 'quarterly':
      return amount * 4
    case 'yearly':
      return amount
    default:
      return amount * 12
  }
}
