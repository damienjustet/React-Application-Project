import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './IncomeVsSpendingChart.css'

function IncomeVsSpendingChart() {
  const [startIndex, setStartIndex] = useState(0)
  const monthsToShow = 6

  const allMonthsData = [
    { month: 'Jan', income: 1850, bills: 850, discretionary: 570 },
    { month: 'Feb', income: 1900, bills: 870, discretionary: 810 },
    { month: 'Mar', income: 1850, bills: 850, discretionary: 670 },
    { month: 'Apr', income: 1850, bills: 850, discretionary: 540 },
    { month: 'May', income: 1850, bills: 850, discretionary: 730 },
    { month: 'Jun', income: 1850, bills: 850, discretionary: 870 },
    { month: 'Jul', income: 1850, bills: 850, discretionary: 600 },
    { month: 'Aug', income: 1850, bills: 850, discretionary: 770 },
    { month: 'Sep', income: 1850, bills: 850, discretionary: 640 },
    { month: 'Oct', income: 1850, bills: 850, discretionary: 997 },
    { month: 'Nov', income: 0, bills: 0, discretionary: 0 },
    { month: 'Dec', income: 0, bills: 0, discretionary: 0 }
  ]

  const currentMonthIndex = 9
  const visibleMonths = allMonthsData.slice(startIndex, startIndex + monthsToShow)

  // Calculate max value to set YAxis domain
  const maxValue = Math.max(...visibleMonths.map(m => Math.max(m.income, m.bills + m.discretionary)))
  const yAxisMax = Math.ceil(maxValue / 100) * 100

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', padding: '12px', borderRadius: '4px' }}>
          <p style={{ color: '#e8e8e8', margin: 0, marginBottom: '8px', fontWeight: '600' }}>{label}</p>
          <p style={{ color: '#e8e8e8', margin: 0, marginBottom: '4px' }}>Income:</p>
          <p style={{ color: '#e8e8e8', margin: 0, marginBottom: '8px' }}>${data.income.toLocaleString()}</p>
          <p style={{ color: '#e8e8e8', margin: 0, marginBottom: '4px' }}>Bills & Utilities:</p>
          <p style={{ color: '#e8e8e8', margin: 0, marginBottom: '8px' }}>${data.bills.toLocaleString()}</p>
          <p style={{ color: '#e8e8e8', margin: 0, marginBottom: '4px' }}>Spending:</p>
          <p style={{ color: '#e8e8e8', margin: 0 }}>${data.discretionary.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="income-spending-chart">
      <div className="chart-header">
        <h3>Income vs Spending</h3>
      </div>
      <div className="chart-wrapper">
        <button 
          className="chart-nav-btn chart-nav-left" 
          onClick={() => startIndex > 0 && setStartIndex(startIndex - 1)}
          disabled={startIndex === 0}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleMonths} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={12} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="0" stroke="#ACACAC" strokeWidth={3} horizontal={true} vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={({ x, y, payload }) => {
                const monthIndex = visibleMonths.findIndex(m => m.month === payload.value) + startIndex
                const isCurrentMonth = monthIndex === currentMonthIndex
                return <text x={x} y={y + 12} fill={isCurrentMonth ? '#e8e8e8' : '#83827d'} textAnchor="middle" fontSize={14}>{payload.value}</text>
              }} />
              <YAxis domain={[0, yAxisMax]} stroke="transparent" tick={(props) => {
                if (props.payload.value === yAxisMax) {
                  return <text x={props.x - 10} y={props.y} fill="#83827d" fontSize={12} textAnchor="end" dominantBaseline="middle">${(props.payload.value / 1000).toFixed(1)}k</text>
                }
                return null
              }} ticks={[0, yAxisMax / 2, yAxisMax]} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="discretionary" fill="#FFDC84" radius={[0, 0, 0, 0]} maxBarSize={30} stackId="spending" />
              <Bar dataKey="bills" fill="#FFEBB8" radius={[100, 100, 0, 0]} maxBarSize={30} stackId="spending" />
              <Bar dataKey="income" fill="#F4C95D" radius={[100, 100, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button 
          className="chart-nav-btn chart-nav-right" 
          onClick={() => setStartIndex(startIndex + 1)}
          disabled={startIndex + monthsToShow >= allMonthsData.length}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}

export default IncomeVsSpendingChart
