import { useState } from 'react'
import './DashboardGrid.css'

function DashboardGrid() {
  // State to track block positions
  const [blocks, setBlocks] = useState([
    { id: 1, x: 0, y: 0, w: 6, h: 4, label: '6×4 Block' },
    { id: 2, x: 6, y: 0, w: 6, h: 4, label: '6×4 Block' },
    { id: 3, x: 12, y: 0, w: 6, h: 4, label: '6×4 Block' },
  ])

  const [draggedBlock, setDraggedBlock] = useState(null)
  const [dragPosition, setDragPosition] = useState(null) // Free-form pixel position during drag
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

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
    const tileWidth = rect.width / 28
    const tileHeight = rect.height / 14
    
    // Calculate the wrapper's position (full tile space)
    const wrapperLeft = block.x * tileWidth
    const wrapperTop = block.y * tileHeight
    
    // Calculate offset from the wrapper's top-left
    const offsetX = e.clientX - rect.left - wrapperLeft
    const offsetY = e.clientY - rect.top - wrapperTop
    
    setDraggedBlock(block)
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
    const tileWidth = rect.width / 28
    const tileHeight = rect.height / 14
    
    // Snap to nearest tile on drop
    const centerX = dragPosition.x + (draggedBlock.w * tileWidth) / 2
    const centerY = dragPosition.y + (draggedBlock.h * tileHeight) / 2
    
    const snappedX = Math.round(centerX / tileWidth - draggedBlock.w / 2)
    const snappedY = Math.round(centerY / tileHeight - draggedBlock.h / 2)
    
    // Ensure within bounds
    const finalX = Math.max(0, Math.min(28 - draggedBlock.w, snappedX))
    const finalY = Math.max(0, Math.min(14 - draggedBlock.h, snappedY))
    
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === draggedBlock.id
          ? { ...block, x: finalX, y: finalY }
          : block
      )
    )
    
    setDraggedBlock(null)
    setDragPosition(null)
    setDragOffset({ x: 0, y: 0 })
  }

  return (
    <div 
      className="dashboard-content"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="dashboard-grid-container">
        <div className="dashboard-grid">
          {/* Render grid tiles as background */}
          {Array.from({ length: 28 * 14 }).map((_, index) => (
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
                        width: `calc((100% / 28) * ${block.w})`,
                        height: `calc((100% / 14) * ${block.h})`,
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
