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
    defaultSize: { width: 4, height: 5 },
    displayType: WIDGET_DISPLAY_TYPE.GRID
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
