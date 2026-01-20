import { useState, useMemo, memo } from 'react'
import { WIDGET_CATALOG, WIDGET_CATEGORIES } from '../data/widgetCatalog'
import { useDashboard } from '../context/DashboardContext'
import './MobileWidgetDrawer.css'

// Web view grid capacity (the actual constraint for all views)
const WEB_GRID_COLS = 28 // Maximum columns on web view
const WEB_GRID_ROWS = 14 // Constant rows on web view
const MAX_GRID_CELLS = WEB_GRID_COLS * WEB_GRID_ROWS

function MobileWidgetDrawer({ isOpen, onClose }) {
  const { widgets: dashboardWidgets, addWidget } = useDashboard()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Calculate current grid usage from actual widget sizes on dashboard
  const gridUsage = useMemo(() => {
    let usedCells = 0
    dashboardWidgets.forEach(widget => {
      // Skip featured widgets that don't take grid space
      if (widget.widgetId === 'upcoming-transactions') return
      // Use the widget's actual size on the dashboard, not default size
      if (widget.size) {
        usedCells += widget.size.width * widget.size.height
      }
    })
    return usedCells
  }, [dashboardWidgets])

  // Check if a widget is already added
  const isWidgetAdded = (widgetId) => {
    return dashboardWidgets.some(w => w.widgetId === widgetId)
  }

  // Check if adding a widget would exceed grid capacity
  const canAddWidget = (catalogWidget) => {
    if (isWidgetAdded(catalogWidget.id)) return false
    // Skip featured widgets that don't take grid space
    if (catalogWidget.id === 'upcoming-transactions') return true
    const cellsNeeded = catalogWidget.defaultSize.width * catalogWidget.defaultSize.height
    return (gridUsage + cellsNeeded) <= MAX_GRID_CELLS
  }

  // Filter widgets based on search and category
  const filteredWidgets = useMemo(() => {
    return WIDGET_CATALOG.filter(widget => {
      const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           widget.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // Group widgets by category for display
  const groupedWidgets = useMemo(() => {
    const groups = {}
    filteredWidgets.forEach(widget => {
      if (!groups[widget.category]) {
        groups[widget.category] = []
      }
      groups[widget.category].push(widget)
    })
    return groups
  }, [filteredWidgets])

  // Get category display name
  const getCategoryName = (category) => {
    const names = {
      [WIDGET_CATEGORIES.STATS]: 'Statistics',
      [WIDGET_CATEGORIES.CHARTS]: 'Charts',
      [WIDGET_CATEGORIES.LISTS]: 'Lists',
      [WIDGET_CATEGORIES.ACTIONS]: 'Actions'
    }
    return names[category] || category
  }

  // Handle adding a widget
  const handleAddWidget = (catalogWidget) => {
    if (!canAddWidget(catalogWidget)) return
    addWidget(catalogWidget.id) // Let context find empty spot automatically
  }

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="mobile-widget-drawer">
        <div className="drawer-handle" onClick={onClose}>
          <div className="drawer-handle-bar"></div>
        </div>
        
        <div className="drawer-header">
          <h2>Add Widgets</h2>
          <div className="grid-capacity">
            <span className={gridUsage >= MAX_GRID_CELLS ? 'full' : ''}>
              {Math.round((gridUsage / MAX_GRID_CELLS) * 100)}% used
            </span>
          </div>
        </div>

        <div className="drawer-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="category-tabs">
          <button
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {Object.values(WIDGET_CATEGORIES).map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {getCategoryName(cat)}
            </button>
          ))}
        </div>

        <div className="drawer-content">
          {filteredWidgets.length === 0 ? (
            <div className="no-widgets">
              <i className="fa-solid fa-box-open"></i>
              <p>No widgets found</p>
            </div>
          ) : (
            Object.entries(groupedWidgets).map(([category, widgets]) => (
              <div key={category} className="widget-group">
                {selectedCategory === 'all' && (
                  <h3 className="group-title">{getCategoryName(category)}</h3>
                )}
                <div className="widget-list">
                  {widgets.map(widget => {
                    const added = isWidgetAdded(widget.id)
                    const canAdd = canAddWidget(widget)
                    
                    return (
                      <div key={widget.id} className={`drawer-widget-item ${added ? 'added' : ''}`}>
                        <div className="widget-icon">
                          <i className={`fa-solid ${widget.icon}`}></i>
                        </div>
                        <div className="widget-info">
                          <span className="widget-name">{widget.name}</span>
                          <span className="widget-description">{widget.description}</span>
                        </div>
                        <button
                          className={`add-widget-btn ${added ? 'added' : ''} ${!canAdd && !added ? 'disabled' : ''}`}
                          onClick={() => handleAddWidget(widget)}
                          disabled={added || !canAdd}
                        >
                          {added ? (
                            <i className="fa-solid fa-check"></i>
                          ) : !canAdd ? (
                            <i className="fa-solid fa-ban"></i>
                          ) : (
                            <i className="fa-solid fa-plus"></i>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {gridUsage >= MAX_GRID_CELLS && (
          <div className="grid-full-notice">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>Grid is full. Remove widgets to add more.</span>
          </div>
        )}
      </div>
    </>
  )
}

export default memo(MobileWidgetDrawer)
