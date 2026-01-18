import { memo, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { getLastNMonths, matchesMonthYear, getCurrentDate } from '../utils/dateUtils'
import './SpendingTrendsWidget.css'

function SpendingTrendsWidget() {
  const { transactions } = useData()
  const { palette } = useTheme()
  const [includeBills, setIncludeBills] = useState(true)

  // Calculate spending trends data
  const { monthlyTotals, avgTotal, maxTotal, hasData } = useMemo(() => {
    const allMonths = getLastNMonths(12)
    
    // Calculate totals for each month and filter to only those with data
    const monthsWithData = allMonths
      .map(monthInfo => {
        const total = transactions
          .filter(t => {
            if (!matchesMonthYear(t.date, monthInfo.month, monthInfo.year)) return false
            if (t.type !== 'expense') return false
            if (!includeBills && t.category === 'Bills and Utilities') return false
            return true
          })
          .reduce((sum, t) => sum + t.amount, 0)
        return { ...monthInfo, total }
      })
      .filter(m => m.total > 0)
    
    // Take only the last 6 months with data
    const totals = monthsWithData.slice(-6)
    
    if (totals.length === 0) {
      return { monthlyTotals: [], avgTotal: 0, maxTotal: 0, hasData: false }
    }

    const max = Math.max(...totals.map(m => m.total), 1)
    const avg = totals.reduce((sum, m) => sum + m.total, 0) / totals.length

    return { monthlyTotals: totals, avgTotal: avg, maxTotal: max, hasData: true }
  }, [transactions, includeBills])

  if (!hasData) {
    return (
      <div className="spending-trends-widget">
        <div className="trends-widget-header">
          <h3 className="trends-widget-title">Spending Trends</h3>
          <button 
            className={`trends-widget-bills-btn ${includeBills ? 'active' : ''}`}
            style={{ '--btn-active-color': palette.primary }}
            onClick={() => setIncludeBills(!includeBills)}
          >
            Bills
          </button>
        </div>
        <div className="trends-widget-empty">
          <i className="fa-solid fa-chart-line"></i>
          <span>No spending data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="spending-trends-widget">
      <div className="trends-widget-header">
        <h3 className="trends-widget-title">Spending Trends</h3>
        <button 
          className={`trends-widget-bills-btn ${includeBills ? 'active' : ''}`}
          style={{ '--btn-active-color': palette.primary }}
          onClick={() => setIncludeBills(!includeBills)}
        >
          Bills
        </button>
      </div>
      
      <div className="trends-widget-content">
        <div className="trends-widget-stats">
          <div className="trends-widget-stat">
            <span className="trends-widget-stat-label">6-Month Avg</span>
            <span className="trends-widget-stat-value font-numeric">${avgTotal.toFixed(0)}</span>
          </div>
          <div className="trends-widget-stat">
            <span className="trends-widget-stat-label">Highest</span>
            <span className="trends-widget-stat-value font-numeric">${maxTotal.toFixed(0)}</span>
          </div>
        </div>
        
        <div className="trends-widget-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTotals} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
              <XAxis 
                dataKey="shortLabel" 
                stroke="#888" 
                tick={{ fill: '#888', fontSize: 10 }}
                axisLine={{ stroke: '#333' }}
                tickLine={false}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <Tooltip 
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="trends-widget-tooltip">
                        ${payload[0].value.toLocaleString()}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="linear"
                dataKey="total"
                stroke={palette.primary}
                strokeWidth={2}
                fill={palette.primary}
                fillOpacity={0.15}
                dot={false}
                activeDot={(props) => {
                  const { cx, cy } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={palette.primary}
                      stroke="#2a2a2a"
                      strokeWidth={2}
                    />
                  )
                }}
                animationDuration={300}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default memo(SpendingTrendsWidget)
