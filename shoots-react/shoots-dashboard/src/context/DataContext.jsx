import { createContext, useContext, useState } from 'react'

const DataContext = createContext()

// Category configurations
export const EXPENSE_CATEGORIES = ['Dining', 'Shopping', 'Groceries', 'Transportation', 'Entertainment', 'Other']
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift']

export const categoryIcons = {
  'Dining': 'fa-utensils',
  'Shopping': 'fa-cart-shopping',
  'Groceries': 'fa-basket-shopping',
  'Transportation': 'fa-car',
  'Entertainment': 'fa-tv',
  'Other': 'fa-ellipsis',
  'Salary': 'fa-money-bill-wave',
  'Freelance': 'fa-laptop-code',
  'Investment': 'fa-chart-line',
  'Gift': 'fa-gift'
}

export const categoryColors = {
  'Dining': '#ff6b6b',
  'Shopping': '#4ecdc4',
  'Groceries': '#95e1d3',
  'Transportation': '#f38181',
  'Entertainment': '#aa96da',
  'Other': '#83827d'
}

// Initial transaction data
const initialTransactions = [
  // December transactions
  { date: 'Dec 10', merchant: 'Starbucks', category: 'Dining', amount: 8.50, icon: 'fa-coffee', type: 'expense' },
  { date: 'Dec 10', merchant: 'Uber', category: 'Transportation', amount: 24.30, icon: 'fa-car', type: 'expense' },
  { date: 'Dec 9', merchant: 'Amazon', category: 'Shopping', amount: 156.78, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Dec 9', merchant: 'Whole Foods', category: 'Groceries', amount: 87.42, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Dec 9', merchant: 'McDonalds', category: 'Dining', amount: 12.45, icon: 'fa-burger', type: 'expense' },
  { date: 'Dec 8', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, icon: 'fa-tv', type: 'expense' },
  { date: 'Dec 8', merchant: 'Shell Gas', category: 'Transportation', amount: 52.00, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Dec 8', merchant: 'Target', category: 'Shopping', amount: 43.21, icon: 'fa-bag-shopping', type: 'expense' },
  { date: 'Dec 7', merchant: 'Chipotle', category: 'Dining', amount: 13.25, icon: 'fa-bowl-food', type: 'expense' },
  { date: 'Dec 7', merchant: 'Safeway', category: 'Groceries', amount: 95.67, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Dec 6', merchant: 'Spotify', category: 'Entertainment', amount: 10.99, icon: 'fa-music', type: 'expense' },
  { date: 'Dec 6', merchant: 'Chevron', category: 'Transportation', amount: 48.20, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Dec 5', merchant: 'Olive Garden', category: 'Dining', amount: 54.80, icon: 'fa-utensils', type: 'expense' },
  { date: 'Dec 5', merchant: 'Best Buy', category: 'Shopping', amount: 89.99, icon: 'fa-desktop', type: 'expense' },
  { date: 'Dec 4', merchant: 'Subway', category: 'Dining', amount: 9.75, icon: 'fa-sandwich', type: 'expense' },
  { date: 'Dec 4', merchant: 'CVS Pharmacy', category: 'Other', amount: 32.45, icon: 'fa-pills', type: 'expense' },
  { date: 'Dec 3', merchant: 'Lyft', category: 'Transportation', amount: 18.50, icon: 'fa-car', type: 'expense' },
  { date: 'Dec 3', merchant: 'Walmart', category: 'Groceries', amount: 123.56, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Dec 2', merchant: 'Panda Express', category: 'Dining', amount: 11.25, icon: 'fa-bowl-rice', type: 'expense' },
  { date: 'Dec 2', merchant: 'AMC Theater', category: 'Entertainment', amount: 32.50, icon: 'fa-film', type: 'expense' },
  { date: 'Dec 1', merchant: 'In-N-Out', category: 'Dining', amount: 15.60, icon: 'fa-burger', type: 'expense' },
  { date: 'Dec 1', merchant: 'Costco', category: 'Groceries', amount: 187.34, icon: 'fa-warehouse', type: 'expense' },
  { date: 'Dec 1', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  { date: 'Dec 15', merchant: 'Freelance Project', category: 'Freelance', amount: 1200.00, icon: 'fa-laptop-code', type: 'income' },
  
  // November transactions
  { date: 'Nov 28', merchant: 'Starbucks', category: 'Dining', amount: 7.50, icon: 'fa-coffee', type: 'expense' },
  { date: 'Nov 25', merchant: 'Target', category: 'Shopping', amount: 124.50, icon: 'fa-bag-shopping', type: 'expense' },
  { date: 'Nov 22', merchant: 'Whole Foods', category: 'Groceries', amount: 98.30, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Nov 20', merchant: 'Shell Gas', category: 'Transportation', amount: 55.00, icon: 'fa-gas-pump', type: 'expense' },
  { date: 'Nov 15', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, icon: 'fa-tv', type: 'expense' },
  { date: 'Nov 10', merchant: 'Chipotle', category: 'Dining', amount: 14.75, icon: 'fa-bowl-food', type: 'expense' },
  { date: 'Nov 1', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
  
  // October transactions
  { date: 'Oct 25', merchant: 'Amazon', category: 'Shopping', amount: 89.99, icon: 'fa-cart-shopping', type: 'expense' },
  { date: 'Oct 20', merchant: 'Safeway', category: 'Groceries', amount: 105.20, icon: 'fa-basket-shopping', type: 'expense' },
  { date: 'Oct 15', merchant: 'Uber', category: 'Transportation', amount: 32.50, icon: 'fa-car', type: 'expense' },
  { date: 'Oct 10', merchant: 'Spotify', category: 'Entertainment', amount: 10.99, icon: 'fa-music', type: 'expense' },
  { date: 'Oct 5', merchant: 'McDonalds', category: 'Dining', amount: 11.25, icon: 'fa-burger', type: 'expense' },
  { date: 'Oct 1', merchant: 'Monthly Salary', category: 'Salary', amount: 5000.00, icon: 'fa-money-bill-wave', type: 'income' },
]

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState(initialTransactions)

  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions])
  }

  const deleteTransaction = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index))
  }

  const updateTransaction = (index, updatedTransaction) => {
    const newTransactions = [...transactions]
    newTransactions[index] = updatedTransaction
    setTransactions(newTransactions)
  }

  // Helper: Get transactions for a specific month
  const getTransactionsByMonth = (month) => {
    return transactions.filter(t => t.date.includes(month))
  }

  // Helper: Get transactions by type
  const getTransactionsByType = (type) => {
    return transactions.filter(t => t.type === type)
  }

  // Helper: Calculate total for a month
  const getMonthTotal = (month, type = null) => {
    const monthTransactions = getTransactionsByMonth(month)
    const filtered = type ? monthTransactions.filter(t => t.type === type) : monthTransactions
    return filtered.reduce((sum, t) => sum + t.amount, 0)
  }

  // Helper: Get category totals for a month
  const getCategoryTotals = (month, type = 'expense') => {
    const monthTransactions = getTransactionsByMonth(month)
    const totals = {}
    
    monthTransactions.forEach(t => {
      if (t.type === type) {
        totals[t.category] = (totals[t.category] || 0) + t.amount
      }
    })
    
    return totals
  }

  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionsByMonth,
    getTransactionsByType,
    getMonthTotal,
    getCategoryTotals
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
