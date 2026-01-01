import { useState, useMemo } from 'react'
import { WIDGET_CATALOG, WIDGET_CATEGORIES, getWidgetsByCategory } from '../data/widgetCatalog'
import { useDashboard } from '../context/DashboardContext'
import './WidgetLibrary.css'

function WidgetLibrary({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedWidgets, setSelectedWidgets] = useState([])
  const [showCheckboxes, setShowCheckboxes] = useState(false)
  
  const { addWidget, addMultipleWidgets } = useDashboard()

  // Filter widgets based on search and category
  const filteredWidgets = useMemo(() => {
    let widgets = getWidgetsByCategory(activeCategory)
    
    if (searchQuery) {
      widgets = widgets.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return widgets
  }, [searchQuery, activeCategory])

  // Handle drag start
  const handleDragStart = (e, widget) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      widgetId: widget.id,
      size: widget.defaultSize
    }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  // Handle checkbox toggle
  const toggleWidgetSelection = (widgetId) => {
    setSelectedWidgets(prev => {
      if (prev.includes(widgetId)) {
        return prev.filter(id => id !== widgetId)
      } else {
        return [...prev, widgetId]
      }
    })
  }

  // Handle add selected widgets
  const handleAddSelected = () => {
    const result = addMultipleWidgets(selectedWidgets)
    if (result.success) {
      setSelectedWidgets([])
      setShowCheckboxes(false)
    } else {
      alert(result.message)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="widget-library-overlay" onClick={onClose} />
      <div className="widget-library">
        <div className="widget-library-header">
          <h2>
            <i className="fa-solid fa-grip"></i>
            Widget Library
          </h2>
          <button className="close-btn" onClick={onClose} title="Close">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="widget-library-search">
          <i className="fa-solid fa-search"></i>
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="widget-library-controls">
          <button
            className={`toggle-checkbox-btn ${showCheckboxes ? 'active' : ''}`}
            onClick={() => {
              setShowCheckboxes(!showCheckboxes)
              setSelectedWidgets([])
            }}
          >
            <i className={`fa-solid ${showCheckboxes ? 'fa-check-square' : 'fa-square'}`}></i>
            {showCheckboxes ? 'Hide' : 'Show'} Checkboxes
          </button>
        </div>

        <div className="widget-library-categories">
          <button
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          <button
            className={`category-btn ${activeCategory === WIDGET_CATEGORIES.STATS ? 'active' : ''}`}
            onClick={() => setActiveCategory(WIDGET_CATEGORIES.STATS)}
          >
            <i className="fa-solid fa-chart-simple"></i>
            Stats
          </button>
          <button
            className={`category-btn ${activeCategory === WIDGET_CATEGORIES.CHARTS ? 'active' : ''}`}
            onClick={() => setActiveCategory(WIDGET_CATEGORIES.CHARTS)}
          >
            <i className="fa-solid fa-chart-line"></i>
            Charts
          </button>
          <button
            className={`category-btn ${activeCategory === WIDGET_CATEGORIES.LISTS ? 'active' : ''}`}
            onClick={() => setActiveCategory(WIDGET_CATEGORIES.LISTS)}
          >
            <i className="fa-solid fa-list"></i>
            Lists
          </button>
          <button
            className={`category-btn ${activeCategory === WIDGET_CATEGORIES.ACTIONS ? 'active' : ''}`}
            onClick={() => setActiveCategory(WIDGET_CATEGORIES.ACTIONS)}
          >
            <i className="fa-solid fa-bolt"></i>
            Actions
          </button>
        </div>

        <div className="widget-library-content">
          {filteredWidgets.map(widget => (
            <div
              key={widget.id}
              className={`widget-card ${selectedWidgets.includes(widget.id) ? 'selected' : ''}`}
              draggable={!showCheckboxes}
              onDragStart={(e) => handleDragStart(e, widget)}
            >
              {showCheckboxes && (
                <div className="widget-card-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedWidgets.includes(widget.id)}
                    onChange={() => toggleWidgetSelection(widget.id)}
                  />
                </div>
              )}
              <div className="widget-card-icon" style={{ color: widget.color }}>
                <i className={`fa-solid ${widget.icon}`}></i>
              </div>
              <div className="widget-card-info">
                <h3>{widget.name}</h3>
                <p>{widget.description}</p>
                <span className="widget-card-size">
                  {widget.defaultSize.width}×{widget.defaultSize.height}
                </span>
              </div>
              {!showCheckboxes && (
                <div className="widget-card-drag-handle">
                  <i className="fa-solid fa-grip-vertical"></i>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedWidgets.length > 0 && (
          <div className="widget-library-footer">
            <button className="add-selected-btn" onClick={handleAddSelected}>
              <i className="fa-solid fa-plus"></i>
              Add Selected ({selectedWidgets.length})
            </button>
          </div>
        )}

        <div className="widget-library-tip">
          <i className="fa-solid fa-lightbulb"></i>
          {showCheckboxes 
            ? 'Select widgets and click "Add Selected" to add multiple at once'
            : 'Drag widgets onto the dashboard to add them'
          }
        </div>
      </div>
    </>
  )
}

export default WidgetLibrary
