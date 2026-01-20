import { useState, useMemo, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import './IncomeVsSpendingChart.css'
import { getLastNMonths, matchesMonthYear, getCurrentDate } from '../utils/dateUtils'

// Constants
const CHART_COLORS = {
  grid: '#ACACAC',
  text: '#e8e8e8',
  label: '#83827d',
  monthHighlight: '#2c2c2c',
  income: '#F4C95D',        // Income - gold/yellow (restored)
  discretionary: '#FFDC84', // Discretionary spending - soft yellow
  bills: '#FFEBB8'          // Bills/fixed costs - pale yellow
}

const TIME_PERIODS = ['Week', 'Month', 'Quarter', 'Year']

const CHART_CONFIG = {
  barMaxSize: 23,
  gridStrokeWidth: 3,
  fontSize: {
    month: 14,
    yAxis: 12,
    tooltipTitle: 12,
    tooltipText: 11
  },
  monthHighlight: {
    padding: 8,
    offsetY: 8,
    borderRadius: 6
  }
}

const TOOLTIP_STYLES = {
  container: { background: '#2a2a2a', border: '1px solid #3a3a3a', padding: '8px', borderRadius: '4px' },
  title: { color: CHART_COLORS.text, margin: 0, marginBottom: '6px', fontWeight: '600', fontSize: `${CHART_CONFIG.fontSize.tooltipTitle}px` },
  label: { color: CHART_COLORS.text, margin: 0, marginBottom: '2px', fontSize: `${CHART_CONFIG.fontSize.tooltipText}px` },
  value: { color: CHART_COLORS.text, margin: 0, marginBottom: '6px', fontSize: `${CHART_CONFIG.fontSize.tooltipText}px`, fontFamily: "'Moulpali', sans-serif" },
  valueLast: { color: CHART_COLORS.text, margin: 0, fontSize: `${CHART_CONFIG.fontSize.tooltipText}px`, fontFamily: "'Moulpali', sans-serif" }
}

// Helper function
const formatCurrency = (value) => `$${(value / 1000).toFixed(1)}k`

// Custom component that renders both spending segments as one bar with rounded top
const CombinedSpendingBar = (props) => {
  const { x, y, width, height, payload } = props
  
  const bills = payload.bills || 0
  const discretionary = payload.discretionary || 0
  const total = bills + discretionary
  
  if (!total || !height || height <= 0) return null
  
  const radius = 10
  const effectiveRadius = Math.min(radius, height / 2, width / 2)
  
  // Calculate proportional heights
  const billsHeight = (bills / total) * height
  const discretionaryHeight = (discretionary / total) * height
  
  // Unique clip path ID for this bar
  const clipId = `spending-clip-${payload.month}`
  
  return (
    <g>
      {/* Define a clip path with rounded top corners */}
      <defs>
        <clipPath id={clipId}>
          <path
            d={`
              M${x},${y + effectiveRadius}
              A${effectiveRadius},${effectiveRadius} 0 0 1 ${x + effectiveRadius},${y}
              L${x + width - effectiveRadius},${y}
              A${effectiveRadius},${effectiveRadius} 0 0 1 ${x + width},${y + effectiveRadius}
              L${x + width},${y + height}
              L${x},${y + height}
              Z
            `}
          />
        </clipPath>
      </defs>
      
      {/* Render both segments clipped by the rounded shape */}
      <g clipPath={`url(#${clipId})`}>
        {/* Bills on top (pale yellow) */}
        <rect
          x={x}
          y={y}
          width={width}
          height={billsHeight}
          fill={CHART_COLORS.bills}
        />
        {/* Discretionary on bottom (soft yellow) */}
        <rect
          x={x}
          y={y + billsHeight}
          width={width}
          height={discretionaryHeight}
          fill={CHART_COLORS.discretionary}
        />
      </g>
    </g>
  )
}

function IncomeVsSpendingChart({ 
  transactions = [], 
  selectedMonth, 
  selectedYear, 
  selectedQuarter,
  selectedPeriodYear,
  timePeriod = 'monthly', 
  onMonthSelect,
  onQuarterSelect,
  onYearSelect
}) {
  // Start at index 6 for monthly view so current month is visible (months 6-11 include current month)
  const [startIndex, setStartIndex] = useState(6)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [selectedPeriod, setSelectedPeriod] = useState('Month')
  const scrollContainerRef = useRef(null)
  const monthsToShow = 6

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Generate dynamic months: 6 months before current to 5 months after (total 12 months, showing in 2 intervals of 6)
  const monthsData = useMemo(() => getLastNMonths(12), [])

  // Memoize month data calculations to prevent recalculating on every render
  const allMonthsData = useMemo(() => {
    const isBillTransaction = (transaction) => transaction.category === 'Bills and Utilities'
    
    const calculateMonthData = (monthInfo) => {
      const { month, year, label, shortLabel } = monthInfo
      
      const income = transactions
        .filter(t => t.type === 'income' && matchesMonthYear(t.date, month, year))
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = transactions
        .filter(t => t.type === 'expense' && matchesMonthYear(t.date, month, year))
      
      const bills = expenses
        .filter(isBillTransaction)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const discretionary = expenses
        .filter(t => !isBillTransaction(t))
        .reduce((sum, t) => sum + t.amount, 0)
      
      return { month, year, label, shortLabel, income, bills, discretionary }
    }

    return monthsData.map(calculateMonthData)
  }, [transactions, monthsData])

  // Generate quarterly data
  const quarterlyData = useMemo(() => {
    const isBillTransaction = (transaction) => transaction.category === 'Bills and Utilities'
    const currentDate = getCurrentDate()
    const currentYear = currentDate.getFullYear()
    
    // Show quarters for current year and previous year
    const years = [currentYear - 1, currentYear]
    const quarters = []
    
    const quarterMonths = {
      Q1: ['Jan', 'Feb', 'Mar'],
      Q2: ['Apr', 'May', 'Jun'],
      Q3: ['Jul', 'Aug', 'Sep'],
      Q4: ['Oct', 'Nov', 'Dec']
    }
    
    years.forEach(year => {
      Object.entries(quarterMonths).forEach(([quarter, months]) => {
        const quarterTransactions = transactions.filter(t => {
          // Date format: "Jan 3, 2026" or "Dec 10, 2025"
          const parts = t.date.split(' ')
          const txMonth = parts[0] // e.g., "Jan", "Dec"
          const txYear = parseInt(parts[2]) // e.g., 2026, 2025
          return txYear === year && months.includes(txMonth)
        })
        
        const income = quarterTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const expenses = quarterTransactions.filter(t => t.type === 'expense')
        const bills = expenses.filter(isBillTransaction).reduce((sum, t) => sum + t.amount, 0)
        const discretionary = expenses.filter(t => !isBillTransaction(t)).reduce((sum, t) => sum + t.amount, 0)
        
        quarters.push({
          month: quarter,
          year,
          label: `${quarter} ${year}`,
          shortLabel: quarter,
          income,
          bills,
          discretionary
        })
      })
    })
    
    return quarters
  }, [transactions])

  // Generate yearly data
  const yearlyData = useMemo(() => {
    const isBillTransaction = (transaction) => transaction.category === 'Bills and Utilities'
    const currentDate = getCurrentDate()
    const currentYear = currentDate.getFullYear()
    
    // Show last 6 years including current
    const years = []
    for (let i = 5; i >= 0; i--) {
      years.push(currentYear - i)
    }
    
    return years.map(year => {
      const yearTransactions = transactions.filter(t => {
        // Date format: "Jan 3, 2026" or "Dec 10, 2025"
        const parts = t.date.split(' ')
        const txYear = parseInt(parts[2])
        return txYear === year
      })
      
      const income = yearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = yearTransactions.filter(t => t.type === 'expense')
      const bills = expenses.filter(isBillTransaction).reduce((sum, t) => sum + t.amount, 0)
      const discretionary = expenses.filter(t => !isBillTransaction(t)).reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month: year.toString(),
        year,
        label: year.toString(),
        shortLabel: year.toString(),
        income,
        bills,
        discretionary
      }
    })
  }, [transactions])

  // Select which data to use based on timePeriod
  const chartData = useMemo(() => {
    switch (timePeriod) {
      case 'year':
        return yearlyData
      case 'quarterly':
        return quarterlyData
      case 'monthly':
      default:
        return allMonthsData
    }
  }, [timePeriod, allMonthsData, quarterlyData, yearlyData])

  // Reset start index when time period changes - position to show current period
  useEffect(() => {
    if (timePeriod === 'monthly') {
      setStartIndex(6) // Show current month (index 6-11)
    } else if (timePeriod === 'quarterly') {
      setStartIndex(4) // Show current year's quarters (Q1-Q4 of current year)
    } else {
      setStartIndex(0) // Show all years from the start
    }
  }, [timePeriod])

  // Determine items to show based on time period
  const itemsToShow = timePeriod === 'year' ? 6 : timePeriod === 'quarterly' ? 4 : monthsToShow
  const maxStartIndex = Math.max(0, chartData.length - itemsToShow)
  
  // Current month index: the chart starts at -6 months, so current month is at index 6
  const currentMonthIndex = timePeriod === 'monthly' ? 6 : -1
  const visibleData = chartData.slice(startIndex, startIndex + itemsToShow)

  // Calculate max value to set YAxis domain
  const maxValue = Math.max(...visibleData.map(m => Math.max(m.income, m.bills + m.discretionary)), 100)
  const yAxisMax = Math.ceil(maxValue / 100) * 100
  // Calculate the clip offset for the top line based on annotation width
  const annotationText = formatCurrency(yAxisMax)
  const approxCharWidth = CHART_CONFIG.fontSize.yAxis * 0.6
  const annotationWidth = annotationText.length * approxCharWidth
  const totalPadding = 16 // 8px on each side
  const clipOffset = annotationWidth + totalPadding

  const renderCustomTopLine = ({ viewBox }) => {
    if (!viewBox) return null
    const { x, y, width } = viewBox
    
    return (
      <line
        x1={x + clipOffset}
        y1={y}
        x2={x + width}
        y2={y}
        stroke={CHART_COLORS.grid}
        strokeWidth={CHART_CONFIG.gridStrokeWidth}
      />
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div style={TOOLTIP_STYLES.container}>
          <p style={TOOLTIP_STYLES.title}>{data.label}</p>
          <p style={TOOLTIP_STYLES.label}>Income:</p>
          <p style={TOOLTIP_STYLES.value}>${data.income.toLocaleString()}</p>
          <p style={TOOLTIP_STYLES.label}>Bills & Utilities:</p>
          <p style={TOOLTIP_STYLES.value}>${data.bills.toLocaleString()}</p>
          <p style={TOOLTIP_STYLES.label}>Spending:</p>
          <p style={TOOLTIP_STYLES.valueLast}>${data.discretionary.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  // Calculate max values for mobile card bars
  const maxIncome = Math.max(...allMonthsData.map(m => m.income), 1)
  const maxSpending = Math.max(...allMonthsData.map(m => m.bills + m.discretionary), 1)
  const mobileMaxValue = Math.max(maxIncome, maxSpending)

  // Filter out future months for mobile view
  const currentDate = getCurrentDate()
  const todayMonthNum = currentDate.getMonth()
  const todayYear = currentDate.getFullYear()
  
  // Map month abbreviations to their index (0-11)
  const monthToIndex = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  }
  
  const pastAndCurrentMonths = allMonthsData.filter(monthData => {
    const monthIndex = monthToIndex[monthData.month]
    if (monthData.year < todayYear) return true
    if (monthData.year === todayYear && monthIndex <= todayMonthNum) return true
    return false
  })

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="income-spending-chart mobile">
        {/* Period Tabs */}
        <div className="mobile-period-tabs">
          {TIME_PERIODS.map(period => (
            <button
              key={period}
              className={`period-tab ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Month Cards Carousel */}
        <div className="mobile-cards-scroll" ref={scrollContainerRef}>
          <div className="mobile-cards-container">
            {pastAndCurrentMonths.map((monthData, index) => {
              const isSelected = monthData.month === selectedMonth && monthData.year === selectedYear
              const totalSpending = monthData.bills + monthData.discretionary
              const incomeHeight = mobileMaxValue > 0 ? (monthData.income / mobileMaxValue) * 100 : 0
              const spendingHeight = mobileMaxValue > 0 ? (totalSpending / mobileMaxValue) * 100 : 0
              
              // Check if we need to show year divider (when year changes from previous month)
              const prevMonth = index > 0 ? pastAndCurrentMonths[index - 1] : null
              const showYearDivider = prevMonth && prevMonth.year !== monthData.year

              return (
                <div key={`${monthData.month}-${monthData.year}`} className="mobile-card-wrapper">
                  {showYearDivider && (
                    <div className="year-divider">
                      <span className="year-divider-text">{monthData.year}</span>
                    </div>
                  )}
                  <div 
                    className={`mobile-month-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onMonthSelect && onMonthSelect(monthData.month, monthData.year)}
                  >
                    <div className="card-bars">
                      <div className="card-bar income-bar" style={{ height: `${Math.max(incomeHeight, 5)}%` }}>
                        <div className="bar-fill solid"></div>
                      </div>
                      <div className="card-bar spending-bar" style={{ height: `${Math.max(spendingHeight, 5)}%` }}>
                        <div className="bar-fill dotted"></div>
                      </div>
                    </div>
                    <span className="card-month-label">{monthData.shortLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mobile-legend">
          <div className="legend-item">
            <span className="legend-dot solid"></span>
            <span className="legend-text">Income</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dotted"></span>
            <span className="legend-text">Total Spend</span>
          </div>
        </div>
      </div>
    )
  }

  // Desktop View
  return (
    <div className="income-spending-chart">
      <div className="chart-wrapper">
        <button 
          className="chart-nav-btn chart-nav-left" 
          onClick={() => setStartIndex(Math.max(0, startIndex - itemsToShow))}
          disabled={startIndex === 0}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleData} margin={{ top: 20, right: 70, left: 10, bottom: 25 }} barGap={12} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="0" stroke={CHART_COLORS.grid} strokeWidth={CHART_CONFIG.gridStrokeWidth} horizontal={true} vertical={false} horizontalValues={[0, yAxisMax / 2]} />
              <ReferenceLine
                y={yAxisMax}
                stroke="transparent"
                label={renderCustomTopLine}
              />
              <XAxis dataKey="label" stroke="transparent" tick={({ x, y, payload }) => {
                const dataItem = visibleData.find(m => m.label === payload.value)
                const dataIndex = visibleData.findIndex(m => m.label === payload.value) + startIndex
                const isCurrentMonth = timePeriod === 'monthly' && dataIndex === currentMonthIndex
                
                // Determine if this item is selected based on time period
                let isSelected = false
                if (timePeriod === 'monthly' && dataItem) {
                  isSelected = dataItem.month === selectedMonth && dataItem.year === selectedYear
                } else if (timePeriod === 'quarterly' && dataItem) {
                  isSelected = dataItem.shortLabel === selectedQuarter && dataItem.year === selectedPeriodYear
                } else if (timePeriod === 'year' && dataItem) {
                  isSelected = dataItem.year === selectedPeriodYear
                }
                
                // Display format depends on time period
                const now = getCurrentDate()
                const currentYear = now.getFullYear()
                let displayLabel = payload.value
                if (timePeriod === 'monthly' && dataItem) {
                  displayLabel = dataItem.year === currentYear ? dataItem.shortLabel : `${dataItem.shortLabel} ${dataItem.year}`
                } else if (timePeriod === 'quarterly' && dataItem) {
                  displayLabel = `${dataItem.shortLabel} ${dataItem.year}`
                } else if (timePeriod === 'year' && dataItem) {
                  displayLabel = dataItem.label
                }
                
                // Handle click based on time period
                const handleClick = () => {
                  if (!dataItem) return
                  if (timePeriod === 'monthly' && onMonthSelect) {
                    onMonthSelect(dataItem.month, dataItem.year)
                  } else if (timePeriod === 'quarterly' && onQuarterSelect) {
                    onQuarterSelect(dataItem.shortLabel, dataItem.year)
                  } else if (timePeriod === 'year' && onYearSelect) {
                    onYearSelect(dataItem.year)
                  }
                }
                
                // Calculate dynamic background dimensions based on text length
                const approxCharWidth = CHART_CONFIG.fontSize.month * 0.7
                const textWidth = displayLabel.length * approxCharWidth
                const bgWidth = textWidth + (CHART_CONFIG.monthHighlight.padding * 2)
                const bgHeight = CHART_CONFIG.fontSize.month + (CHART_CONFIG.monthHighlight.padding * 1.5)
                const bgOffsetX = -bgWidth / 2
                
                return (
                  <g 
                    style={{ cursor: 'pointer' }}
                    onClick={handleClick}
                  >
                    {(isCurrentMonth || isSelected) && (
                      <rect
                        x={x + bgOffsetX}
                        y={y + CHART_CONFIG.monthHighlight.offsetY}
                        width={bgWidth}
                        height={bgHeight}
                        fill={isSelected ? CHART_COLORS.monthHighlight : CHART_COLORS.monthHighlight}
                        rx={CHART_CONFIG.monthHighlight.borderRadius}
                      />
                    )}
                    <text 
                      x={x} 
                      y={y + 25} 
                      fill={CHART_COLORS.text} 
                      textAnchor="middle" 
                      fontSize={CHART_CONFIG.fontSize.month}
                      style={{ fontWeight: isSelected ? '600' : '400' }}
                    >
                      {displayLabel}
                    </text>
                  </g>
                )
              }} />
              <YAxis domain={[0, yAxisMax]} stroke="transparent" tick={(props) => {
                if (props.payload.value === yAxisMax) {
                  return <text x={props.x + 10} y={props.y} fill={CHART_COLORS.label} fontSize={CHART_CONFIG.fontSize.yAxis} textAnchor="start" dominantBaseline="middle" style={{ fontFamily: "'Moulpali', sans-serif" }}>{formatCurrency(props.payload.value)}</text>
                }
                return null
              }} ticks={[0, yAxisMax / 2, yAxisMax]} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {/* Income bar on the left, expenses bar on the right */}
              <Bar dataKey="income" fill={CHART_COLORS.income} radius={[100, 100, 0, 0]} maxBarSize={CHART_CONFIG.barMaxSize} />
              <Bar
                dataKey={entry => (entry.bills || 0) + (entry.discretionary || 0)}
                fill={CHART_COLORS.discretionary}
                maxBarSize={CHART_CONFIG.barMaxSize}
                shape={<CombinedSpendingBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button 
          className="chart-nav-btn chart-nav-right" 
          onClick={() => setStartIndex(Math.min(maxStartIndex, startIndex + itemsToShow))}
          disabled={startIndex >= maxStartIndex}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}

export default IncomeVsSpendingChart
