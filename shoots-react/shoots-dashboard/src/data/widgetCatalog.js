// Widget Categories
export const WIDGET_CATEGORIES = {
  STATS: 'stats',
  CHARTS: 'charts',
  LISTS: 'lists',
  ACTIONS: 'actions'
}

// Widget Catalog - All available widgets
export const WIDGET_CATALOG = [
  // Stats Widgets
  {
    id: 'total-balance-widget',
    name: 'Total Balance',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Shows your current account balance',
    icon: 'fa-wallet',
    defaultSize: { width: 6, height: 4 }
  },
  {
    id: 'monthly-income-widget',
    name: 'Monthly Income',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Total income for the current month',
    icon: 'fa-arrow-trend-up',
    defaultSize: { width: 6, height: 4 }
  },
  {
    id: 'monthly-spending-widget',
    name: 'Monthly Spending',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Total spending for the current month',
    icon: 'fa-arrow-trend-down',
    defaultSize: { width: 6, height: 4 }
  },
  {
    id: 'total-savings-widget',
    name: 'Total Savings',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Combined total of all savings goals',
    icon: 'fa-piggy-bank',
    defaultSize: { width: 6, height: 4 }
  },
  {
    id: 'recurring-bills-widget',
    name: 'Recurring Bills',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Number of active recurring bills',
    icon: 'fa-repeat',
    defaultSize: { width: 6, height: 4 }
  },

  // Chart Widgets
  {
    id: 'income-vs-spending-chart',
    name: 'Income vs Spending',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Monthly comparison chart',
    icon: 'fa-chart-line',
    defaultSize: { width: 12, height: 5 }
  },
  {
    id: 'category-breakdown-chart',
    name: 'Category Breakdown',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Spending distribution by category',
    icon: 'fa-chart-pie',
    defaultSize: { width: 8, height: 6 }
  },
  {
    id: 'trend-analysis-chart',
    name: 'Trend Analysis',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Multi-month spending trends',
    icon: 'fa-chart-area',
    defaultSize: { width: 14, height: 6 }
  },
  {
    id: 'budget-progress-chart',
    name: 'Budget Progress',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Visual progress bars for budgets',
    icon: 'fa-chart-bar',
    defaultSize: { width: 10, height: 5 }
  },

  // List Widgets
  {
    id: 'recent-transactions-widget',
    name: 'Recent Transactions',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Last 10 transactions',
    icon: 'fa-list',
    defaultSize: { width: 8, height: 6 }
  },
  {
    id: 'upcoming-bills-widget',
    name: 'Upcoming Bills',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Bills due in the next 7 days',
    icon: 'fa-calendar-check',
    defaultSize: { width: 6, height: 5 }
  },
  {
    id: 'active-budgets-widget',
    name: 'Active Budgets',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Current budget status overview',
    icon: 'fa-wallet',
    defaultSize: { width: 6, height: 5 }
  },

  // Quick Action Widgets
  {
    id: 'quick-add-transaction',
    name: 'Quick Add Transaction',
    category: WIDGET_CATEGORIES.ACTIONS,
    description: 'Fast transaction entry form',
    icon: 'fa-plus-circle',
    defaultSize: { width: 7, height: 5 }
  }
]

// Helper functions
export const getWidgetsByCategory = (category) => {
  if (!category || category === 'all') return WIDGET_CATALOG
  return WIDGET_CATALOG.filter(widget => widget.category === category)
}

export const getWidgetById = (id) => {
  return WIDGET_CATALOG.find(widget => widget.id === id)
}

export const getCategoriesWithCounts = () => {
  const counts = {}
  WIDGET_CATALOG.forEach(widget => {
    counts[widget.category] = (counts[widget.category] || 0) + 1
  })
  
  return Object.keys(WIDGET_CATEGORIES).map(key => ({
    category: WIDGET_CATEGORIES[key],
    count: counts[WIDGET_CATEGORIES[key]] || 0
  }))
}
