import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/DataContext'
import './SavingsJarWidget.css'

// Constants matching home.html implementation - scaled for 3x4 widget
const JAR_HEIGHT_DESKTOP = 108 // Base jar usable height in pixels (scaled from 143px)
const JAR_HEIGHT_MOBILE = 94 // Scaled down for mobile
const OVERLAP_DESKTOP = 6 // Overlap between sections in pixels (scaled from 8px)
const OVERLAP_MOBILE = 4 // Scaled for mobile
const MIN_HEIGHT_DESKTOP = 8 // Minimum height for each section (scaled from 10px)
const MIN_HEIGHT_MOBILE = 6 // Scaled for mobile
const BASE_COLOR = { h: 46, s: 88, l: 62 } // Base HSL color for jar fill

function SavingsJarWidget() {
  const { savingsGoals } = useData()
  const [currentGoalIndex, setCurrentGoalIndex] = useState(-1) // -1 = all savings combined
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Get responsive constants
  const JAR_HEIGHT = isMobile ? JAR_HEIGHT_MOBILE : JAR_HEIGHT_DESKTOP
  const OVERLAP = isMobile ? OVERLAP_MOBILE : OVERLAP_DESKTOP
  const MIN_HEIGHT = isMobile ? MIN_HEIGHT_MOBILE : MIN_HEIGHT_DESKTOP

  // Calculate total savings across all goals
  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, goal) => sum + goal.current, 0)
  }, [savingsGoals])

  const totalTarget = useMemo(() => {
    return savingsGoals.reduce((sum, goal) => sum + goal.target, 0)
  }, [savingsGoals])

  // Get current display data based on selected goal
  const displayData = useMemo(() => {
    if (currentGoalIndex === -1) {
      // All Savings: show each goal as a separate section (source)
      const goalSources = savingsGoals
        .filter(goal => goal.current > 0)
        .map(goal => ({
          name: goal.name,
          value: goal.current
        }))
      
      return {
        name: 'All Savings',
        current: totalSavings,
        target: totalTarget,
        progress: totalTarget > 0 ? Math.min((totalSavings / totalTarget) * 100, 100) : 0,
        sources: goalSources.length > 0 ? goalSources : [{ name: 'Total', value: totalSavings }],
        isAllView: true // Flag to use different color scheme
      }
    } else {
      const goal = savingsGoals[currentGoalIndex]
      if (!goal) return { name: 'No Goal', current: 0, target: 0, progress: 0, sources: [], isAllView: false }
      return {
        name: goal.name,
        current: goal.current,
        target: goal.target,
        progress: goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0,
        sources: [{ name: goal.name, value: goal.current }], // Single source for now
        isAllView: false
      }
    }
  }, [currentGoalIndex, savingsGoals, totalSavings, totalTarget])

  // Handle switching between goals
  const handleSwitch = () => {
    if (currentGoalIndex === savingsGoals.length - 1) {
      setCurrentGoalIndex(-1)
    } else {
      setCurrentGoalIndex(currentGoalIndex + 1)
    }
  }

  // Calculate jar sections based on sources (matching home.html logic)
  const jarSections = useMemo(() => {
    const sources = displayData.sources || []
    const goal = displayData.target || displayData.current || 0
    
    if (sources.length === 0) return []
    
    // Effective visible fill ratio (cap at 1)
    const fillRatio = goal > 0 ? Math.min(displayData.current / goal, 1) : 1
    const effectiveFillPx = JAR_HEIGHT * fillRatio
    
    // Calculate target stack sum accounting for overlap
    const n = sources.length
    const targetStackSum = effectiveFillPx + OVERLAP * (n - 1)
    
    // Sort sources descending by value for nicer layering
    const sorted = [...sources].sort((a, b) => b.value - a.value)
    const values = sorted.map(s => s.value)
    const valueTotal = values.reduce((a, b) => a + b, 0) || 1
    
    // Distribute heights with MIN_HEIGHT constraint
    const heights = distributeHeights(values, targetStackSum, MIN_HEIGHT)
    
    // Create sections with colors and positioning
    let cumulative = 0
    return sorted.map((src, i) => {
      const hPx = heights[i]
      const bottom = cumulative - OVERLAP * i
      
      // Different color logic for All Savings view (lighter shades)
      let lightness
      if (displayData.isAllView) {
        // For All Savings: start at base and go lighter, cap at 78 to avoid too bright
        lightness = Math.min(78, BASE_COLOR.l + i * 8)
      } else {
        // For individual goals: original logic
        lightness = Math.max(35, Math.min(85, BASE_COLOR.l + i * 6))
      }
      const color = `hsl(${BASE_COLOR.h}, ${BASE_COLOR.s}%, ${lightness}%)`
      
      cumulative += hPx
      
      return {
        key: `${src.name}-${i}`,
        height: hPx,
        bottom: bottom,
        color: color,
        isBottom: i === 0,
        source: src
      }
    })
  }, [displayData])

  // Height distribution function (matching home.html logic)
  function distributeHeights(values, target, minH) {
    const len = values.length
    const heights = new Array(len).fill(0)
    let remainingIdx = [...values.keys()]
    let remainingTarget = target
    let remainingValue = values.reduce((a, b) => a + b, 0)
    
    let changed = true
    while (changed) {
      changed = false
      for (let i = 0; i < remainingIdx.length; i++) {
        const idx = remainingIdx[i]
        const proportion = remainingValue > 0 ? values[idx] / remainingValue : 0
        const h = proportion * remainingTarget
        if (h < minH) {
          heights[idx] = minH
          remainingTarget -= minH
          remainingValue -= values[idx]
          remainingIdx.splice(i, 1)
          i--
          changed = true
        }
      }
      if (!changed) {
        remainingIdx.forEach(idx => {
          const proportion = remainingValue > 0 ? values[idx] / remainingValue : 0
          heights[idx] = proportion * remainingTarget
        })
      }
    }
    
    // Rounding adjustments
    const rounded = heights.map(h => Math.max(minH, h))
    const fractional = rounded.map((h, i) => ({ i, raw: h, frac: h - Math.floor(h) }))
    
    let sumFloors = fractional.reduce((s, o) => s + Math.floor(o.raw), 0)
    let needed = Math.round(target) - sumFloors
    
    if (needed > 0) {
      fractional.sort((a, b) => b.frac - a.frac)
      for (let k = 0; k < fractional.length && needed > 0; k++) {
        fractional[k].raw = Math.floor(fractional[k].raw) + 1
        needed--
      }
    } else if (needed < 0) {
      fractional.sort((a, b) => a.frac - b.frac)
      for (let k = 0; k < fractional.length && needed < 0; k++) {
        const current = Math.floor(fractional[k].raw)
        if (current > minH) {
          fractional[k].raw = current - 1
          needed++
        }
      }
    }
    
    const finalHeights = new Array(len).fill(minH)
    fractional.forEach(o => {
      finalHeights[o.i] = Math.max(minH, Math.round(o.raw))
    })
    return finalHeights
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="savings-jar-widget">
      <div className="jar-container">
        <div className="jar-wrapper">
          <div className="jar-bg">
            <div className="jar-lid"></div>
            <div className="jar-neck"></div>
            <div className="jar-body" id="jarBody">
              {jarSections.map(section => (
                <div
                  key={section.key}
                  className={`jar-section${section.isBottom ? ' bottom' : ''}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: `${section.height}px`,
                    bottom: `${section.bottom}px`,
                    background: section.color
                  }}
                  title={`${section.source.name}: ${formatCurrency(section.source.value)}`}
                />
              ))}
            </div>
            <button className="jar-switch-btn" onClick={handleSwitch}>
              <i className="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="savings-info">
        <span className="savings-label">{displayData.name}</span>
        <span className="savings-amount">{formatCurrency(displayData.current)}</span>
      </div>
    </div>
  )
}

export default SavingsJarWidget
