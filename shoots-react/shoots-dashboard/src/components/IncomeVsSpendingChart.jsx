import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import './IncomeVsSpendingChart.css'

// Constants
const CHART_COLORS = {
  grid: '#ACACAC',
  text: '#e8e8e8',
  label: '#83827d',
  monthHighlight: '#2c2c2c',
  income: '#F4C95D',
  discretionary: '#FFDC84',
  bills: '#FFEBB8'
}

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
    width: 50,
    height: 28,
    offsetX: -25,
    offsetY: 8,
    borderRadius: 6
  }
}

const TOOLTIP_STYLES = {
  container: { background: '#2a2a2a', border: '1px solid #3a3a3a', padding: '8px', borderRadius: '4px' },
  title: { color: CHART_COLORS.text, margin: 0, marginBottom: '6px', fontWeight: '600', fontSize: `${CHART_CONFIG.fontSize.tooltipTitle}px` },
  label: { color: CHART_COLORS.text, margin: 0, marginBottom: '2px', fontSize: `${CHART_CONFIG.fontSize.tooltipText}px` },
  value: { color: CHART_COLORS.text, margin: 0, marginBottom: '6px', fontSize: `${CHART_CONFIG.fontSize.tooltipText}px` },
  valueLast: { color: CHART_COLORS.text, margin: 0, fontSize: `${CHART_CONFIG.fontSize.tooltipText}px` }
}

// Helper function
const formatCurrency = (value) => `$${(value / 1000).toFixed(1)}k`

function IncomeVsSpendingChart({ transactions = [], selectedMonth, onMonthSelect }) {
  const [startIndex, setStartIndex] = useState(6)
  const monthsToShow = 6

  // Helper to identify bills/subscriptions
  const isBillTransaction = (transaction) => {
    const billMerchants = ['Netflix', 'Spotify', 'Hulu', 'Disney+', 'Amazon Prime', 'Apple Music']
    const billPatterns = ['subscription', 'monthly', 'insurance', 'utilities', 'rent', 'mortgage']
    
    return billMerchants.includes(transaction.merchant) ||
           billPatterns.some(pattern => transaction.merchant.toLowerCase().includes(pattern))
  }

  // Calculate income and spending from transactions
  const calculateMonthData = (month) => {
    const income = transactions
      .filter(t => t.type === 'income' && t.date.includes(month))
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.date.includes(month))
    
    // Split expenses into bills (subscriptions/recurring) and discretionary
    const bills = expenses
      .filter(isBillTransaction)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const discretionary = expenses
      .filter(t => !isBillTransaction(t))
      .reduce((sum, t) => sum + t.amount, 0)
    
    return { month, income, bills, discretionary }
  }

  const allMonthsData = [
    calculateMonthData('Jan'),
    calculateMonthData('Feb'),
    calculateMonthData('Mar'),
    calculateMonthData('Apr'),
    calculateMonthData('May'),
    calculateMonthData('Jun'),
    calculateMonthData('Jul'),
    calculateMonthData('Aug'),
    calculateMonthData('Sep'),
    calculateMonthData('Oct'),
    calculateMonthData('Nov'),
    calculateMonthData('Dec')
  ]

  const currentMonthIndex = 11 // December
  const visibleMonths = allMonthsData.slice(startIndex, startIndex + monthsToShow)

  // Calculate max value to set YAxis domain
  const maxValue = Math.max(...visibleMonths.map(m => Math.max(m.income, m.bills + m.discretionary)), 100)
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div style={TOOLTIP_STYLES.container}>
          <p style={TOOLTIP_STYLES.title}>{label}</p>
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

  return (
    <div className="income-spending-chart">
      <div className="chart-wrapper">
        <button 
          className="chart-nav-btn chart-nav-left" 
          onClick={() => setStartIndex(Math.max(0, startIndex - 6))}
          disabled={startIndex === 0}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleMonths} margin={{ top: 20, right: 70, left: 10, bottom: 5 }} barGap={12} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="0" stroke={CHART_COLORS.grid} strokeWidth={CHART_CONFIG.gridStrokeWidth} horizontal={true} vertical={false} horizontalValues={[0, yAxisMax / 2]} />
              <ReferenceLine
                y={yAxisMax}
                stroke="transparent"
                label={renderCustomTopLine}
              />
              <XAxis dataKey="month" stroke="transparent" tick={({ x, y, payload }) => {
                const monthIndex = visibleMonths.findIndex(m => m.month === payload.value) + startIndex
                const isCurrentMonth = monthIndex === currentMonthIndex
                const isSelected = payload.value === selectedMonth
                return (
                  <g 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onMonthSelect && onMonthSelect(payload.value)}
                  >
                    {(isCurrentMonth || isSelected) && (
                      <rect
                        x={x + CHART_CONFIG.monthHighlight.offsetX}
                        y={y + CHART_CONFIG.monthHighlight.offsetY}
                        width={CHART_CONFIG.monthHighlight.width}
                        height={CHART_CONFIG.monthHighlight.height}
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
                      {payload.value}
                    </text>
                  </g>
                )
              }} />
              <YAxis domain={[0, yAxisMax]} stroke="transparent" tick={(props) => {
                if (props.payload.value === yAxisMax) {
                  return <text x={props.x + 10} y={props.y} fill={CHART_COLORS.label} fontSize={CHART_CONFIG.fontSize.yAxis} textAnchor="start" dominantBaseline="middle">{formatCurrency(props.payload.value)}</text>
                }
                return null
              }} ticks={[0, yAxisMax / 2, yAxisMax]} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="discretionary" fill={CHART_COLORS.discretionary} radius={[0, 0, 0, 0]} maxBarSize={CHART_CONFIG.barMaxSize} stackId="spending" />
              <Bar dataKey="bills" fill={CHART_COLORS.bills} radius={[100, 100, 0, 0]} maxBarSize={CHART_CONFIG.barMaxSize} stackId="spending" />
              <Bar dataKey="income" fill={CHART_COLORS.income} radius={[100, 100, 0, 0]} maxBarSize={CHART_CONFIG.barMaxSize} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button 
          className="chart-nav-btn chart-nav-right" 
          onClick={() => setStartIndex(Math.min(6, startIndex + 6))}
          disabled={startIndex >= 6}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}

export default IncomeVsSpendingChart
