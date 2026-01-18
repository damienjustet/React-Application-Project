import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData, categoryIcons } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { FaChevronRight } from 'react-icons/fa'
import './RecentTransactionsWidget.css'

// Format date to readable string
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentTransactionsWidget({ isFeatured = false }) {
  const { transactions } = useData()
  const { getCategoryColors } = useTheme()
  const navigate = useNavigate()
  
  const categoryColors = getCategoryColors()
  
  // Get 5 most recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [transactions])

  const handleSeeMore = () => {
    navigate('/spending')
  }

  if (recentTransactions.length === 0) {
    return (
      <div className={`recent-transactions-widget ${isFeatured ? 'featured' : ''}`}>
        <div className="recent-empty">
          <i className="fa-solid fa-receipt"></i>
          <span>No recent transactions</span>
        </div>
      </div>
    )
  }

  // Featured view - mobile, full width section
  if (isFeatured) {
    return (
      <div className="recent-transactions-featured">
        <div className="recent-featured-header">
          <h3 className="recent-featured-title">Recent Transactions</h3>
        </div>
        <div className="recent-featured-list">
          {recentTransactions.map(transaction => {
            const icon = categoryIcons[transaction.category] || 'fa-receipt'
            const color = categoryColors[transaction.category] || '#888'
            const isExpense = transaction.type === 'expense'
            
            return (
              <div key={transaction.id} className="recent-transaction-row">
                <div className="recent-transaction-icon" style={{ backgroundColor: color }}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="recent-transaction-info">
                  <span className="recent-transaction-name">{transaction.name}</span>
                  <span className="recent-transaction-category">{transaction.category}</span>
                </div>
                <div className="recent-transaction-right">
                  <span className={`recent-transaction-amount font-numeric ${isExpense ? 'expense' : 'income'}`}>
                    {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </span>
                  <span className="recent-transaction-date">{formatDate(transaction.date)}</span>
                </div>
              </div>
            )
          })}
          {/* See More Button */}
          <div className="recent-see-more-row" onClick={handleSeeMore}>
            <span>See More</span>
            <FaChevronRight />
          </div>
        </div>
      </div>
    )
  }

  // Standard grid view - web
  return (
    <div className="recent-transactions-widget">
      <div className="recent-widget-header">
        <h3 className="recent-widget-title">Recent Transactions</h3>
        <button className="recent-see-more-btn" onClick={handleSeeMore}>
          <span>See More</span>
          <FaChevronRight />
        </button>
      </div>
      <div className="recent-widget-list">
        {recentTransactions.map(transaction => {
          const icon = categoryIcons[transaction.category] || 'fa-receipt'
          const color = categoryColors[transaction.category] || '#888'
          const isExpense = transaction.type === 'expense'
          
          return (
            <div key={transaction.id} className="recent-transaction-row">
              <div className="recent-transaction-icon" style={{ backgroundColor: color }}>
                <i className={`fa-solid ${icon}`}></i>
              </div>
              <div className="recent-transaction-info">
                <span className="recent-transaction-name">{transaction.name}</span>
                <span className="recent-transaction-category">{transaction.category}</span>
              </div>
              <div className="recent-transaction-right">
                <span className={`recent-transaction-amount font-numeric ${isExpense ? 'expense' : 'income'}`}>
                  {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
                </span>
                <span className="recent-transaction-date">{formatDate(transaction.date)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(RecentTransactionsWidget)
