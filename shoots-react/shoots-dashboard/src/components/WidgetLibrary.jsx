import { useState, useMemo, useRef } from 'react'
import { WIDGET_CATEGORIES, getWidgetsByCategory, setCurrentDragWidget, clearCurrentDragWidget } from '../data/widgetCatalog'
import { useDashboard } from '../context/DashboardContext'
import './WidgetLibrary.css'

// Import actual widget components for live preview
import BudgetProgressBarWidget from './BudgetProgressBarWidget'
import AddTransactionButton from './AddTransactionButton'
import SavingsJarWidget from './SavingsJarWidget'
import CategoryBreakdownWidget from './CategoryBreakdownWidget'
import SpendingTrendsWidget from './SpendingTrendsWidget'
import RecentTransactionsWidget from './RecentTransactionsWidget'
import UpcomingTransactionsWidget from './UpcomingTransactionsWidget'
import ImageWidget from './ImageWidget'

// Map widget IDs to their actual components
const WIDGET_COMPONENTS = {
  'budget-progress-bar': BudgetProgressBarWidget,
  'add-transaction-button': AddTransactionButton,
  'savings-jar': SavingsJarWidget,
  'category-breakdown': CategoryBreakdownWidget,
  'spending-trends': SpendingTrendsWidget,
  'recent-transactions': RecentTransactionsWidget,
  'upcoming-transactions': UpcomingTransactionsWidget,
  'image-widget': ImageWidget
}

// Live Widget Preview - renders actual widget scaled down
function WidgetPreview({ widget }) {
  const WidgetComponent = WIDGET_COMPONENTS[widget.id]
  
  if (!WidgetComponent) {
    return (
      <div className="preview-fallback">
        <i className={`fa-solid ${widget.icon}`}></i>
      </div>
    )
  }

  // Special props for specific widgets
  const getWidgetProps = () => {
    switch (widget.id) {
      case 'add-transaction-button':
        return { onClick: () => {} }
      case 'image-widget':
        return { instanceId: 'preview', size: { width: 2, height: 2 } }
      case 'recent-transactions':
      case 'upcoming-transactions':
        return { isFeatured: false }
      default:
        return {}
    }
  }

  return (
    <div className="live-widget-preview" data-widget-id={widget.id}>
      <WidgetComponent {...getWidgetProps()} />
    </div>
  )
}

function WidgetLibrary({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedWidgets, setSelectedWidgets] = useState([])
  const [showCheckboxes, setShowCheckboxes] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredWidget, setHoveredWidget] = useState(null)
  const dragImageRef = useRef(null)
  
  const { addWidget, addMultipleWidgets, widgets: dashboardWidgets } = useDashboard()

  // Filter widgets based on search, category, and dashboard presence
  const filteredWidgets = useMemo(() => {
    let widgets = getWidgetsByCategory(activeCategory)
    const usedWidgetIds = new Set(dashboardWidgets.map(w => w.widgetId))
    // Filter out used widgets, but keep those with keepInLibrary flag
    widgets = widgets.filter(w => w.keepInLibrary || !usedWidgetIds.has(w.id))
    if (searchQuery) {
      widgets = widgets.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return widgets
  }, [searchQuery, activeCategory, dashboardWidgets])

  // Handle drag start
  const handleDragStart = (e, widget) => {
    // Prevent default drag image (browser often shows icon as image)
    e.dataTransfer.setData('application/json', JSON.stringify({
      widgetId: widget.id,
      size: widget.defaultSize
    }))
    // Store widget ID as text so we can access it during dragOver
    e.dataTransfer.setData('text/plain', widget.id)
    e.dataTransfer.effectAllowed = 'copy'
    
    // Store the widget info globally so it can be accessed during dragover
    // (dataTransfer.getData() is not accessible during dragover for security reasons)
    setCurrentDragWidget({ id: widget.id, size: widget.defaultSize })
    
    // Create a custom drag image
    const dragPreview = document.createElement('div')
    dragPreview.className = 'widget-drag-preview'
    dragPreview.innerHTML = `<i class="fa-solid ${widget.icon}"></i> ${widget.name}`
    dragPreview.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      padding: 8px 16px;
      background: var(--theme-primary, #4a9eff);
      color: #191919;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 10000;
    `
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 0, 0)
    
    // Clean up the drag preview after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
    
    // Set dragging state to make overlay transparent to pointer events
    setIsDragging(true)
  }
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
    clearCurrentDragWidget()
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
      <div 
        className={`widget-library-overlay ${isDragging ? 'dragging' : ''}`}
        onClick={onClose}
        style={isDragging ? { pointerEvents: 'none' } : {}}
      />
      <div className={`widget-library ${isDragging ? 'dragging' : ''}`}>
        <div className="widget-library-header">
          <h2>Widget Library</h2>
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
          <select
            className="category-dropdown"
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value={WIDGET_CATEGORIES.STATS}>Stats</option>
            <option value={WIDGET_CATEGORIES.CHARTS}>Charts</option>
            <option value={WIDGET_CATEGORIES.LISTS}>Lists</option>
            <option value={WIDGET_CATEGORIES.ACTIONS}>Actions</option>
          </select>
        </div>

        <div className="widget-library-content">
          {filteredWidgets.map(widget => (
            <div
              key={widget.id}
              className={`widget-card ${selectedWidgets.includes(widget.id) ? 'selected' : ''} ${hoveredWidget?.id === widget.id ? 'hovered' : ''}`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragEnd={handleDragEnd}
              onMouseEnter={() => setHoveredWidget(widget)}
              onMouseLeave={() => setHoveredWidget(null)}
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
              <div className="widget-card-info">
                <h3>{widget.name} <span className="widget-card-size-badge">{widget.defaultSize.width}×{widget.defaultSize.height}</span></h3>
                <p>{widget.description}</p>
              </div>
              <div className="widget-card-icon" style={{ color: widget.color }} draggable={false}>
                <i className={`fa-solid ${widget.icon}`} draggable={false}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Panel - shows on hover (desktop only) */}
        {hoveredWidget && (
          <div className="widget-preview-panel">
            <div className="widget-preview-header">
              <div className="widget-preview-icon">
                <i className={`fa-solid ${hoveredWidget.icon}`}></i>
              </div>
              <div className="widget-preview-title">
                <h3>{hoveredWidget.name}</h3>
                <span className="widget-preview-size">{hoveredWidget.defaultSize.width}×{hoveredWidget.defaultSize.height}</span>
              </div>
            </div>
            
            <div className="widget-preview-mockup">
              <WidgetPreview widget={hoveredWidget} />
            </div>
            
            {hoveredWidget.preview?.features && (
              <div className="widget-preview-features">
                <h4>Features</h4>
                <ul>
                  {hoveredWidget.preview.features.map((feature, idx) => (
                    <li key={idx}>
                      <i className="fa-solid fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
