import { memo, useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useData, EXPENSE_CATEGORIES, categoryIcons } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import './CategoryBreakdownWidget.css'

function CategoryBreakdownWidget() {
  const { transactions, getTransactionsByMonthYear, selectedMonth, selectedYear, budgets } = useData()
  const { getCategoryColors, palette } = useTheme()
  const [isHoveringChart, setIsHoveringChart] = useState(false)
  const [includeBills, setIncludeBills] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const categoryColors = getCategoryColors()

  // Calculate total monthly budget from all category budgets
  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.limit, 0)
  }, [budgets])

  // Compute category data
  const { categories, total, remaining } = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const selectedIndex = months.indexOf(selectedMonth)
    const previousMonth = selectedIndex > 0 ? months[selectedIndex - 1] : months[11]
    
    const monthTransactions = getTransactionsByMonthYear(selectedMonth, selectedYear)
    
    // Calculate current month totals
    const categoryTotals = {}
    monthTransactions.forEach(t => {
      if (t.type === 'expense' && categoryColors[t.category]) {
        if (!includeBills && t.category === 'Bills and Utilities') return
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      }
    })

    // Calculate previous month totals for comparison
    const previousMonthTotals = {}
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.includes(previousMonth) && categoryColors[t.category]) {
        if (!includeBills && t.category === 'Bills and Utilities') return
        previousMonthTotals[t.category] = (previousMonthTotals[t.category] || 0) + t.amount
      }
    })

    const cats = Object.keys(categoryColors).map(name => {
      const amount = categoryTotals[name] || 0
      const lastMonth = previousMonthTotals[name] || 0
      const percentChange = lastMonth === 0 ? (amount > 0 ? 100 : 0) : Math.round(((amount - lastMonth) / lastMonth) * 100)
      return { name, amount, color: categoryColors[name], percentChange, lastMonth }
    }).filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    const totalAmount = cats.reduce((sum, cat) => sum + cat.amount, 0)
    const remainingBudget = Math.max(0, totalBudget - totalAmount)
    
    return { categories: cats, total: totalAmount, remaining: remainingBudget }
  }, [transactions, selectedMonth, selectedYear, categoryColors, getTransactionsByMonthYear, totalBudget, includeBills])

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentOfTotal = ((data.amount / total) * 100).toFixed(1)
      return (
        <div className="category-widget-tooltip">
          {data.name}: {percentOfTotal}%
        </div>
      )
    }
    return null
  }

  if (categories.length === 0) {
    return (
      <div className="category-breakdown-widget">
        <div className="category-widget-header">
          <h3 className="category-widget-title">Category Breakdown</h3>
          <button 
            className={`category-widget-bills-btn ${includeBills ? 'active' : ''}`}
            style={{ '--btn-active-color': palette.primary }}
            onClick={() => setIncludeBills(!includeBills)}
          >
            Bills
          </button>
        </div>
        <div className="category-widget-empty">
          <i className="fa-solid fa-chart-pie"></i>
          <span>No spending data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="category-breakdown-widget">
      <div className="category-widget-header">
        <h3 className="category-widget-title">Category Breakdown</h3>
        <button 
          className={`category-widget-bills-btn ${includeBills ? 'active' : ''}`}
          style={{ '--btn-active-color': palette.primary }}
          onClick={() => setIncludeBills(!includeBills)}
        >
          Bills
        </button>
      </div>
      <div className="category-widget-content">
        {/* Left side - Pie Chart */}
        <div className="category-widget-chart">
        <div className="category-widget-center-label">
          <span 
            className={`category-widget-amount font-numeric ${isHoveringChart ? 'expanded' : ''}`}
            onMouseEnter={() => setIsHoveringChart(true)}
            onMouseLeave={() => setIsHoveringChart(false)}
          >
            {isHoveringChart
              ? `$${remaining.toFixed(2)}`
              : remaining >= 1000
                ? `$${(remaining / 1000).toFixed(1)}k`
                : `$${Math.round(remaining)}`
            }
          </span>
          <span className="category-widget-label">Left</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? "60%" : "55%"}
              outerRadius={isMobile ? "95%" : "85%"}
              paddingAngle={0}
              dataKey="amount"
              stroke="none"
              onMouseEnter={(_, __, e) => { e.target.style.filter = 'brightness(1.15)' }}
              onMouseLeave={(_, __, e) => { e.target.style.filter = 'brightness(1)' }}
            >
              {categories.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Right side - Category List */}
      <div className="category-widget-list">
        {categories.map((category, index) => {
          const changeClass = category.percentChange > 0 ? 'up' : category.percentChange < 0 ? 'down' : ''
          return (
            <div key={index} className="category-widget-row">
              <div className="category-widget-row-left">
                <span className="category-widget-dot" style={{ backgroundColor: category.color }}></span>
                <span className="category-widget-name">{category.name}</span>
              </div>
              <div className="category-widget-row-right">
                <span className={`category-widget-percent font-numeric ${changeClass}`}>{Math.abs(category.percentChange)}%</span>
                <span className="category-widget-value font-numeric">${category.amount.toFixed(0)}</span>
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}

export default memo(CategoryBreakdownWidget)
