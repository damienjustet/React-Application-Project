import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { useData } from '../context/DataContext'
import { getWidgetById, getCurrentDragWidget } from '../data/widgetCatalog'
import BudgetProgressBarWidget from './BudgetProgressBarWidget'
import AddTransactionButton from './AddTransactionButton'
import UpcomingTransactionsWidget from './UpcomingTransactionsWidget'
import SavingsJarWidget from './SavingsJarWidget'
import MobileDashboard from './MobileDashboard'
import './DashboardGrid.css'

const GRID_ROWS = 14 // Keep rows constant

// Pure function for grid columns calculation
const getGridColumns = () => {
  const width = window.innerWidth
  if (width >= 1200) return 28
  if (width >= 768) return 14
  return 7
}

function DashboardGrid({ isEditMode: mobileEditMode = false }) {
  const { widgets: dashboardWidgets, addWidget, removeWidget, moveWidget } = useDashboard()
  const { openAddTransactionModal } = useData()
  
  // Detect mobile view
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [gridColumns, setGridColumns] = useState(getGridColumns)
  const resizeTimeoutRef = useRef(null)
  
  // Edit mode state (desktop only - mobile uses prop)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Widget drag state (for moving widgets on grid)
  const [draggedWidget, setDraggedWidget] = useState(null)
  const [dragPosition, setDragPosition] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [originalPosition, setOriginalPosition] = useState(null)
  
  // Widget library drag state
  const [isWidgetDragging, setIsWidgetDragging] = useState(false)
  const [widgetDropZone, setWidgetDropZone] = useState(null)
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState(null)

  // Check if a widget overlaps with any existing widgets (excluding itself)
  const checkCollision = useCallback((x, y, w, h, excludeId) => {
    return dashboardWidgets.some(widget => {
      if (widget.id === excludeId) return false
      const noOverlap = 
        x >= widget.position.x + widget.size.width ||
        x + w <= widget.position.x ||
        y >= widget.position.y + widget.size.height ||
        y + h <= widget.position.y
      return !noOverlap
    })
  }, [dashboardWidgets])

  // Handle window resize with debounce
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = setTimeout(() => {
        const newColumns = getGridColumns()
        setGridColumns(prev => prev !== newColumns ? newColumns : prev)
        setIsMobile(window.innerWidth <= 768)
      }, 100)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
    }
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Widget drag handlers
  const handleWidgetMouseDown = (e, widget) => {
    // Only allow dragging in edit mode
    if (!isEditMode) return
    
    // Ignore right clicks (for context menu)
    if (e.button !== 0) return
    
    e.preventDefault()
    const gridElement = e.currentTarget.closest('.dashboard-grid')
    const rect = gridElement.getBoundingClientRect()
    const tileWidth = rect.width / gridColumns
    const tileHeight = rect.height / GRID_ROWS
    
    // Calculate the wrapper's position (full tile space)
    const wrapperLeft = widget.position.x * tileWidth
    const wrapperTop = widget.position.y * tileHeight
    
    // Calculate offset from the wrapper's top-left
    const offsetX = e.clientX - rect.left - wrapperLeft
    const offsetY = e.clientY - rect.top - wrapperTop
    
    setDraggedWidget(widget)
    setOriginalPosition({ x: widget.position.x, y: widget.position.y })
    setDragOffset({ x: offsetX, y: offsetY })
    setDragPosition({ x: wrapperLeft, y: wrapperTop })
  }

  const handleWidgetMouseMove = (e) => {
    if (!draggedWidget) return
    
    const gridElement = document.querySelector('.dashboard-grid')
    if (!gridElement) return
    
    const rect = gridElement.getBoundingClientRect()
    const pixelX = e.clientX - rect.left
    const pixelY = e.clientY - rect.top
    
    // Free-form movement during drag
    setDragPosition({
      x: pixelX - dragOffset.x,
      y: pixelY - dragOffset.y
    })
  }

  const handleWidgetMouseUp = (e) => {
    if (!draggedWidget) return
    
    const gridElement = document.querySelector('.dashboard-grid')
    if (!gridElement) return
    
    const rect = gridElement.getBoundingClientRect()
    const tileWidth = rect.width / gridColumns
    const tileHeight = rect.height / GRID_ROWS
    
    // Snap to nearest tile on drop
    const centerX = dragPosition.x + (draggedWidget.size.width * tileWidth) / 2
    const centerY = dragPosition.y + (draggedWidget.size.height * tileHeight) / 2
    
    const snappedX = Math.round(centerX / tileWidth - draggedWidget.size.width / 2)
    const snappedY = Math.round(centerY / tileHeight - draggedWidget.size.height / 2)
    
    // Ensure within bounds
    const finalX = Math.max(0, Math.min(gridColumns - draggedWidget.size.width, snappedX))
    const finalY = Math.max(0, Math.min(GRID_ROWS - draggedWidget.size.height, snappedY))
    
    // Check for collision at target position
    const hasCollision = checkCollision(finalX, finalY, draggedWidget.size.width, draggedWidget.size.height, draggedWidget.id)
    
    if (hasCollision) {
      // Collision detected - snap back to original position (do nothing, widget stays in place)
      console.log('Collision detected, reverting to original position')
    } else {
      // No collision - move widget to new position
      if (finalX !== originalPosition.x || finalY !== originalPosition.y) {
        moveWidget(draggedWidget.id, { x: finalX, y: finalY })
      }
    }
    
    setDraggedWidget(null)
    setDragPosition(null)
    setDragOffset({ x: 0, y: 0 })
    setOriginalPosition(null)
  }

  // Widget context menu handlers
  const handleWidgetRightClick = (e, widget) => {
    // Only show context menu in edit mode
    if (!isEditMode) return
    
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      widgetId: widget.id
    })
  }

  const handleRemoveWidget = (widgetId) => {
    removeWidget(widgetId)
    setContextMenu(null)
  }

  // Widget library drop handlers
  const handleWidgetDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsWidgetDragging(true)
    
    // Calculate grid position for preview
    const gridElement = e.currentTarget
    if (!gridElement) return
    
    const rect = gridElement.getBoundingClientRect()
    const tileWidth = rect.width / gridColumns
    const tileHeight = rect.height / GRID_ROWS
    
    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top
    
    const gridX = Math.floor(relativeX / tileWidth)
    const gridY = Math.floor(relativeY / tileHeight)
    
    // Get widget size from the currently dragged widget (stored globally)
    // Note: dataTransfer.getData() is not accessible during dragover for security reasons
    let widgetSize = { width: 6, height: 4 } // default fallback
    const draggedWidgetInfo = getCurrentDragWidget()
    if (draggedWidgetInfo && draggedWidgetInfo.size) {
      widgetSize = draggedWidgetInfo.size
    }
    
    setWidgetDropZone({ x: gridX, y: gridY, size: widgetSize })
  }

  const handleWidgetDragLeave = (e) => {
    // Only clear if leaving the grid entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsWidgetDragging(false)
      setWidgetDropZone(null)
    }
  }

  const handleWidgetDrop = (e) => {
    e.preventDefault()
    setIsWidgetDragging(false)
    setWidgetDropZone(null)
    try {
      const data = e.dataTransfer.getData('application/json')
      if (!data) return
      const widgetData = JSON.parse(data)
      if (!widgetData.widgetId) return
      // Calculate final grid position
      const gridElement = document.querySelector('.dashboard-grid')
      if (!gridElement) return
      const rect = gridElement.getBoundingClientRect()
      const tileWidth = rect.width / gridColumns
      const tileHeight = rect.height / GRID_ROWS
      const relativeX = e.clientX - rect.left
      const relativeY = e.clientY - rect.top
      const gridX = Math.max(0, Math.min(gridColumns - widgetData.size.width, Math.floor(relativeX / tileWidth)))
      const gridY = Math.max(0, Math.min(GRID_ROWS - widgetData.size.height, Math.floor(relativeY / tileHeight)))
      // Prevent dropping on top of existing widgets
      const hasCollision = checkCollision(
        gridX,
        gridY,
        widgetData.size.width,
        widgetData.size.height,
        null // no excludeId, since this is a new widget
      )
      if (hasCollision) {
        // Optionally, show feedback (alert or visual)
        // alert('Cannot drop widget here: space is occupied.')
        return
      }
      // Add widget at this position
      addWidget(widgetData.widgetId, { x: gridX, y: gridY })
    } catch (err) {
      console.error('Failed to drop widget:', err)
    }
  }

  // Show empty state if no widgets
  const showEmptyState = dashboardWidgets.length === 0

  // Render mobile dashboard on small screens
  if (isMobile) {
    return <MobileDashboard isEditMode={mobileEditMode} />
  }

  return (
    <div 
      className="dashboard-content"
      onMouseMove={handleWidgetMouseMove}
      onMouseUp={handleWidgetMouseUp}
      onMouseLeave={handleWidgetMouseUp}
    >
      {/* Edit Mode Toggle */}
      <div className="dashboard-toolbar">
        <button 
          className={`edit-mode-btn ${isEditMode ? 'active' : ''}`}
          onClick={() => setIsEditMode(!isEditMode)}
          title={isEditMode ? 'Exit Edit Mode' : 'Edit Widgets'}
        >
          <i className={`fa-solid ${isEditMode ? 'fa-check' : 'fa-edit'}`}></i>
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>
      
      {showEmptyState && (
        <div className="dashboard-empty-state">
          <i className="fa-solid fa-grip"></i>
          <h3>Drag widgets here to get started</h3>
          <p>Or use multi-select in the widget library →</p>
        </div>
      )}
      <div className="dashboard-grid-container">
        <div 
          className="dashboard-grid" 
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
          }}
          onDragOver={handleWidgetDragOver}
          onDragLeave={handleWidgetDragLeave}
          onDrop={handleWidgetDrop}
        >
          {/* Widget drop zone preview */}
          {isWidgetDragging && widgetDropZone && (
            <div
              className="widget-drop-zone"
              style={{
                gridColumn: `${widgetDropZone.x + 1} / span ${widgetDropZone.size.width}`,
                gridRow: `${widgetDropZone.y + 1} / span ${widgetDropZone.size.height}`,
                backgroundColor: 'var(--theme-subtle)',
                border: '2px dashed var(--theme-primary)',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          )}
          
          {/* Render grid tiles as background */}
          {Array.from({ length: gridColumns * GRID_ROWS }).map((_, index) => (
            <div key={index} className="grid-tile"></div>
          ))}

          {/* Render dashboard widgets from widget library */}
          {dashboardWidgets.map(widget => {
            const widgetDef = getWidgetById(widget.widgetId)
            if (!widgetDef) return null
            const isDragging = draggedWidget?.id === widget.id
            const style = isDragging && dragPosition
              ? {
                  position: 'absolute',
                  left: `${dragPosition.x}px`,
                  top: `${dragPosition.y}px`,
                  width: `calc((100% / ${gridColumns}) * ${widget.size.width})`,
                  height: `calc((100% / ${GRID_ROWS}) * ${widget.size.height})`,
                  gridColumn: 'unset',
                  gridRow: 'unset',
                  zIndex: 1000
                }
              : {
                  gridColumn: `${widget.position.x + 1} / span ${widget.size.width}`,
                  gridRow: `${widget.position.y + 1} / span ${widget.size.height}`
                }

            // Render custom widget for budget-progress-bar
            if (widget.widgetId === 'budget-progress-bar') {
              return (
                <div
                  key={widget.id}
                  className={`grid-block-wrapper widget-instance ${isDragging ? 'dragging' : ''} ${isEditMode ? 'edit-mode' : ''}`}
                  style={style}
                  onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
                  onContextMenu={(e) => handleWidgetRightClick(e, widget)}
                >
                  <BudgetProgressBarWidget data={widget.data} />
                </div>
              )
            }

            // Render custom widget for add-transaction-button
            if (widget.widgetId === 'add-transaction-button') {
              return (
                <div
                  key={widget.id}
                  className={`grid-block-wrapper widget-instance ${isDragging ? 'dragging' : ''} ${isEditMode ? 'edit-mode' : ''}`}
                  style={style}
                  onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
                  onContextMenu={(e) => handleWidgetRightClick(e, widget)}
                >
                  <AddTransactionButton onClick={openAddTransactionModal} />
                </div>
              )
            }

            // Render custom widget for upcoming-transactions
            if (widget.widgetId === 'upcoming-transactions') {
              return (
                <div
                  key={widget.id}
                  className={`grid-block-wrapper widget-instance ${isDragging ? 'dragging' : ''} ${isEditMode ? 'edit-mode' : ''}`}
                  style={style}
                  onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
                  onContextMenu={(e) => handleWidgetRightClick(e, widget)}
                >
                  <UpcomingTransactionsWidget isFeatured={false} />
                </div>
              )
            }

            // Render custom widget for savings-jar
            if (widget.widgetId === 'savings-jar') {
              return (
                <div
                  key={widget.id}
                  className={`grid-block-wrapper widget-instance ${isDragging ? 'dragging' : ''} ${isEditMode ? 'edit-mode' : ''}`}
                  style={style}
                  onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
                  onContextMenu={(e) => handleWidgetRightClick(e, widget)}
                >
                  <SavingsJarWidget />
                </div>
              )
            }

            // Default widget card
            return (
              <div
                key={widget.id}
                className={`grid-block-wrapper widget-instance ${isDragging ? 'dragging' : ''} ${isEditMode ? 'edit-mode' : ''}`}
                style={style}
                onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
                onContextMenu={(e) => handleWidgetRightClick(e, widget)}
              >
                <div className="grid-block-content">
                  <div className="block-info">
                    <i className={`fa-solid ${widgetDef.icon}`} style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--theme-primary)' }}></i>
                    <span className="block-label">{widgetDef.name}</span>
                    <span className="block-coords">
                      x:{widget.position.x} y:{widget.position.y} | {widget.size.width}×{widget.size.height}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Context menu for widgets */}
      {contextMenu && (
        <div
          className="widget-context-menu"
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => handleRemoveWidget(contextMenu.widgetId)}
          >
            Remove Widget
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(DashboardGrid)
