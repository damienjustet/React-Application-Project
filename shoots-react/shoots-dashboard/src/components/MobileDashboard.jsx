import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { getWidgetById, WIDGET_DISPLAY_TYPE } from '../data/widgetCatalog'
import BudgetProgressBarWidget from './BudgetProgressBarWidget'
import AddTransactionButton from './AddTransactionButton'
import UpcomingTransactionsWidget from './UpcomingTransactionsWidget'
import SavingsJarWidget from './SavingsJarWidget'
import MobileWidgetDrawer from './MobileWidgetDrawer'
import './MobileDashboard.css'

// Mobile grid dimensions
const MOBILE_GRID_COLS = 7
const MOBILE_GRID_ROWS = 5

// Optimized grid using typed array for better performance
const createGrid = () => new Uint8Array(MOBILE_GRID_ROWS * MOBILE_GRID_COLS)

// Convert desktop widget size to mobile-friendly size
// Scales widget to fit within mobile grid while preserving aspect ratio intent
const getMobileSize = (widget) => {
  const { width, height } = widget.size
  
  // Special handling for specific widget types
  if (widget.widgetId === 'budget-progress-bar') {
    // Progress bar: full width, 1 row
    return { width: MOBILE_GRID_COLS, height: 1 }
  }
  
  if (widget.widgetId === 'add-transaction-button') {
    // Add button: keep as 1x1
    return { width: 1, height: 1 }
  }
  
  if (widget.widgetId === 'upcoming-transactions') {
    // Upcoming transactions is now a featured widget - rendered separately
    return null
  }
  
  // For other widgets: clamp to grid bounds
  return {
    width: Math.min(width, MOBILE_GRID_COLS),
    height: Math.min(height, MOBILE_GRID_ROWS)
  }
}

// Check if widget can fit in the grid at position (x, y)
const canPlace = (grid, x, y, w, h) => {
  if (x + w > MOBILE_GRID_COLS || y + h > MOBILE_GRID_ROWS) return false
  for (let row = y; row < y + h; row++) {
    const baseIdx = row * MOBILE_GRID_COLS
    for (let col = x; col < x + w; col++) {
      if (grid[baseIdx + col]) return false
    }
  }
  return true
}

// Mark grid cells as occupied
const placeWidget = (grid, x, y, w, h) => {
  for (let row = y; row < y + h; row++) {
    const baseIdx = row * MOBILE_GRID_COLS
    for (let col = x; col < x + w; col++) {
      grid[baseIdx + col] = 1
    }
  }
}

// Find first available position for widget (top-left greedy)
const findPosition = (grid, w, h) => {
  for (let y = 0; y <= MOBILE_GRID_ROWS - h; y++) {
    for (let x = 0; x <= MOBILE_GRID_COLS - w; x++) {
      if (canPlace(grid, x, y, w, h)) {
        return { x, y }
      }
    }
  }
  return null
}

