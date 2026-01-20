// Widget Categories
export const WIDGET_CATEGORIES = {
  STATS: 'stats',
  CHARTS: 'charts',
  LISTS: 'lists',
  ACTIONS: 'actions'
}

// Widget Display Types - determines how widgets are rendered on the dashboard
export const WIDGET_DISPLAY_TYPE = {
  GRID: 'grid',           // Standard grid widget (card)
  FEATURED: 'featured'    // Full-width section below the grid (standalone module)
}

// Widget Catalog - All available widgets
export const WIDGET_CATALOG = [
  {
    id: 'budget-progress-bar',
    name: 'Budget Progress Bar',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Shows a visual progress bar of spending vs. budget',
    icon: 'fa-battery-half',
    defaultSize: { width: 10, height: 1 },
    displayType: WIDGET_DISPLAY_TYPE.GRID
  },
  {
    id: 'add-transaction-button',
    name: 'Add Transaction',
    category: WIDGET_CATEGORIES.ACTIONS,
    description: 'Circular button to create a new transaction',
    icon: 'fa-plus',
    defaultSize: { width: 1, height: 1 },
    displayType: WIDGET_DISPLAY_TYPE.GRID
  },
  {
    id: 'upcoming-transactions',
    name: 'Upcoming Transactions',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Shows the next 5 upcoming bills and subscriptions',
    icon: 'fa-calendar-days',
    defaultSize: { width: 15, height: 3 },
    displayType: WIDGET_DISPLAY_TYPE.FEATURED  // This widget gets its own section
  },
  {
    id: 'savings-jar',
    name: 'Savings Jar',
    category: WIDGET_CATEGORIES.STATS,
    description: 'Visual jar showing savings progress with ability to switch between goals',
    icon: 'fa-jar',
    defaultSize: { width: 3, height: 5 },
    displayType: WIDGET_DISPLAY_TYPE.GRID
  },
  {
    id: 'category-breakdown',
    name: 'Category Breakdown',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Pie chart with spending breakdown by category',
    icon: 'fa-chart-pie',
    defaultSize: { width: 8, height: 4 },
    displayType: WIDGET_DISPLAY_TYPE.GRID
  },
  {
    id: 'spending-trends',
    name: 'Spending Trends',
    category: WIDGET_CATEGORIES.CHARTS,
    description: 'Area chart showing 6-month spending trends with optional bills toggle',
    icon: 'fa-chart-line',
    defaultSize: { width: 7, height: 5 },
    displayType: WIDGET_DISPLAY_TYPE.GRID
  },
  {
    id: 'recent-transactions',
    name: 'Recent Transactions',
    category: WIDGET_CATEGORIES.LISTS,
    description: 'Shows the 5 most recent transactions with amounts and categories',
    icon: 'fa-receipt',
    defaultSize: { width: 8, height: 7 },
    displayType: WIDGET_DISPLAY_TYPE.FEATURED  // Featured widget on mobile
  },
  {
    id: 'image-widget',
    name: 'Image',
    category: WIDGET_CATEGORIES.ACTIONS,
    description: 'Upload and display a custom image. Resizable in edit mode.',
    icon: 'fa-image',
    defaultSize: { width: 2, height: 2 },
    displayType: WIDGET_DISPLAY_TYPE.GRID,
    webOnly: true,         // Only visible on web, hidden on mobile
    keepInLibrary: true,   // Doesn't disappear from library when added
    resizable: true,       // Can be resized by user
    minSize: { width: 2, height: 2 }
  }
]

// Track currently dragged widget (needed because dataTransfer.getData() 
// is not accessible during dragover events for security reasons)
let currentDragWidget = null

export const setCurrentDragWidget = (widget) => {
  currentDragWidget = widget
}

export const getCurrentDragWidget = () => {
  return currentDragWidget
}

export const clearCurrentDragWidget = () => {
  currentDragWidget = null
}

// Helper functions
export const getWidgetsByCategory = (category) => {
  if (!category || category === 'all') return WIDGET_CATALOG
  return WIDGET_CATALOG.filter(widget => widget.category === category)
}

export const getWidgetById = (id) => {
  return WIDGET_CATALOG.find(widget => widget.id === id)
}
