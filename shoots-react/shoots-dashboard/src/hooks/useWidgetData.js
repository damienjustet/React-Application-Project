/**
 * Widget Data Hook
 * 
 * A unified hook for widgets to access all the data they need.
 * Provides memoized selectors and computed values for optimal performance.
 */

import { useMemo, useCallback } from 'react'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { useDashboard } from '../context/DashboardContext'

/**
 * Data dependencies that widgets can declare
 */
export const DATA_DEPENDENCIES = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  SAVINGS: 'savings',
  RECURRING: 'recurring',
  THEME: 'theme',
  DASHBOARD: 'dashboard'
}

/**
 * Main hook for widgets to access data
 * @param {string[]} dependencies - Array of DATA_DEPENDENCIES the widget needs
 * @returns {object} Object containing requested data and computed values
 */
export function useWidgetData(dependencies = []) {
  const dataContext = useData()
  const themeContext = useTheme()
  const dashboardContext = useDashboard()

  const {
    transactions,
    budgets,
    savingsGoals,
    recurringBills,
    selectedMonth,
    getTransactionsByMonth,
    getMonthTotal,
    getCategoryTotals
  } = dataContext

  const { palette, getCategoryColors } = themeContext

  // ============================================
  // MEMOIZED SELECTORS
  // ============================================

  // Current month transactions (memoized)
  const currentMonthTransactions = useMemo(() => {
    return getTransactionsByMonth(selectedMonth)
  }, [transactions, selectedMonth, getTransactionsByMonth])

  // Monthly income total (memoized)
  const monthlyIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [currentMonthTransactions])

  // Monthly spending total (memoized)
  const monthlySpending = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [currentMonthTransactions])

  // Net balance for the month
  const monthlyBalance = useMemo(() => {
    return monthlyIncome - monthlySpending
  }, [monthlyIncome, monthlySpending])

  // Total budget limit
  const totalBudgetLimit = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.limit, 0)
  }, [budgets])

  // Total budget spent
  const totalBudgetSpent = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.spent, 0)
  }, [budgets])

  // Budget remaining
  const totalBudgetRemaining = useMemo(() => {
    return totalBudgetLimit - totalBudgetSpent
  }, [totalBudgetLimit, totalBudgetSpent])

  // Budget progress percentage
  const budgetProgress = useMemo(() => {
    return totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0
  }, [totalBudgetSpent, totalBudgetLimit])

  // Total savings across all goals
  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.current, 0)
  }, [savingsGoals])

  // Total savings target
  const totalSavingsTarget = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.target, 0)
  }, [savingsGoals])

  // Savings progress percentage
  const savingsProgress = useMemo(() => {
    return totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 0
  }, [totalSavings, totalSavingsTarget])

  // Monthly recurring total
  const monthlyRecurringTotal = useMemo(() => {
    return recurringBills
      .filter(b => b.frequency === 'monthly')
      .reduce((sum, b) => sum + b.amount, 0)
  }, [recurringBills])

  // Upcoming bills (due in next 7 days)
  const upcomingBills = useMemo(() => {
    const today = new Date().getDate()
    return recurringBills.filter(bill => {
      const dueDate = parseInt(bill.dueDate)
      const daysUntil = dueDate >= today 
        ? dueDate - today 
        : (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) - today + dueDate
      return daysUntil <= 7 && !bill.isPaid
    })
  }, [recurringBills])

  // Unpaid bills count
  const unpaidBillsCount = useMemo(() => {
    return recurringBills.filter(b => !b.isPaid).length
  }, [recurringBills])

  // Category spending breakdown (memoized)
  const categoryBreakdown = useMemo(() => {
    return getCategoryTotals(selectedMonth, 'expense')
  }, [selectedMonth, getCategoryTotals, transactions])

  // Recent transactions (last 10)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 10)
  }, [transactions])

  // Budgets with status
  const budgetsWithStatus = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      remaining: budget.limit - budget.spent,
      percentage: budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0,
      status: budget.spent > budget.limit ? 'over' : budget.spent > budget.limit * 0.8 ? 'warning' : 'good'
    }))
  }, [budgets])

  // ============================================
  // COMPUTED SUMMARIES
  // ============================================

  const financialSummary = useMemo(() => ({
    monthlyIncome,
    monthlySpending,
    monthlyBalance,
    totalBudgetLimit,
    totalBudgetSpent,
    totalBudgetRemaining,
    budgetProgress,
    totalSavings,
    totalSavingsTarget,
    savingsProgress,
    monthlyRecurringTotal,
    unpaidBillsCount
  }), [
    monthlyIncome, monthlySpending, monthlyBalance,
    totalBudgetLimit, totalBudgetSpent, totalBudgetRemaining, budgetProgress,
    totalSavings, totalSavingsTarget, savingsProgress,
    monthlyRecurringTotal, unpaidBillsCount
  ])

  // ============================================
  // RETURN ONLY REQUESTED DATA
  // ============================================

  const result = {
    // Always available
    selectedMonth,
    financialSummary
  }

  // Add data based on dependencies
  if (dependencies.includes(DATA_DEPENDENCIES.TRANSACTIONS)) {
    result.transactions = transactions
    result.currentMonthTransactions = currentMonthTransactions
    result.recentTransactions = recentTransactions
    result.categoryBreakdown = categoryBreakdown
    result.addTransaction = dataContext.addTransaction
    result.updateTransaction = dataContext.updateTransaction
    result.deleteTransaction = dataContext.deleteTransaction
    result.getTransactionsByMonth = getTransactionsByMonth
    result.getMonthTotal = getMonthTotal
    result.getCategoryTotals = getCategoryTotals
  }

  if (dependencies.includes(DATA_DEPENDENCIES.BUDGETS)) {
    result.budgets = budgets
    result.budgetsWithStatus = budgetsWithStatus
    result.setBudgets = dataContext.setBudgets
  }

  if (dependencies.includes(DATA_DEPENDENCIES.SAVINGS)) {
    result.savingsGoals = savingsGoals
    result.setSavingsGoals = dataContext.setSavingsGoals
  }

  if (dependencies.includes(DATA_DEPENDENCIES.RECURRING)) {
    result.recurringBills = recurringBills
    result.upcomingBills = upcomingBills
    result.setRecurringBills = dataContext.setRecurringBills
  }

  if (dependencies.includes(DATA_DEPENDENCIES.THEME)) {
    result.palette = palette
    result.getCategoryColors = getCategoryColors
  }

  if (dependencies.includes(DATA_DEPENDENCIES.DASHBOARD)) {
    result.widgets = dashboardContext.widgets
    result.addWidget = dashboardContext.addWidget
    result.removeWidget = dashboardContext.removeWidget
    result.moveWidget = dashboardContext.moveWidget
    result.resizeWidget = dashboardContext.resizeWidget
  }

  return result
}

export default useWidgetData
