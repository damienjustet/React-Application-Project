/**
 * Widget Registry
 * 
 * Defines metadata for all widgets including their data dependencies,
 * component references, and configuration options.
 */

import { WIDGET_CATEGORIES } from './widgetCatalog'
import { DATA_DEPENDENCIES } from '../hooks/useWidgetData'

/**
 * Widget Registry - Maps widget IDs to their metadata and data dependencies
 */
export const WIDGET_REGISTRY = {
  // ============================================
  // STATS WIDGETS
  // ============================================
  'budget-progress-bar': {
    id: 'budget-progress-bar',
    name: 'Budget Progress Bar',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Shows a visual progress bar of spending vs. budget',
    icon: 'fa-battery-half',
    defaultSize: { width: 10, height: 1 },
    minSize: { width: 6, height: 1 },
    maxSize: { width: 28, height: 2 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.BUDGETS],
    refreshInterval: null, // No auto-refresh needed
    component: 'BudgetProgressBarWidget'
  },

  'total-balance-widget': {
    id: 'total-balance-widget',
    name: 'Total Balance',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Shows your current account balance',
    icon: 'fa-wallet',
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 10, height: 6 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS],
    refreshInterval: null,
    component: 'TotalBalanceWidget'
  },

  'monthly-income-widget': {
    id: 'monthly-income-widget',
    name: 'Monthly Income',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Total income for the current month',
    icon: 'fa-arrow-trend-up',
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 10, height: 6 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS],
    refreshInterval: null,
    component: 'MonthlyIncomeWidget'
  },

  'monthly-spending-widget': {
    id: 'monthly-spending-widget',
    name: 'Monthly Spending',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Total spending for the current month',
    icon: 'fa-arrow-trend-down',
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 10, height: 6 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS],
    refreshInterval: null,
    component: 'MonthlySpendingWidget'
  },

  'total-savings-widget': {
    id: 'total-savings-widget',
    name: 'Total Savings',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Combined total of all savings goals',
    icon: 'fa-piggy-bank',
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 10, height: 6 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.SAVINGS],
    refreshInterval: null,
    component: 'TotalSavingsWidget'
  },

  'recurring-bills-widget': {
    id: 'recurring-bills-widget',
    name: 'Recurring Bills',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Number of active recurring bills',
    icon: 'fa-repeat',
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 10, height: 6 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.RECURRING],
    refreshInterval: null,
    component: 'RecurringBillsWidget'
  },

  // ============================================
  // CHART WIDGETS
  // ============================================
  'income-vs-spending-chart': {
    id: 'income-vs-spending-chart',
    name: 'Income vs Spending',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Monthly comparison chart',
    icon: 'fa-chart-line',
    defaultSize: { width: 12, height: 5 },
    minSize: { width: 8, height: 4 },
    maxSize: { width: 20, height: 8 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS, DATA_DEPENDENCIES.THEME],
    refreshInterval: null,
    component: 'IncomeVsSpendingChart'
  },

  'category-breakdown-chart': {
    id: 'category-breakdown-chart',
    name: 'Category Breakdown',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Spending distribution by category',
    icon: 'fa-chart-pie',
    defaultSize: { width: 8, height: 6 },
    minSize: { width: 6, height: 5 },
    maxSize: { width: 14, height: 10 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS, DATA_DEPENDENCIES.THEME],
    refreshInterval: null,
    component: 'CategoryBreakdownChart'
  },

  'trend-analysis-chart': {
    id: 'trend-analysis-chart',
    name: 'Trend Analysis',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Multi-month spending trends',
    icon: 'fa-chart-area',
    defaultSize: { width: 14, height: 6 },
    minSize: { width: 10, height: 5 },
    maxSize: { width: 28, height: 10 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS],
    refreshInterval: null,
    component: 'TrendAnalysisChart'
  },

  'budget-progress-chart': {
    id: 'budget-progress-chart',
    name: 'Budget Progress',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Visual progress bars for budgets',
    icon: 'fa-chart-bar',
    defaultSize: { width: 10, height: 5 },
    minSize: { width: 8, height: 4 },
    maxSize: { width: 16, height: 8 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.BUDGETS, DATA_DEPENDENCIES.THEME],
    refreshInterval: null,
    component: 'BudgetProgressChart'
  },

  // ============================================
  // LIST WIDGETS
  // ============================================
  'recent-transactions-widget': {
    id: 'recent-transactions-widget',
    name: 'Recent Transactions',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Last 10 transactions',
    icon: 'fa-list',
    defaultSize: { width: 8, height: 6 },
    minSize: { width: 6, height: 4 },
    maxSize: { width: 14, height: 10 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS, DATA_DEPENDENCIES.THEME],
    refreshInterval: null,
    component: 'RecentTransactionsWidget'
  },

  'upcoming-bills-widget': {
    id: 'upcoming-bills-widget',
    name: 'Upcoming Bills',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Bills due in the next 7 days',
    icon: 'fa-calendar-check',
    defaultSize: { width: 6, height: 5 },
    minSize: { width: 5, height: 4 },
    maxSize: { width: 10, height: 8 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.RECURRING],
    refreshInterval: null,
    component: 'UpcomingBillsWidget'
  },

  'active-budgets-widget': {
    id: 'active-budgets-widget',
    name: 'Active Budgets',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Current budget status overview',
    icon: 'fa-wallet',
    defaultSize: { width: 6, height: 5 },
    minSize: { width: 5, height: 4 },
    maxSize: { width: 10, height: 8 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.BUDGETS, DATA_DEPENDENCIES.THEME],
    refreshInterval: null,
    component: 'ActiveBudgetsWidget'
  },

  // ============================================
  // ACTION WIDGETS
  // ============================================
  'quick-add-transaction': {
    id: 'quick-add-transaction',
    name: 'Quick Add Transaction',
    category: WIDGET_CATEGORIES.ACTIONS,
    description: 'Fast transaction entry form',
    icon: 'fa-plus-circle',
    defaultSize: { width: 7, height: 5 },
    minSize: { width: 6, height: 4 },
    maxSize: { width: 10, height: 7 },
    resizable: true,
    dependencies: [DATA_DEPENDENCIES.TRANSACTIONS],
    refreshInterval: null,
    component: 'QuickAddTransactionWidget'
  }
}

