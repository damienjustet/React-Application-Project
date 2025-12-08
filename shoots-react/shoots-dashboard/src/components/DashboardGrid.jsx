import { useState, useEffect } from 'react'
import './DashboardGrid.css'

function DashboardGrid() {
  // Determine grid columns based on window width
  const getGridColumns = () => {
    const width = window.innerWidth
    if (width >= 1200) return 28
    if (width >= 768) return 14
    return 7
  }

  const [gridColumns, setGridColumns] = useState(getGridColumns())
  const gridRows = 14 // Keep rows constant

  // State to track block positions (stores original 28-column positions)
  const [blocks, setBlocks] = useState([
    { id: 1, x: 0, y: 0, w: 6, h: 4, label: '6×4 Block', originalX: 0, originalY: 0, originalW: 6, originalH: 4 },
    { id: 2, x: 6, y: 0, w: 6, h: 4, label: '6×4 Block', originalX: 6, originalY: 0, originalW: 6, originalH: 4 },
    { id: 3, x: 12, y: 0, w: 6, h: 4, label: '6×4 Block', originalX: 12, originalY: 0, originalW: 6, originalH: 4 },
  ])

  const [draggedBlock, setDraggedBlock] = useState(null)
  const [dragPosition, setDragPosition] = useState(null) // Free-form pixel position during drag
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [originalPosition, setOriginalPosition] = useState(null) // Store original position before drag

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

      while (!placed && testY < gridRows + 10) {
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
    const tileHeight = rect.height / gridRows
    
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
    const tileHeight = rect.height / gridRows
    
    // Snap to nearest tile on drop
    const centerX = dragPosition.x + (draggedBlock.w * tileWidth) / 2
    const centerY = dragPosition.y + (draggedBlock.h * tileHeight) / 2
    
    const snappedX = Math.round(centerX / tileWidth - draggedBlock.w / 2)
    const snappedY = Math.round(centerY / tileHeight - draggedBlock.h / 2)
    
    // Ensure within bounds
    const finalX = Math.max(0, Math.min(gridColumns - draggedBlock.w, snappedX))
    const finalY = Math.max(0, Math.min(gridRows - draggedBlock.h, snappedY))
    
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

  return (
    <div 
      className="dashboard-content"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="dashboard-grid-container">
        <div className="dashboard-grid" style={{
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`
        }}>
          {/* Render grid tiles as background */}
          {Array.from({ length: gridColumns * gridRows }).map((_, index) => (
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
                        height: `calc((100% / ${gridRows}) * ${block.h})`,
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
        </div>
      </div>
    </div>
  )
}

export default DashboardGrid