// Pack widgets into cards using bin-packing approach
// Each card is a 7x5 grid, widgets are placed at their position if valid, else auto-placed
const packWidgetsIntoCards = (widgets) => {
  if (widgets.length === 0) return []
  
  const cards = []
  let currentCardWidgets = []
  let grid = createGrid()
  const skippedWidgets = []

  // Sort widgets: those with valid mobile positions first, then others
  const sortedWidgets = [...widgets].sort((a, b) => {
    const aHasPos = a.position && a.position.x < MOBILE_GRID_COLS && a.position.y < MOBILE_GRID_ROWS
    const bHasPos = b.position && b.position.x < MOBILE_GRID_COLS && b.position.y < MOBILE_GRID_ROWS
    if (aHasPos && !bHasPos) return -1
    if (!aHasPos && bHasPos) return 1
    return 0
  })

  // First pass: try to place each widget
  for (const widget of sortedWidgets) {
    const mobileSize = getMobileSize(widget)
    
    // Skip null size widgets (featured)
    if (!mobileSize) continue
    
    // Check if widget can even fit in an empty grid
    if (mobileSize.width > MOBILE_GRID_COLS || mobileSize.height > MOBILE_GRID_ROWS) {
      skippedWidgets.push(widget)
      continue
    }
    
    // Check if widget has a valid position within mobile grid bounds
    let pos = null
    if (widget.position && 
        widget.position.x >= 0 && 
        widget.position.x + mobileSize.width <= MOBILE_GRID_COLS &&
        widget.position.y >= 0 && 
        widget.position.y + mobileSize.height <= MOBILE_GRID_ROWS) {
      // Try to use the widget's set position
      if (canPlace(grid, widget.position.x, widget.position.y, mobileSize.width, mobileSize.height)) {
        pos = { x: widget.position.x, y: widget.position.y }
      }
    }
    
    // If no valid position, find one automatically
    if (!pos) {
      pos = findPosition(grid, mobileSize.width, mobileSize.height)
    }
    
    if (pos) {
      // Widget fits in current card
      placeWidget(grid, pos.x, pos.y, mobileSize.width, mobileSize.height)
      currentCardWidgets.push({
        ...widget,
        mobilePosition: pos,
        mobileSize: mobileSize
      })
    } else {
      // Current card is full, start a new card
      if (currentCardWidgets.length > 0) {
        cards.push({ widgets: currentCardWidgets })
      }
      
      // Reset for new card
      currentCardWidgets = []
      grid = createGrid()
      
      // Try to place in new card (with position if valid)
      let newPos = null
      if (widget.position && 
          widget.position.x >= 0 && 
          widget.position.x + mobileSize.width <= MOBILE_GRID_COLS &&
          widget.position.y >= 0 && 
          widget.position.y + mobileSize.height <= MOBILE_GRID_ROWS) {
        if (canPlace(grid, widget.position.x, widget.position.y, mobileSize.width, mobileSize.height)) {
          newPos = { x: widget.position.x, y: widget.position.y }
        }
      }
      
      if (!newPos) {
        newPos = findPosition(grid, mobileSize.width, mobileSize.height)
      }
      
      if (newPos) {
        placeWidget(grid, newPos.x, newPos.y, mobileSize.width, mobileSize.height)
        currentCardWidgets.push({
          ...widget,
          mobilePosition: newPos,
          mobileSize: mobileSize
        })
      } else {
        // Widget can't fit even in empty card (shouldn't happen with clamping)
        skippedWidgets.push(widget)
      }
    }
  }

  // Don't forget the last card
  if (currentCardWidgets.length > 0) {
    cards.push({ widgets: currentCardWidgets })
  }

  // Log skipped widgets for debugging
  if (skippedWidgets.length > 0) {
    console.log('Skipped widgets (too large for mobile grid):', skippedWidgets)
  }

  return cards
}

// Cache for mobile layouts - keyed by widget configuration
const mobileLayoutCache = new Map()

// Generate a stable cache key from widgets (includes position for mobile repositioning)
const getLayoutCacheKey = (widgets) => {
  return widgets
    .map(w => `${w.id}:${w.widgetId}:${w.size.width}x${w.size.height}:${w.position?.x ?? '?'},${w.position?.y ?? '?'}`)
    .sort()
    .join('|')
}

function MobileDashboard({ isEditMode = false }) {
  const { widgets: dashboardWidgets, removeWidget, reorderWidgets, moveWidget } = useDashboard()
  const [currentCard, setCurrentCard] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [draggedWidgetId, setDraggedWidgetId] = useState(null)
  const [dragOverWidgetId, setDragOverWidgetId] = useState(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [dragSize, setDragSize] = useState({ width: 0, height: 0 })
  const [hoverCell, setHoverCell] = useState(null) // { x, y } grid cell being hovered
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const carouselRef = useRef(null)
  const gridRef = useRef(null) // Reference to the grid container
  const totalCardsRef = useRef(1)
  const longPressTimer = useRef(null)
  const widgetRefs = useRef({})
  const initialTouchPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const draggedWidgetData = useRef(null) // Store widget data during drag

  // Separate featured widgets from regular grid widgets
  const { gridWidgets, featuredWidgets } = useMemo(() => {
    const grid = []
    const featured = []
    
    dashboardWidgets.forEach(widget => {
      const widgetDef = getWidgetById(widget.widgetId)
      if (widgetDef?.displayType === WIDGET_DISPLAY_TYPE.FEATURED) {
        featured.push(widget)
      } else {
        grid.push(widget)
      }
    })
    
    return { gridWidgets: grid, featuredWidgets: featured }
  }, [dashboardWidgets])

  // Use grid widgets for card packing
  const widgets = gridWidgets

  // Create stable cache key based on widget content, not array reference
  const widgetKey = useMemo(() => getLayoutCacheKey(widgets), [widgets])

  // Memoize card packing - uses cache to avoid recalculation
  const { allCards, totalCards } = useMemo(() => {
    // Check cache first
    if (mobileLayoutCache.has(widgetKey)) {
      const cached = mobileLayoutCache.get(widgetKey)
      totalCardsRef.current = cached.totalCards
      return cached
    }
    
    // Calculate layout
    const cards = packWidgetsIntoCards(widgets)
    const total = cards.length || 1
    totalCardsRef.current = total
    
    const result = { allCards: cards, totalCards: total }
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (mobileLayoutCache.size > 50) {
      const firstKey = mobileLayoutCache.keys().next().value
      mobileLayoutCache.delete(firstKey)
    }
    mobileLayoutCache.set(widgetKey, result)
    
    return result
  }, [widgets, widgetKey])

  // Touch handlers - defined outside to use with passive listeners
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
      touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      const diff = touchStartX.current - touchEndX.current
      const threshold = 50

      if (diff > threshold) {
        setCurrentCard(prev => Math.min(prev + 1, totalCardsRef.current - 1))
      } else if (diff < -threshold) {
        setCurrentCard(prev => Math.max(prev - 1, 0))
      }
    }

    // Add event listeners with passive: true for better scroll performance
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true })
    carousel.addEventListener('touchmove', handleTouchMove, { passive: true })
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      carousel.removeEventListener('touchstart', handleTouchStart)
      carousel.removeEventListener('touchmove', handleTouchMove)
      carousel.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Handle widget removal
  const handleRemoveWidget = useCallback((e, widgetId) => {
    e.stopPropagation()
    removeWidget(widgetId)
  }, [removeWidget])

  // Calculate grid cell from touch coordinates
  const getGridCellFromPoint = useCallback((touchX, touchY) => {
    if (!gridRef.current) return null
    
    const rect = gridRef.current.getBoundingClientRect()
    const padding = 16 // Match CSS padding
    const gap = 8 // Match CSS gap
    
    // Calculate inner grid area
    const innerWidth = rect.width - (padding * 2)
    const innerHeight = rect.height - (padding * 2)
    
    // Calculate cell size including gaps
    const cellWidth = (innerWidth - (MOBILE_GRID_COLS - 1) * gap) / MOBILE_GRID_COLS
    const cellHeight = (innerHeight - (MOBILE_GRID_ROWS - 1) * gap) / MOBILE_GRID_ROWS
    
    // Get position relative to grid inner area
    const relX = touchX - rect.left - padding
    const relY = touchY - rect.top - padding
    
    // Calculate cell indices
    const cellX = Math.floor(relX / (cellWidth + gap))
    const cellY = Math.floor(relY / (cellHeight + gap))
    
    // Clamp to valid range
    const x = Math.max(0, Math.min(MOBILE_GRID_COLS - 1, cellX))
    const y = Math.max(0, Math.min(MOBILE_GRID_ROWS - 1, cellY))
    
    return { x, y }
  }, [])

  // Check if a position is valid for the widget (no collision, in bounds)
  const isValidPosition = useCallback((x, y, widgetId) => {
    const widget = gridWidgets.find(w => w.id === widgetId)
    if (!widget) return false
    
    const size = getMobileSize(widget)
    if (!size) return false
    
    // Check bounds
    if (x + size.width > MOBILE_GRID_COLS || y + size.height > MOBILE_GRID_ROWS) {
      return false
    }
    if (x < 0 || y < 0) return false
    
    // Check collision with other widgets
    for (const other of gridWidgets) {
      if (other.id === widgetId) continue
      const otherSize = getMobileSize(other)
      if (!otherSize) continue
      
      // Get other widget's current packed position
      const otherWidget = allCards[currentCard]?.widgets.find(w => w.id === other.id)
      if (!otherWidget) continue
      
      const ox = otherWidget.mobilePosition.x
      const oy = otherWidget.mobilePosition.y
      const ow = otherWidget.mobileSize.width
      const oh = otherWidget.mobileSize.height
      
      // Check overlap
      const noOverlap = x >= ox + ow || x + size.width <= ox || 
                        y >= oy + oh || y + size.height <= oy
      if (!noOverlap) return false
    }
    
    return true
  }, [gridWidgets, allCards, currentCard])

  // Find which widget is under a point
  const findWidgetAtPoint = useCallback((x, y) => {
    for (const [widgetId, ref] of Object.entries(widgetRefs.current)) {
      if (ref && widgetId !== draggedWidgetId) {
        const rect = ref.getBoundingClientRect()
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return widgetId
        }
      }
    }
    return null
  }, [draggedWidgetId])

  // Touch handlers for drag and drop
  const handleTouchStartWidget = useCallback((e, widgetId) => {
    if (!isEditMode) return
    
    const touch = e.touches[0]
    const widgetEl = widgetRefs.current[widgetId]
    if (!widgetEl) return

    const rect = widgetEl.getBoundingClientRect()
    
    // Store initial touch position to detect movement
    initialTouchPos.current = { x: touch.clientX, y: touch.clientY }
    hasMoved.current = false
    
    // Set up long press to initiate drag
    longPressTimer.current = setTimeout(() => {
      // Store widget size for the clone
      setDragSize({
        width: rect.width,
        height: rect.height
      })
      // Position at widget center following finger
      setDragPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
      setDraggedWidgetId(widgetId)
      console.log('🎯 Started dragging widget:', widgetId)
      // Vibrate for haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 150)
  }, [isEditMode])

  const handleTouchMoveWidget = useCallback((e) => {
    const touch = e.touches[0]
    
    // Check if moved significantly before drag starts
    if (longPressTimer.current && !draggedWidgetId) {
      const dx = Math.abs(touch.clientX - initialTouchPos.current.x)
      const dy = Math.abs(touch.clientY - initialTouchPos.current.y)
      
      // If moved more than 10px, cancel the long press (user is scrolling)
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
        return
      }
    }

    if (!draggedWidgetId) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Update drag position to follow finger
    setDragPosition({
      x: touch.clientX,
      y: touch.clientY
    })
    
    // Calculate which grid cell is being hovered
    const cell = getGridCellFromPoint(touch.clientX, touch.clientY)
    if (cell) {
      setHoverCell(cell)
      console.log('📍 Hovering over cell:', cell.x, cell.y)
    }
    
    // Also find widget under touch point for visual feedback
    const targetWidget = findWidgetAtPoint(touch.clientX, touch.clientY)
    setDragOverWidgetId(targetWidget)
  }, [draggedWidgetId, findWidgetAtPoint, getGridCellFromPoint])

  const handleTouchEndWidget = useCallback(() => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // If we were dragging and have a hover cell, try to move there
    if (draggedWidgetId && hoverCell) {
      console.log('🎯 Attempting to move to cell:', hoverCell.x, hoverCell.y)
      
      // Find the dragged widget's data
      const widget = gridWidgets.find(w => w.id === draggedWidgetId)
      if (widget) {
        const size = getMobileSize(widget)
        if (size) {
          // Clamp position so widget stays in bounds
          const targetX = Math.max(0, Math.min(MOBILE_GRID_COLS - size.width, hoverCell.x))
          const targetY = Math.max(0, Math.min(MOBILE_GRID_ROWS - size.height, hoverCell.y))
          
          console.log('🔄 Moving widget to:', targetX, targetY)
          moveWidget(draggedWidgetId, { x: targetX, y: targetY })
        }
      }
    } else if (draggedWidgetId && dragOverWidgetId && draggedWidgetId !== dragOverWidgetId) {
      // Fallback: swap with another widget
      console.log('🔄 Swapping with widget:', dragOverWidgetId)
      reorderWidgets(draggedWidgetId, dragOverWidgetId)
    } else {
      console.log('❌ No move:', { draggedWidgetId, hoverCell, dragOverWidgetId })
    }
    
    setDraggedWidgetId(null)
    setDragOverWidgetId(null)
    setDragPosition({ x: 0, y: 0 })
    setDragSize({ width: 0, height: 0 })
    setHoverCell(null)
  }, [draggedWidgetId, dragOverWidgetId, hoverCell, gridWidgets, moveWidget, reorderWidgets])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  // Render a widget - uses mobileSize and mobilePosition set by packer
  const renderWidget = useCallback((widget) => {
    const widgetDef = getWidgetById(widget.widgetId)
    const size = widget.mobileSize
    const pos = widget.mobilePosition

    const isDragged = draggedWidgetId === widget.id
    const isDragOver = dragOverWidgetId === widget.id
    
    // Base grid positioning style
    const style = {
      gridColumn: `${pos.x + 1} / span ${size.width}`,
      gridRow: `${pos.y + 1} / span ${size.height}`
    }
    
    const wrapperClass = `mobile-widget ${isEditMode ? 'edit-mode jiggle' : ''} ${isDragged ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`

    // Touch handlers for edit mode
    const touchProps = isEditMode ? {
      onTouchStart: (e) => handleTouchStartWidget(e, widget.id),
      onTouchMove: handleTouchMoveWidget,
      onTouchEnd: handleTouchEndWidget,
    } : {}

    // Store ref for hit testing
    const setWidgetRef = (el) => {
      widgetRefs.current[widget.id] = el
    }

    if (widget.widgetId === 'budget-progress-bar') {
      return (
        <div key={widget.id} ref={setWidgetRef} className={wrapperClass} style={style} {...touchProps}>
          {isEditMode && (
            <button className="widget-remove-btn" onClick={(e) => handleRemoveWidget(e, widget.id)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          <BudgetProgressBarWidget data={widget.data} />
        </div>
      )
    }

    if (widget.widgetId === 'add-transaction-button') {
      return (
        <div key={widget.id} ref={setWidgetRef} className={wrapperClass} style={style} {...touchProps}>
          {isEditMode && (
            <button className="widget-remove-btn" onClick={(e) => handleRemoveWidget(e, widget.id)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          <AddTransactionButton onClick={() => console.log('Add transaction clicked (mobile)')} />
        </div>
      )
    }

    if (widget.widgetId === 'upcoming-transactions') {
      // Should not reach here - featured widgets are rendered separately
      return null
    }

    if (widget.widgetId === 'savings-jar') {
      return (
        <div key={widget.id} ref={setWidgetRef} className={wrapperClass} style={style} {...touchProps}>
          {isEditMode && (
            <button className="widget-remove-btn" onClick={(e) => handleRemoveWidget(e, widget.id)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          <SavingsJarWidget />
        </div>
      )
    }

    return (
      <div key={widget.id} ref={setWidgetRef} className={wrapperClass} style={style} {...touchProps}>
        {isEditMode && (
          <button className="widget-remove-btn" onClick={(e) => handleRemoveWidget(e, widget.id)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
        <div className="mobile-widget-content">
          {widgetDef ? (
            <>
              <i className={`fa-solid ${widgetDef.icon}`}></i>
              <span className="widget-name">{widgetDef.name}</span>
            </>
          ) : (
            <span className="widget-name">Widget</span>
          )}
        </div>
      </div>
    )
  }, [isEditMode, handleRemoveWidget, draggedWidgetId, dragOverWidgetId, handleTouchStartWidget, handleTouchMoveWidget, handleTouchEndWidget])

  return (
    <div className="mobile-dashboard" data-edit-mode={isEditMode}>
      <div 
        className="mobile-carousel"
        ref={carouselRef}
      >
        <div 
          className="mobile-carousel-track"
          style={{
            transform: `translateX(-${currentCard * 100}%)`
          }}
        >
          {allCards.length > 0 ? (
            allCards.map((card, cardIndex) => (
              <div key={cardIndex} className="mobile-card">
                <div className="mobile-card-grid" ref={cardIndex === currentCard ? gridRef : null}>
                  {/* Hover cell indicator */}
                  {isEditMode && hoverCell && draggedWidgetId && cardIndex === currentCard && (
                    <div 
                      className="mobile-grid-hover-cell"
                      style={{
                        gridColumn: `${hoverCell.x + 1} / span 1`,
                        gridRow: `${hoverCell.y + 1} / span 1`
                      }}
                    />
                  )}
                  {card.widgets.map(widget => renderWidget(widget))}
                </div>
              </div>
            ))
          ) : (
            <div className="mobile-card">
              <div className="mobile-card-grid">
                <div className="mobile-empty-state">
                  <i className="fa-solid fa-grip"></i>
                  <p>Drag widgets here to get started</p>
                  <span className="mobile-empty-hint">Or use multi-select in the widget library →</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {totalCards > 1 && (
        <div className="mobile-card-indicator">
          <span>{currentCard + 1} / {totalCards}</span>
        </div>
      )}

      {/* Featured Widgets Section - Rendered below the grid */}
      {featuredWidgets.length > 0 && (
        <div className="mobile-featured-section">
          {featuredWidgets.map(widget => {
            const widgetElement = widget.widgetId === 'upcoming-transactions' 
              ? <UpcomingTransactionsWidget key={widget.id} isFeatured={true} />
              : null
            
            return widgetElement ? (
              <div key={widget.id} className="mobile-featured-widget-wrapper">
                {widgetElement}
                {isEditMode && (
                  <button 
                    className="widget-remove-btn featured-remove-btn"
                    onClick={(e) => handleRemoveWidget(e, widget.id)}
                    aria-label="Remove widget"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            ) : null
          })}
        </div>
      )}

      {/* Add Widget Button - Shows in edit mode */}
      {isEditMode && (
        <button 
          className="mobile-add-widget-btn"
          onClick={() => setIsDrawerOpen(true)}
        >
          <i className="fa-solid fa-plus"></i>
          <span>Add Widget</span>
        </button>
      )}

      {/* Widget Drawer */}
      <MobileWidgetDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Floating Widget Clone - follows finger during drag */}
      {draggedWidgetId && dragPosition.x > 0 && (
        <div 
          className="mobile-widget-drag-clone"
          style={{
            left: dragPosition.x - dragSize.width / 2,
            top: dragPosition.y - dragSize.height / 2,
            width: dragSize.width,
            height: dragSize.height,
          }}
        >
          {(() => {
            const widget = gridWidgets.find(w => w.id === draggedWidgetId)
            if (!widget) return null
            const widgetDef = getWidgetById(widget.widgetId)
            
            // Render the actual widget content
            if (widget.widgetId === 'budget-progress-bar') {
              return <BudgetProgressBarWidget data={widget.data} />
            }
            
            if (widget.widgetId === 'add-transaction-button') {
              return <AddTransactionButton onClick={() => {}} />
            }
            
            if (widget.widgetId === 'savings-jar') {
              return <SavingsJarWidget />
            }
            
            // Default widget content
            return (
              <div className="mobile-widget-content">
                {widgetDef ? (
                  <>
                    <i className={`fa-solid ${widgetDef.icon}`}></i>
                    <span className="widget-name">{widgetDef.name}</span>
                  </>
                ) : (
                  <span>Widget</span>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default memo(MobileDashboard)