/**
 * Get widget metadata by ID
 * @param {string} widgetId 
 * @returns {object|null}
 */
export function getWidgetMetadata(widgetId) {
  return WIDGET_REGISTRY[widgetId] || null
}

/**
 * Get all widgets that depend on a specific data type
 * @param {string} dependency - DATA_DEPENDENCIES value
 * @returns {object[]}
 */
export function getWidgetsByDependency(dependency) {
  return Object.values(WIDGET_REGISTRY).filter(
    widget => widget.dependencies.includes(dependency)
  )
}

/**
 * Get data dependencies for a widget
 * @param {string} widgetId 
 * @returns {string[]}
 */
export function getWidgetDependencies(widgetId) {
  const widget = WIDGET_REGISTRY[widgetId]
  return widget ? widget.dependencies : []
}

/**
 * Check if a widget can be resized
 * @param {string} widgetId 
 * @returns {boolean}
 */
export function isWidgetResizable(widgetId) {
  const widget = WIDGET_REGISTRY[widgetId]
  return widget ? widget.resizable : false
}

/**
 * Get size constraints for a widget
 * @param {string} widgetId 
 * @returns {object|null}
 */
export function getWidgetSizeConstraints(widgetId) {
  const widget = WIDGET_REGISTRY[widgetId]
  if (!widget) return null
  return {
    minSize: widget.minSize,
    maxSize: widget.maxSize,
    defaultSize: widget.defaultSize
  }
}

export default WIDGET_REGISTRY
