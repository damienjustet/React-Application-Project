import { useState, useEffect } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { getWidgetById } from '../data/widgetCatalog'
import './DashboardGrid.css'

const GRID_ROWS = 14 // Keep rows constant

function DashboardGrid() {
  const { widgets: dashboardWidgets, addWidget, removeWidget } = useDashboard()
  
  // Determine grid columns based on window width
  const getGridColumns = () => {
    const width = window.innerWidth
    if (width >= 1200) return 28
    if (width >= 768) return 14
    return 7
  }

  const [gridColumns, setGridColumns] = useState(getGridColumns())

  // State to track block positions (stores original 28-column positions)
  const [blocks, setBlocks] = useState([
    { id: 1, x: 0, y: 0, w: 8, h: 3, label: '8×3 Block', originalX: 0, originalY: 0, originalW: 8, originalH: 3 },
    { id: 2, x: 8, y: 0, w: 4, h: 5, label: '4×5 Block', originalX: 8, originalY: 0, originalW: 4, originalH: 5 },
    { id: 3, x: 12, y: 0, w: 6, h: 4, label: '6×4 Block', originalX: 12, originalY: 0, originalW: 6, originalH: 4 },
    { id: 4, x: 0, y: 3, w: 5, h: 6, label: '5×6 Block', originalX: 0, originalY: 3, originalW: 5, originalH: 6 },
    { id: 5, x: 18, y: 0, w: 7, h: 3, label: '7×3 Block', originalX: 18, originalY: 0, originalW: 7, originalH: 3 },
  ])

  const [draggedBlock, setDraggedBlock] = useState(null)
  const [dragPosition, setDragPosition] = useState(null) // Free-form pixel position during drag
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [originalPosition, setOriginalPosition] = useState(null) // Store original position before drag
  
  // Widget library drag state
  const [isWidgetDragging, setIsWidgetDragging] = useState(false)
  const [widgetDropZone, setWidgetDropZone] = useState(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newColumns = getGridColumns()
      if (newColumns !== gridColumns) {
        setGridColumns(newColumns)
        
        if (newColumns === 28) {
          // Restore original positions when back to full size
          setBlocks(prevBlocks =>
            prevBlocks.map(block => ({
              ...block,
              x: block.originalX,
              y: block.originalY,
              w: block.originalW,
              h: block.originalH
            }))
          )
        } else {
          // Reflow widgets for smaller grid
          reflowWidgets(newColumns)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gridColumns])

  // Reflow widgets to fit smaller grid
  const reflowWidgets = (columns) => {
    const reflowed = []
    let currentY = 0

    blocks.forEach(block => {
      // Scale widget width proportionally
      const scaledW = Math.min(
        Math.ceil((block.originalW / 28) * columns),
        columns
      )
      const scaledH = block.originalH // Keep height the same

      // Find next available position
      let placed = false
      let testY = currentY

      while (!placed && testY < GRID_ROWS + 10) {
        for (let testX = 0; testX <= columns - scaledW; testX++) {
          // Check if this position is free
          const hasCollision = reflowed.some(other => {
            const noOverlap = 
              testX >= other.x + other.w ||
              testX + scaledW <= other.x ||
              testY >= other.y + other.h ||
              testY + scaledH <= other.y
            return !noOverlap
          })

          if (!hasCollision) {
            reflowed.push({
              ...block,
              x: testX,
              y: testY,
              w: scaledW,
              h: scaledH
            })
            placed = true
            break
          }
        }
        testY++
      }

      // Update currentY for next widget
      const lastBlock = reflowed[reflowed.length - 1]
      if (lastBlock) {
        currentY = Math.max(currentY, lastBlock.y)
      }
    })

    setBlocks(reflowed)
  }

  // Check if a widget overlaps with any existing widgets (excluding itself)
  const checkCollision = (x, y, w, h, excludeId) => {
    return blocks.some(block => {
      if (block.id === excludeId) return false
      
      // Check if rectangles overlap
      const noOverlap = 
        x >= block.x + block.w || // Target is to the right
        x + w <= block.x ||       // Target is to the left
        y >= block.y + block.h || // Target is below
        y + h <= block.y          // Target is above
      
      return !noOverlap
    })
  }

  const getPixelPosition = (clientX, clientY, gridElement) => {
    const rect = gridElement.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const handleMouseDown = (e, block) => {
    e.preventDefault()
    const gridElement = e.currentTarget.closest('.dashboard-grid')
    const rect = gridElement.getBoundingClientRect()
    const tileWidth = rect.width / gridColumns
    const tileHeight = rect.height / GRID_ROWS
    
    // Calculate the wrapper's position (full tile space)
    const wrapperLeft = block.x * tileWidth
    const wrapperTop = block.y * tileHeight
    
    // Calculate offset from the wrapper's top-left
    const offsetX = e.clientX - rect.left - wrapperLeft
    const offsetY = e.clientY - rect.top - wrapperTop
    
    setDraggedBlock(block)
    setOriginalPosition({ x: block.x, y: block.y }) // Store original position
    setDragOffset({ x: offsetX, y: offsetY })
    setDragPosition({ x: wrapperLeft, y: wrapperTop })
  }

  const handleMouseMove = (e) => {
    if (!draggedBlock) return
    
    const gridElement = document.querySelector('.dashboard-grid')
    if (!gridElement) return
    
    const rect = gridElement.getBoundingClientRect()
    const pixelPos = getPixelPosition(e.clientX, e.clientY, gridElement)
    
    // Free-form movement during drag
    setDragPosition({
      x: pixelPos.x - dragOffset.x,
      y: pixelPos.y - dragOffset.y
    })
  }

  const handleMouseUp = (e) => {
    if (!draggedBlock) return
    
    const gridElement = document.querySelector('.dashboard-grid')
    if (!gridElement) return
    
    const rect = gridElement.getBoundingClientRect()
    const tileWidth = rect.width / gridColumns
    const tileHeight = rect.height / GRID_ROWS
    
    // Snap to nearest tile on drop
    const centerX = dragPosition.x + (draggedBlock.w * tileWidth) / 2
    const centerY = dragPosition.y + (draggedBlock.h * tileHeight) / 2
    
    const snappedX = Math.round(centerX / tileWidth - draggedBlock.w / 2)
    const snappedY = Math.round(centerY / tileHeight - draggedBlock.h / 2)
    
    // Ensure within bounds
    const finalX = Math.max(0, Math.min(gridColumns - draggedBlock.w, snappedX))
    const finalY = Math.max(0, Math.min(GRID_ROWS - draggedBlock.h, snappedY))
    
    // Check for collision at target position
    const hasCollision = checkCollision(finalX, finalY, draggedBlock.w, draggedBlock.h, draggedBlock.id)
    
    if (hasCollision) {
      // Collision detected - snap back to original position
      setBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.id === draggedBlock.id
            ? { ...block, x: originalPosition.x, y: originalPosition.y }
            : block
        )
      )
    } else {
      // No collision - place at new position
      setBlocks(prevBlocks =>
        prevBlocks.map(block => {
          if (block.id === draggedBlock.id) {
            // Update current position and save to original if on 28-column grid
            const updatedBlock = { ...block, x: finalX, y: finalY }
            if (gridColumns === 28) {
              updatedBlock.originalX = finalX
              updatedBlock.originalY = finalY
            }
            return updatedBlock
          }
          return block
        })
      )
    }
    
    setDraggedBlock(null)
    setDragPosition(null)
    setDragOffset({ x: 0, y: 0 })
    setOriginalPosition(null)
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
    
    // Use generic size for preview (will be replaced on actual drop)
    setWidgetDropZone({ x: gridX, y: gridY, size: { width: 6, height: 4 } })
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
      
      // Add widget at this position
      addWidget(widgetData.widgetId, { x: gridX, y: gridY })
    } catch (err) {
      console.error('Failed to drop widget:', err)
    }
  }

  // Show empty state if no widgets
  const showEmptyState = dashboardWidgets.length === 0

  return (
    <div 
      className="dashboard-content"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
                backgroundColor: 'rgba(78, 205, 196, 0.2)',
                border: '2px dashed #4ecdc4',
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
          
          {/* Render draggable blocks */}
          {blocks.map(block => {
            const isDragging = draggedBlock?.id === block.id
            
            return (
              <div
                key={block.id}
                className={`grid-block-wrapper ${isDragging ? 'dragging' : ''}`}
                style={
                  isDragging && dragPosition
                    ? {
                        position: 'absolute',
                        left: `${dragPosition.x}px`,
                        top: `${dragPosition.y}px`,
                        width: `calc((100% / ${gridColumns}) * ${block.w})`,
                        height: `calc((100% / ${GRID_ROWS}) * ${block.h})`,
                        gridColumn: 'unset',
                        gridRow: 'unset'
                      }
                    : {
                        gridColumn: `${block.x + 1} / span ${block.w}`,
                        gridRow: `${block.y + 1} / span ${block.h}`
                      }
                }
                onMouseDown={(e) => handleMouseDown(e, block)}
              >
                <div className="grid-block-content">
                  <div className="block-info">
                    <span className="block-label">{block.label}</span>
                    <span className="block-coords">
                      x:{block.x} y:{block.y} | {block.w}×{block.h}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Render dashboard widgets from widget library */}
          {dashboardWidgets.map(widget => {
            const widgetDef = getWidgetById(widget.widgetId)
            if (!widgetDef) return null
            
            return (
              <div
                key={widget.id}
                className="grid-block-wrapper widget-instance"
                style={{
                  gridColumn: `${widget.position.x + 1} / span ${widget.size.width}`,
                  gridRow: `${widget.position.y + 1} / span ${widget.size.height}`
                }}
              >
                <div className="grid-block-content" style={{ borderColor: widgetDef.color }}>
                  <button 
                    className="widget-remove-btn"
                    onClick={() => removeWidget(widget.id)}
                    title="Remove widget"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                  <div className="block-info">
                    <i className={`fa-solid ${widgetDef.icon}`} style={{ fontSize: '2rem', color: widgetDef.color, marginBottom: '0.5rem' }}></i>
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
    </div>
  )
}

export default DashboardGrid
