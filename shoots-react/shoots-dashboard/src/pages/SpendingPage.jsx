import { useState } from 'react'
import './SpendingPage.css'
import SpendingHeader from '../components/SpendingHeader'
import IncomeVsSpendingChart from '../components/IncomeVsSpendingChart'

function SpendingPage({ isExpanded, isHovering, toggleSidebar }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="spending-page">
      <SpendingHeader 
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="spending-content">
        <h1 className="page-title">Spending</h1>
        
        {/* Top Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Spent This Month</div>
            <div className="stat-value">$2,847.32</div>
            <div className="stat-change positive">-12% vs last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Biggest Category</div>
            <div className="stat-value">Dining</div>
            <div className="stat-amount">$687.50</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average per Day</div>
            <div className="stat-value">$94.91</div>
            <div className="stat-change">30 days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">142</div>
            <div className="stat-change">+8 vs last month</div>
          </div>
        </div>

        {/* Income vs Spending Chart */}
        <IncomeVsSpendingChart />

        {/* Main Content - Split Layout */}
        <div className="spending-main">
          {/* Left Column - Transaction List */}
          <div className="transactions-section">
            <div className="section-header">
              <h2>Transactions</h2>
              <button className="add-transaction-btn">
                <i className="fa-solid fa-plus"></i>
                Add Transaction
              </button>
            </div>

            {/* Search and Filters */}
            <div className="transaction-controls">
              <div className="search-bar">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search transactions..." />
              </div>
              <div className="filter-chips">
                <button className="filter-chip active">All</button>
                <button className="filter-chip">This Month</button>
                <button className="filter-chip">Last 30 Days</button>
                <button className="filter-chip">This Year</button>
              </div>
            </div>

            {/* Transaction List */}
            <div className="transaction-list">
              {/* Sample transactions */}
              {[
                { date: 'Dec 9', merchant: 'Starbucks', category: 'Dining', amount: 8.50, icon: 'fa-coffee' },
                { date: 'Dec 9', merchant: 'Uber', category: 'Transportation', amount: 24.30, icon: 'fa-car' },
                { date: 'Dec 8', merchant: 'Amazon', category: 'Shopping', amount: 156.78, icon: 'fa-cart-shopping' },
                { date: 'Dec 8', merchant: 'Whole Foods', category: 'Groceries', amount: 87.42, icon: 'fa-basket-shopping' },
                { date: 'Dec 7', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, icon: 'fa-tv' },
                { date: 'Dec 7', merchant: 'Shell Gas', category: 'Transportation', amount: 52.00, icon: 'fa-gas-pump' },
                { date: 'Dec 6', merchant: 'Target', category: 'Shopping', amount: 43.21, icon: 'fa-bag-shopping' },
                { date: 'Dec 6', merchant: 'Chipotle', category: 'Dining', amount: 13.25, icon: 'fa-bowl-food' },
              ].map((transaction, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-icon">
                    <i className={`fa-solid ${transaction.icon}`}></i>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-merchant">{transaction.merchant}</div>
                    <div className="transaction-meta">
                      <span className="transaction-date">{transaction.date}</span>
                      <span className="category-badge">{transaction.category}</span>
                    </div>
                  </div>
                  <div className="transaction-amount">${transaction.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Charts & Insights */}
          <div className="insights-section">
            {/* Category Breakdown */}
            <div className="insight-card">
              <h3>Category Breakdown</h3>
              <div className="category-chart-placeholder">
                <div className="donut-chart">
                  {/* Placeholder for chart */}
                  <div className="chart-center">
                    <div className="chart-total">$2,847</div>
                    <div className="chart-label">Total</div>
                  </div>
                </div>
                <div className="category-legend">
                  {[
                    { name: 'Dining', amount: 687.50, color: '#ff6b6b', percent: 24 },
                    { name: 'Shopping', amount: 542.30, color: '#4ecdc4', percent: 19 },
                    { name: 'Groceries', amount: 423.80, color: '#95e1d3', percent: 15 },
                    { name: 'Transportation', amount: 386.20, color: '#f38181', percent: 14 },
                    { name: 'Entertainment', amount: 298.50, color: '#aa96da', percent: 10 },
                    { name: 'Other', amount: 509.02, color: '#83827d', percent: 18 },
                  ].map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <span className="category-dot" style={{ backgroundColor: category.color }}></span>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <div className="category-stats">
                        <span className="category-amount">${category.amount.toFixed(2)}</span>
                        <span className="category-percent">{category.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spending Trends */}
            <div className="insight-card">
              <h3>Spending Trends</h3>
              <div className="trends-chart-placeholder">
                <div className="line-chart">
                  {/* Placeholder for line chart */}
                  <div className="chart-placeholder-text">
                    6-month spending history
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="insight-card insights-list">
              <h3>Insights</h3>
              <div className="insight-item">
                <i className="fa-solid fa-lightbulb insight-icon"></i>
                <p>You spent 30% more on dining this week compared to your average.</p>
              </div>
              <div className="insight-item">
                <i className="fa-solid fa-chart-line insight-icon"></i>
                <p>Your coffee habit costs about $85/month. Consider brewing at home!</p>
              </div>
              <div className="insight-item">
                <i className="fa-solid fa-circle-check insight-icon success"></i>
                <p>Great job! You're under budget in 4 out of 6 categories this month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpendingPage
