import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { parseDisplayDate, matchesMonthYear, getLastNMonths, getCurrentDate } from '../utils/dateUtils'

const DataContext = createContext()

// Category configurations
export const EXPENSE_CATEGORIES = ['Dining', 'Shopping', 'Groceries', 'Transportation', 'Entertainment', 'Bills and Utilities', 'Other']
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift']

export const categoryIcons = {
  'Dining': 'fa-utensils',
  'Shopping': 'fa-cart-shopping',
  'Groceries': 'fa-basket-shopping',
  'Transportation': 'fa-car',
  'Entertainment': 'fa-tv',
  'Bills and Utilities': 'fa-file-invoice-dollar',
  'Other': 'fa-ellipsis',
  'Salary': 'fa-money-bill-wave',
  'Freelance': 'fa-laptop-code',
  'Investment': 'fa-chart-line',
  'Gift': 'fa-gift'
}

export const categoryColors = {
  'Dining': 'rgba(232, 232, 232, 0.8)',
  'Shopping': 'rgba(232, 232, 232, 0.8)',
  'Groceries': 'rgba(232, 232, 232, 0.8)',
  'Transportation': 'rgba(232, 232, 232, 0.8)',
  'Entertainment': 'rgba(232, 232, 232, 0.8)',
  'Bills and Utilities': 'rgba(232, 232, 232, 0.8)',
  'Other': 'rgba(131, 130, 125, 0.6)'
}

