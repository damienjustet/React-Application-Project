import { useState, useRef, useEffect } from 'react'
import './ImageWidget.css'

/**
 * ImageWidget - A customizable image widget for the dashboard
 * 
 * Features:
 * - Click to upload custom image
 * - Resizable in edit mode with drag handles
 * - Web-only (hidden on mobile but counts for layout)
 * - Each instance stores its own image
 */
function ImageWidget({ 
  instanceId, 
  size = { width: 2, height: 2 }, 
  position = { x: 0, y: 0 },
  isEditMode = false,
  onResize,
  onResizeStart,
  onResizeEnd
}) {
  const [image, setImage] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState(null)
  const fileInputRef = useRef(null)
  const widgetRef = useRef(null)
  const startPositionRef = useRef(null)

  // Load image from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem(`image-widget-${instanceId}`)
    if (savedImage) {
      setImage(savedImage)
    }
  }, [instanceId])

  // Save image to localStorage when changed
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Image = event.target?.result
      if (base64Image) {
        setImage(base64Image)
        localStorage.setItem(`image-widget-${instanceId}`, base64Image)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleClick = () => {
    if (!isEditMode && !isResizing) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveImage = (e) => {
    e.stopPropagation()
    setImage(null)
    localStorage.removeItem(`image-widget-${instanceId}`)
  }

  // Resize handlers
  const handleResizeMouseDown = (e, direction) => {
    if (!isEditMode) return
    e.stopPropagation()
    e.preventDefault()
    
    setIsResizing(true)
    setResizeDirection(direction)
    
    // Store the starting position
    startPositionRef.current = { ...position }
    onResizeStart?.()

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height
    const startPosition = { ...position }

    const handleMouseMove = (moveEvent) => {
      const gridElement = document.querySelector('.dashboard-grid')
      if (!gridElement) return

      const rect = gridElement.getBoundingClientRect()
      const gridColumns = window.innerWidth >= 1200 ? 28 : window.innerWidth >= 768 ? 14 : 7
      const gridRows = 14
      const tileWidth = rect.width / gridColumns
      const tileHeight = rect.height / gridRows

      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight
      let newPosition = { ...startPosition }

      if (direction.includes('right')) {
        newWidth = Math.max(2, Math.round(startWidth + deltaX / tileWidth))
      }
      if (direction.includes('left')) {
        const widthChange = Math.round(deltaX / tileWidth)
        newWidth = Math.max(2, startWidth - widthChange)
        // Position shifts based on how much size changed from start
        newPosition.x = Math.max(0, startPosition.x + (startWidth - newWidth))
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(2, Math.round(startHeight + deltaY / tileHeight))
      }
      if (direction.includes('top')) {
        const heightChange = Math.round(deltaY / tileHeight)
        newHeight = Math.max(2, startHeight - heightChange)
        // Position shifts based on how much size changed from start
        newPosition.y = Math.max(0, startPosition.y + (startHeight - newHeight))
      }

      onResize?.({ width: newWidth, height: newHeight }, direction, newPosition)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeDirection(null)
      onResizeEnd?.()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div 
      ref={widgetRef}
      className={`image-widget ${isEditMode ? 'edit-mode' : ''} ${isResizing ? 'resizing' : ''}`}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {image ? (
        <div className="image-container">
          <img src={image} alt="Custom widget" className="widget-image" />
        </div>
      ) : (
        <div className="upload-placeholder">
          <i className="fa-solid fa-image"></i>
          <span>Click to upload</span>
        </div>
      )}

      {/* Resize handles - only show in edit mode */}
      {isEditMode && (
        <>
          <div 
            className="resize-handle resize-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
          />
          <div 
            className="resize-handle resize-bottom"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
          />
          <div 
            className="resize-handle resize-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
          />
          <div 
            className="resize-handle resize-top"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
          />
        </>
      )}
    </div>
  )
}

export default ImageWidget
