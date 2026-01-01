import { createContext, useContext, useState, useCallback } from 'react'
import { getWidgetById } from '../data/widgetCatalog'

const DashboardContext = createContext(null)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}

export const DashboardProvider = ({ children }) => {
  // Default dashboard layout - empty initially to show empty state
  const [widgets, setWidgets] = useState([])
  
  // Undo/Redo history
  const [history, setHistory] = useState([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Update widgets and add to history
  const updateWithHistory = useCallback((newWidgets) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newWidgets)
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setWidgets(newWidgets)
  }, [history, historyIndex])

  // Add widget to dashboard
  const addWidget = useCallback((widgetId, position = null) => {
    const widgetDef = getWidgetById(widgetId)
    if (!widgetDef) return

    const newWidget = {
      id: `${widgetId}-${Date.now()}`, // Unique instance ID
      widgetId,
      position: position || findEmptySpot(widgets, widgetDef.defaultSize),
      size: widgetDef.defaultSize
    }

    updateWithHistory([...widgets, newWidget])
  }, [widgets, updateWithHistory])

  // Add multiple widgets at once (for multi-select)
  const addMultipleWidgets = useCallback((widgetIds) => {
    const newWidgets = [...widgets]
    
    for (const widgetId of widgetIds) {
      const widgetDef = getWidgetById(widgetId)
      if (!widgetDef) continue

      const position = findEmptySpot(newWidgets, widgetDef.defaultSize)
      if (!position) {
        // Return error if can't fit
        return { success: false, message: `Not enough space to add all widgets` }
      }

      newWidgets.push({
        id: `${widgetId}-${Date.now()}-${newWidgets.length}`,
        widgetId,
        position,
        size: widgetDef.defaultSize
      })
    }

    updateWithHistory(newWidgets)
    return { success: true }
  }, [widgets, updateWithHistory])

  // Remove widget
  const removeWidget = useCallback((widgetInstanceId) => {
    updateWithHistory(widgets.filter(w => w.id !== widgetInstanceId))
  }, [widgets, updateWithHistory])

  // Move widget to new position
  const moveWidget = useCallback((widgetInstanceId, newPosition) => {
    updateWithHistory(
      widgets.map(w =>
        w.id === widgetInstanceId ? { ...w, position: newPosition } : w
      )
    )
  }, [widgets, updateWithHistory])

  // Resize widget
  const resizeWidget = useCallback((widgetInstanceId, newSize) => {
    updateWithHistory(
      widgets.map(w =>
        w.id === widgetInstanceId ? { ...w, size: newSize } : w
      )
    )
  }, [widgets, updateWithHistory])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setWidgets(history[newIndex])
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setWidgets(history[newIndex])
    }
  }, [history, historyIndex])

  // Reset to default
  const resetDashboard = useCallback(() => {
    updateWithHistory([])
  }, [updateWithHistory])

  const value = {
    widgets,
    addWidget,
    addMultipleWidgets,
    removeWidget,
    moveWidget,
    resizeWidget,
    undo,
    redo,
    resetDashboard,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

// Helper: Find first available spot for a widget
function findEmptySpot(existingWidgets, size) {
  const GRID_COLS = 28
  const GRID_ROWS = 14
  
  // Create occupancy map
  const occupancy = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false))
  
  // Mark occupied cells
  existingWidgets.forEach(widget => {
    const { x, y } = widget.position
    const { width, height } = widget.size
    
    for (let row = y; row < Math.min(y + height, GRID_ROWS); row++) {
      for (let col = x; col < Math.min(x + width, GRID_COLS); col++) {
        occupancy[row][col] = true
      }
    }
  })
  
  // Find first spot that fits
  for (let row = 0; row <= GRID_ROWS - size.height; row++) {
    for (let col = 0; col <= GRID_COLS - size.width; col++) {
      let fits = true
      
      for (let r = row; r < row + size.height; r++) {
        for (let c = col; c < col + size.width; c++) {
          if (occupancy[r][c]) {
            fits = false
            break
          }
        }
        if (!fits) break
      }
      
      if (fits) {
        return { x: col, y: row }
      }
    }
  }
  
  // No space found - return null
  return null
}