// Initial transaction data with proper year formatting
const initialTransactions = [
  // January 2026 transactions
  { date: 'Jan 3, 2026', merchant: 'Starbucks', category: 'Dining', amount: 9.25, icon: 'fa-coffee', type: 'expense' },
  { date: 'Jan 2, 2026', merchant: 'Whole Foods', category: 'Groceries', amount: 78.50, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Jan 1, 2026', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  
  // December 2025 transactions
  { date: 'Dec 10, 2025', merchant: 'Starbucks', category: 'Dining', amount: 8.50, icon: 'fa-coffee', type: 'expense' },
  { date: 'Dec 10, 2025', merchant: 'Uber', category: 'Transportation', amount: 24.30, icon: 'fa-car', type: 'expense' },
  { date: 'Dec 9, 2025', merchant: 'Amazon', category: 'Shopping', amount: 156.78, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Dec 9, 2025', merchant: 'Whole Foods', category: 'Groceries', amount: 87.42, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Dec 9, 2025', merchant: 'McDonalds', category: 'Dining', amount: 12.45, icon: 'fa-burger', type: 'expense' },
  { date: 'Dec 8, 2025', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, icon: 'fa-tv', type: 'expense' },
  { date: 'Dec 8, 2025', merchant: 'Shell Gas', category: 'Transportation', amount: 52.00, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Dec 8, 2025', merchant: 'Target', category: 'Shopping', amount: 43.21, icon: 'fa-bag-shopping', type: 'expense' },
  { date: 'Dec 7, 2025', merchant: 'Chipotle', category: 'Dining', amount: 13.25, icon: 'fa-bowl-food', type: 'expense' },
  { date: 'Dec 7, 2025', merchant: 'Safeway', category: 'Groceries', amount: 95.67, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Dec 6, 2025', merchant: 'Spotify', category: 'Entertainment', amount: 10.99, icon: 'fa-music', type: 'expense' },
  { date: 'Dec 6, 2025', merchant: 'Chevron', category: 'Transportation', amount: 48.20, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Dec 5, 2025', merchant: 'Olive Garden', category: 'Dining', amount: 54.80, icon: 'fa-utensils', type: 'expense' },
  { date: 'Dec 5, 2025', merchant: 'Best Buy', category: 'Shopping', amount: 89.99, icon: 'fa-desktop', type: 'expense' },
  { date: 'Dec 4, 2025', merchant: 'Subway', category: 'Dining', amount: 9.75, icon: 'fa-sandwich', type: 'expense' },
  { date: 'Dec 4, 2025', merchant: 'CVS Pharmacy', category: 'Other', amount: 32.45, icon: 'fa-pills', type: 'expense' },
  { date: 'Dec 3, 2025', merchant: 'Lyft', category: 'Transportation', amount: 18.50, icon: 'fa-car', type: 'expense' },
  { date: 'Dec 3, 2025', merchant: 'Walmart', category: 'Groceries', amount: 123.56, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Dec 2, 2025', merchant: 'Panda Express', category: 'Dining', amount: 11.25, icon: 'fa-bowl-rice', type: 'expense' },
  { date: 'Dec 2, 2025', merchant: 'AMC Theater', category: 'Entertainment', amount: 32.50, icon: 'fa-film', type: 'expense' },
  { date: 'Dec 1, 2025', merchant: 'In-N-Out', category: 'Dining', amount: 15.60, icon: 'fa-burger', type: 'expense' },
  { date: 'Dec 1, 2025', merchant: 'Costco', category: 'Groceries', amount: 187.34, icon: 'fa-warehouse', type: 'expense' },
  { date: 'Dec 1, 2025', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  { date: 'Dec 15, 2025', merchant: 'Freelance Project', category: 'Freelance', amount: 1200.00, icon: 'fa-laptop-code', type: 'income' },
  
  // November 2025 transactions
  { date: 'Nov 28, 2025', merchant: 'Starbucks', category: 'Dining', amount: 7.50, icon: 'fa-coffee', type: 'expense' },
  { date: 'Nov 25, 2025', merchant: 'Target', category: 'Shopping', amount: 124.50, icon: 'fa-bag-shopping', type: 'expense' },
  { date: 'Nov 22, 2025', merchant: 'Whole Foods', category: 'Groceries', amount: 98.30, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Nov 20, 2025', merchant: 'Shell Gas', category: 'Transportation', amount: 55.00, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Nov 15, 2025', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, icon: 'fa-tv', type: 'expense' },
  { date: 'Nov 10, 2025', merchant: 'Chipotle', category: 'Dining', amount: 14.75, icon: 'fa-bowl-food', type: 'expense' },
  { date: 'Nov 1, 2025', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  
  // October 2025 transactions
  { date: 'Oct 25, 2025', merchant: 'Amazon', category: 'Shopping', amount: 89.99, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Oct 20, 2025', merchant: 'Safeway', category: 'Groceries', amount: 105.20, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Oct 15, 2025', merchant: 'Uber', category: 'Transportation', amount: 32.50, icon: 'fa-car', type: 'expense' },
  { date: 'Oct 10, 2025', merchant: 'Spotify', category: 'Entertainment', amount: 10.99, icon: 'fa-music', type: 'expense' },
  { date: 'Oct 5, 2025', merchant: 'McDonalds', category: 'Dining', amount: 11.25, icon: 'fa-burger', type: 'expense' },
  { date: 'Oct 1, 2025', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  
  // September 2025 transactions
  { date: 'Sep 20, 2025', merchant: 'Target', category: 'Shopping', amount: 156.00, icon: 'fa-bag-shopping', type: 'expense' },
  { date: 'Sep 15, 2025', merchant: 'Shell Gas', category: 'Transportation', amount: 48.50, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Sep 10, 2025', merchant: 'Chipotle', category: 'Dining', amount: 12.50, icon: 'fa-bowl-food', type: 'expense' },
  { date: 'Sep 1, 2025', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  
  // August 2025 transactions
  { date: 'Aug 25, 2025', merchant: 'Amazon', category: 'Shopping', amount: 234.00, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Aug 18, 2025', merchant: 'Costco', category: 'Groceries', amount: 189.00, icon: 'fa-warehouse', type: 'expense' },
  { date: 'Aug 10, 2025', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, icon: 'fa-tv', type: 'expense' },
  { date: 'Aug 1, 2025', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
]

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [savingsGoals, setSavingsGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 10000, current: 3500, color: '#83827d', icon: 'fa-umbrella' },
    { id: 2, name: 'Vacation', target: 5000, current: 1200, color: '#a0a0a0', icon: 'fa-plane' },
    { id: 3, name: 'New Car', target: 25000, current: 8750, color: '#707070', icon: 'fa-car' }
  ])
  const [recurringBills, setRecurringBills] = useState([
    { id: 1, name: 'Netflix', amount: 15.99, dueDate: '15', category: 'Entertainment', frequency: 'monthly', icon: 'fa-tv', isPaid: false },
    { id: 2, name: 'Rent', amount: 1200, dueDate: '1', category: 'Bills and Utilities', frequency: 'monthly', icon: 'fa-house', isPaid: true },
    { id: 3, name: 'Internet', amount: 79.99, dueDate: '10', category: 'Bills and Utilities', frequency: 'monthly', icon: 'fa-wifi', isPaid: false },
    { id: 4, name: 'Gym Membership', amount: 49.99, dueDate: '5', category: 'Other', frequency: 'monthly', icon: 'fa-dumbbell', isPaid: true },
    { id: 5, name: 'Spotify', amount: 10.99, dueDate: '20', category: 'Entertainment', frequency: 'monthly', icon: 'fa-music', isPaid: false }
  ])
  const [budgets, setBudgets] = useState([
    { category: 'Dining', limit: 300, spent: 0, color: '#707070' },
    { category: 'Shopping', limit: 200, spent: 0, color: '#83827d' },
    { category: 'Groceries', limit: 400, spent: 0, color: '#a0a0a0' },
    { category: 'Transportation', limit: 150, spent: 0, color: '#5a5a5a' },
    { category: 'Entertainment', limit: 100, spent: 0, color: '#909090' },
    { category: 'Bills and Utilities', limit: 500, spent: 0, color: '#b8b8b8' }
  ])

  // Track selected month for budget calculations (auto-detect current month)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = getCurrentDate()
    return now.toLocaleDateString('en-US', { month: 'short' })
  })
  
  // Track selected year
  const [selectedYear, setSelectedYear] = useState(() => {
    return getCurrentDate().getFullYear()
  })

  // Automatically calculate and update budget spent amounts whenever transactions or selectedMonth/Year changes
  useEffect(() => {
    const monthTransactions = transactions.filter(t =>
      matchesMonthYear(t.date, selectedMonth, selectedYear) && t.type === 'expense'
    )

    setBudgets(prevBudgets => {
      const updatedBudgets = prevBudgets.map(budget => {
        const spent = monthTransactions
          .filter(t => t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0)
        return { ...budget, spent }
      })

      // Only update if something actually changed
      const hasChanged = updatedBudgets.some((budget, index) =>
        budget.spent !== prevBudgets[index].spent
      )
      return hasChanged ? updatedBudgets : prevBudgets
    })
  }, [selectedMonth, selectedYear, transactions])

  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [transaction, ...prev])
  }, [])

  const deleteTransaction = useCallback((index) => {
    setTransactions(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateTransaction = useCallback((index, updatedTransaction) => {
    setTransactions(prev => {
      const newTransactions = [...prev]
      newTransactions[index] = updatedTransaction
      return newTransactions
    })
  }, [])

  // Helper: Get transactions for a specific month and year
  const getTransactionsByMonth = useCallback((month, year = null) => {
    if (year !== null) {
      return transactions.filter(t => matchesMonthYear(t.date, month, year))
    }
    // Legacy fallback - match by month only
    return transactions.filter(t => t.date.includes(month))
  }, [transactions])

  // Helper: Get transactions for a specific month/year using the new format
  const getTransactionsByMonthYear = useCallback((month, year) => {
    return transactions.filter(t => matchesMonthYear(t.date, month, year))
  }, [transactions])

  // Helper: Get transactions by type
  const getTransactionsByType = useCallback((type) => {
    return transactions.filter(t => t.type === type)
  }, [transactions])

  // Helper: Calculate total for a month
  const getMonthTotal = useCallback((month, type = null) => {
    const monthTransactions = getTransactionsByMonth(month)
    const filtered = type ? monthTransactions.filter(t => t.type === type) : monthTransactions
    return filtered.reduce((sum, t) => sum + t.amount, 0)
  }, [getTransactionsByMonth])

  // Helper: Get category totals for a month
  const getCategoryTotals = useCallback((month, type = 'expense') => {
    const monthTransactions = getTransactionsByMonth(month)
    const totals = {}
    
    monthTransactions.forEach(t => {
      if (t.type === type) {
        totals[t.category] = (totals[t.category] || 0) + t.amount
      }
    })
    
    return totals
  }, [getTransactionsByMonth])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionsByMonth,
    getTransactionsByMonthYear,
    getTransactionsByType,
    getMonthTotal,
    getCategoryTotals,
    savingsGoals,
    setSavingsGoals,
    recurringBills,
    setRecurringBills,
    budgets,
    setBudgets,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear
  }), [
    transactions, addTransaction, deleteTransaction, updateTransaction,
    getTransactionsByMonth, getTransactionsByMonthYear, getTransactionsByType,
    getMonthTotal, getCategoryTotals, savingsGoals, recurringBills, budgets,
    selectedMonth, selectedYear
  ])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
