import { useState } from 'react'
import './SpendingPage.css'
import SpendingHeader from '../components/SpendingHeader'
import IncomeVsSpendingChart from '../components/IncomeVsSpendingChart'
import CurrencyInput from '../components/CurrencyInput'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useData, EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryIcons } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { displayToInputDate, inputToDisplayDate } from '../utils/dateUtils'

function SpendingPage({ isExpanded, toggleSidebar }) {
  // Constants
  const RECENT_TRANSACTIONS_LIMIT = 10

  // Context
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByMonth } = useData()
  const { getCategoryColors } = useTheme()
  
  // Get theme-based category colors
  const categoryColors = getCategoryColors()

  // State
  const [isHoveringChart, setIsHoveringChart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Recent')
  const [selectedMonth, setSelectedMonth] = useState('Dec')
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' })
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [newTransaction, setNewTransaction] = useState({ merchant: '', amount: 0, category: 'Dining', date: '', type: 'expense' })
  const [editTransaction, setEditTransaction] = useState({ merchant: '', amount: 0, category: '', date: '', type: '' })

  // Computed values
  const monthTransactions = getTransactionsByMonth(selectedMonth)
  
  const filteredTransactions = monthTransactions.filter(transaction => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    // Date range filter
    if (dateRangeFilter.start || dateRangeFilter.end) {
      const transactionDate = new Date(transaction.date + ' 2024')
      if (dateRangeFilter.start && transactionDate < new Date(dateRangeFilter.start)) return false
      if (dateRangeFilter.end && transactionDate > new Date(dateRangeFilter.end)) return false
    }

    if (activeFilter === 'Income') {
      return transaction.type === 'income'
    }
    
    return true
  }).slice(0, activeFilter === 'Recent' ? RECENT_TRANSACTIONS_LIMIT : undefined)

  // Handlers
  const handleAddTransaction = () => {
    if (newTransaction.merchant && newTransaction.amount > 0 && newTransaction.date) {
      const formattedDate = inputToDisplayDate(newTransaction.date)
      
      const transaction = {
        date: formattedDate,
        merchant: newTransaction.merchant,
        category: newTransaction.category,
        amount: newTransaction.amount,
        icon: categoryIcons[newTransaction.category],
        type: newTransaction.type
      }
      addTransaction(transaction)
      setNewTransaction({ merchant: '', amount: 0, category: 'Dining', date: '', type: 'expense' })
      setShowAddModal(false)
    }
  }

  const handleEditClick = (transaction, index) => {
    const dateForInput = displayToInputDate(transaction.date)
    
    setEditTransaction({
      merchant: transaction.merchant,
      amount: transaction.amount,
      category: transaction.category,
      date: dateForInput,
      type: transaction.type
    })
    setEditingIndex(index)
    setShowEditModal(true)
  }

  const handleUpdateTransaction = () => {
    if (editTransaction.merchant && editTransaction.amount > 0 && editTransaction.date) {
      const formattedDate = inputToDisplayDate(editTransaction.date)
      
      const transaction = {
        date: formattedDate,
        merchant: editTransaction.merchant,
        category: editTransaction.category,
        amount: editTransaction.amount,
        icon: categoryIcons[editTransaction.category],
        type: editTransaction.type
      }
      updateTransaction(editingIndex, transaction)
      setShowEditModal(false)
      setEditingIndex(null)
    }
  }

  const handleDeleteTransaction = () => {
    if (editingIndex !== null) {
      deleteTransaction(editingIndex)
      setShowEditModal(false)
      setEditingIndex(null)
    }
  }

  const handleExportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Type']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        `${t.date},${t.merchant},${t.category},${t.amount},${t.type}`
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${selectedMonth}-${new Date().getFullYear()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const clearDateFilter = () => {
    setDateRangeFilter({ start: '', end: '' })
    setShowDateFilter(false)
  }

  return (
    <div className="spending-page">
      <SpendingHeader 
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
      />
      
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Merchant</label>
                <input 
                  type="text" 
                  placeholder="e.g. Starbucks"
                  value={newTransaction.merchant}
                  onChange={(e) => setNewTransaction({...newTransaction, merchant: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <CurrencyInput
                  value={newTransaction.amount}
                  onChange={(dollars) => setNewTransaction({...newTransaction, amount: dollars})}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <div className="type-toggle">
                  <button 
                    type="button"
                    className={`type-btn ${newTransaction.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense', category: 'Dining'})}
                  >
                    <i className="fa-solid fa-arrow-down"></i>
                    Expense
                  </button>
                  <button 
                    type="button"
                    className={`type-btn ${newTransaction.type === 'income' ? 'active income' : ''}`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'income', category: 'Salary'})}
                  >
                    <i className="fa-solid fa-arrow-up"></i>
                    Income
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  {(newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleAddTransaction}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
      
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Transaction</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Merchant</label>
                <input 
                  type="text" 
                  placeholder="e.g. Starbucks"
                  value={editTransaction.merchant}
                  onChange={(e) => setEditTransaction({...editTransaction, merchant: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <CurrencyInput
                  value={editTransaction.amount}
                  onChange={(dollars) => setEditTransaction({...editTransaction, amount: dollars})}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={editTransaction.date}
                  onChange={(e) => setEditTransaction({...editTransaction, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <div className="type-toggle">
                  <button 
                    type="button"
                    className={`type-btn ${editTransaction.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setEditTransaction({...editTransaction, type: 'expense', category: 'Dining'})}
                  >
                    <i className="fa-solid fa-arrow-down"></i>
                    Expense
                  </button>
                  <button 
                    type="button"
                    className={`type-btn ${editTransaction.type === 'income' ? 'active income' : ''}`}
                    onClick={() => setEditTransaction({...editTransaction, type: 'income', category: 'Salary'})}
                  >
                    <i className="fa-solid fa-arrow-up"></i>
                    Income
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={editTransaction.category}
                  onChange={(e) => setEditTransaction({...editTransaction, category: e.target.value})}
                >
                  {(editTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-delete" onClick={handleDeleteTransaction}>
                <i className="fa-solid fa-trash"></i>
                Delete
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-add" onClick={handleUpdateTransaction}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="spending-content">
        <h1 className="page-title">Spending</h1>

        {/* Income vs Spending Chart */}
        <IncomeVsSpendingChart 
          transactions={transactions} 
          selectedMonth={selectedMonth}
          onMonthSelect={setSelectedMonth}
        />

        {/* Main Content - Split Layout */}
        <div className="spending-main">
          {/* Left Column - Transaction List */}
          <div className="transactions-section">
            <div className="section-header">
              <h2>Transactions</h2>
              <div className="header-actions">
                <button className="action-btn export-btn" onClick={handleExportTransactions} title="Export to CSV">
                  <i className="fa-solid fa-download"></i>
                </button>
                <button 
                  className={`action-btn filter-btn ${showDateFilter ? 'active' : ''}`}
                  onClick={() => setShowDateFilter(!showDateFilter)} 
                  title="Date Filter"
                >
                  <i className="fa-solid fa-calendar-days"></i>
                </button>
                <button className="add-transaction-btn" onClick={() => setShowAddModal(true)}>
                  <i className="fa-solid fa-plus"></i>
                  Add Transaction
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="transaction-controls">
              <div className="search-bar">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-chips">
                <button 
                  className={`filter-chip ${activeFilter === 'Recent' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Recent')}
                >
                  Recent
                </button>
                <button 
                  className={`filter-chip ${activeFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('All')}
                >
                  All
                </button>
                <button 
                  className={`filter-chip ${activeFilter === 'Income' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Income')}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            {showDateFilter && (
              <div className="date-filter-panel">
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>From</label>
                    <input 
                      type="date" 
                      value={dateRangeFilter.start}
                      onChange={(e) => setDateRangeFilter({...dateRangeFilter, start: e.target.value})}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>To</label>
                    <input 
                      type="date" 
                      value={dateRangeFilter.end}
                      onChange={(e) => setDateRangeFilter({...dateRangeFilter, end: e.target.value})}
                    />
                  </div>
                </div>
                {(dateRangeFilter.start || dateRangeFilter.end) && (
                  <button className="clear-filter-btn" onClick={clearDateFilter}>
                    <i className="fa-solid fa-xmark"></i>
                    Clear Filter
                  </button>
                )}
              </div>
            )}

            {/* Transaction List */}
            <div className="transaction-list">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => {
                  // Find the actual index in the full transactions array
                  const actualIndex = transactions.findIndex(t => 
                    t.date === transaction.date && 
                    t.merchant === transaction.merchant && 
                    t.amount === transaction.amount &&
                    t.category === transaction.category
                  )
                  return (
                    <div 
                      key={index} 
                      className="transaction-item" 
                      onClick={() => handleEditClick(transaction, actualIndex)}
                      style={{ cursor: 'pointer' }}
                    >
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
                      <div className={`transaction-amount font-numeric ${transaction.type === 'income' ? 'income' : ''}`}>
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="no-transactions">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Charts & Insights */}
          <div className="insights-section">
            {/* Category Breakdown */}
            <div className="insight-card">
              <h3>Category Breakdown</h3>
              <div className="category-chart-placeholder">
                {(() => {
                  // Get month abbreviations for comparison
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const selectedIndex = months.indexOf(selectedMonth)
                  const previousMonth = selectedIndex > 0 ? months[selectedIndex - 1] : months[11]

                  // Calculate category totals for selected month
                  const categoryTotals = {}
                  monthTransactions.forEach(t => {
                    if (t.type === 'expense' && categoryColors[t.category]) {
                      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
                    }
                  })

                  // Calculate previous month totals for comparison
                  const previousMonthTotals = {}
                  transactions.forEach(t => {
                    if (t.type === 'expense' && t.date.includes(previousMonth) && categoryColors[t.category]) {
                      previousMonthTotals[t.category] = (previousMonthTotals[t.category] || 0) + t.amount
                    }
                  })

                  const categories = Object.keys(categoryColors).map(name => {
                    const amount = categoryTotals[name] || 0
                    const lastMonth = previousMonthTotals[name] || 0
                    const percentChange = lastMonth === 0 ? (amount > 0 ? 100 : 0) : Math.round(((amount - lastMonth) / lastMonth) * 100)
                    return {
                      name,
                      amount,
                      color: categoryColors[name],
                      percentChange,
                      lastMonth
                    }
                  }).filter(cat => cat.amount > 0)

                  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
                    const lastMonthTotal = categories.reduce((sum, cat) => sum + cat.lastMonth, 0);
                    const totalPercentChange = Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100);

                    const CustomTooltip = ({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentOfTotal = ((data.amount / total) * 100).toFixed(1);
                      return (
                        <div style={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          color: '#e8e8e8',
                          fontSize: '0.8125rem',
                          fontFamily: "'Moulpali', sans-serif"
                        }}>
                          {data.name}: {percentOfTotal}%
                        </div>
                      );
                    }
                    return null;
                  };

                  return (
                    <>
                      <div className="donut-chart">
                        <div className="chart-center">
                          <div className="chart-label-wrapper">
                            <div 
                              className={`chart-total ${isHoveringChart ? 'expanded' : ''}`}
                              style={{ fontFamily: "'Moulpali', sans-serif" }}
                              onMouseEnter={() => setIsHoveringChart(true)}
                              onMouseLeave={() => setIsHoveringChart(false)}
                            >
                              {isHoveringChart ? `$${total.toFixed(2)}` : `$${(total / 1000).toFixed(1)}k`}
                            </div>
                            <div className="chart-bottom-row">
                              <div 
                                className={`chart-percent-change ${totalPercentChange >= 0 ? 'increase' : 'decrease'}`}
                                style={{ fontFamily: "'Moulpali', sans-serif" }}
                              >
                                {Math.abs(totalPercentChange)}%
                              </div>
                              <div className="chart-label">Total</div>
                            </div>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categories}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={0}
                              dataKey="amount"
                              stroke="none"
                              activeIndex={undefined}
                              activeShape={{
                                outerRadius: 95,
                              }}
                              onMouseEnter={(data, index, e) => {
                                e.target.style.filter = 'brightness(1.15)';
                              }}
                              onMouseLeave={(data, index, e) => {
                                e.target.style.filter = 'brightness(1)';
                              }}
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
                      <div className="category-legend">
                        {categories.map((category, index) => {
                          const percentOfTotal = ((category.amount / total) * 100).toFixed(1);
                          const amountDiff = Math.abs(category.amount - category.lastMonth).toFixed(2);
                          const percentTooltip = `$${amountDiff} ${category.percentChange > 0 ? 'more' : category.percentChange < 0 ? 'less' : 'same as'} than last month`;

                          return (
                            <div key={index} className="category-item">
                              <div className="category-info">
                                <span className="category-dot" style={{ backgroundColor: category.color }}></span>
                                <span className="category-name">{category.name}</span>
                              </div>
                              <div className="category-stats">
                                <span className="category-amount font-numeric">${category.amount.toFixed(2)}</span>
                                <span 
                                  className={`category-percent font-numeric ${category.percentChange > 0 ? 'increase' : category.percentChange < 0 ? 'decrease' : ''}`}
                                  title={percentTooltip}
                                >
                                  {Math.abs(category.percentChange)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Spending Trends */}
            <div className="insight-card">
              <h3>Spending Trends</h3>
              <div className="trends-chart-placeholder">
                {(() => {
                  // Calculate last 6 months spending
                  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const monthlyTotals = months.map(month => {
                    const total = transactions
                      .filter(t => t.date.includes(month) && t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                    return { month, total }
                  })

                  const maxTotal = Math.max(...monthlyTotals.map(m => m.total))
                  const avgTotal = monthlyTotals.reduce((sum, m) => sum + m.total, 0) / monthlyTotals.length

                  return (
                    <div className="line-chart">
                      <div className="chart-summary">
                        <div className="summary-stat">
                          <span className="stat-label">6-Month Average</span>
                          <span className="stat-value font-numeric">${avgTotal.toFixed(0)}</span>
                        </div>
                        <div className="summary-stat">
                          <span className="stat-label">Highest Month</span>
                          <span className="stat-value font-numeric">${maxTotal.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="trend-bars">
                        {monthlyTotals.map((data, index) => (
                          <div key={index} className="trend-bar-group">
                            <div className="trend-bar-container">
                              <div 
                                className={`trend-bar ${data.month === selectedMonth ? 'active' : ''}`}
                                style={{ 
                                  height: `${(data.total / maxTotal) * 100}%`,
                                  minHeight: data.total > 0 ? '8px' : '0'
                                }}
                                title={`${data.month}: $${data.total.toFixed(2)}`}
                              />
                            </div>
                            <span className="trend-month">{data.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Insights */}
            <div className="insight-card insights-list">
              <h3>Financial Insights</h3>
              {(() => {
                const insights = []
                const currentMonthExpenses = monthTransactions.filter(t => t.type === 'expense')
                const totalSpending = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
                const categoryTotals = {}
                
                currentMonthExpenses.forEach(t => {
                  categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
                })

                const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
                
                // Insight 1: Top spending category
                if (topCategory) {
                  const categoryPercent = ((topCategory[1] / totalSpending) * 100).toFixed(0)
                  insights.push({
                    icon: 'fa-chart-pie',
                    type: 'info',
                    text: `${topCategory[0]} accounts for ${categoryPercent}% of your spending this month ($${topCategory[1].toFixed(2)}).`
                  })
                }

                // Insight 2: Daily average
                const daysInMonth = 30
                const dailyAvg = (totalSpending / daysInMonth).toFixed(2)
                insights.push({
                  icon: 'fa-calendar-day',
                  type: 'info',
                  text: `Your daily average spending is $${dailyAvg}. Consider setting a daily budget to track progress.`
                })

                // Insight 3: Transaction frequency
                const transactionCount = currentMonthExpenses.length
                if (transactionCount > 50) {
                  insights.push({
                    icon: 'fa-receipt',
                    type: 'warning',
                    text: `You've made ${transactionCount} transactions this month. Consolidating purchases could help reduce impulse spending.`
                  })
                } else if (transactionCount < 20) {
                  insights.push({
                    icon: 'fa-circle-check',
                    type: 'success',
                    text: `Great job! Your ${transactionCount} transactions show mindful spending habits.`
                  })
                }

                // Insight 4: Income vs Spending
                const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                if (income > 0) {
                  const savingsRate = ((income - totalSpending) / income * 100).toFixed(0)
                  if (savingsRate > 20) {
                    insights.push({
                      icon: 'fa-piggy-bank',
                      type: 'success',
                      text: `Excellent! You're saving ${savingsRate}% of your income. You're on track for financial success.`
                    })
                  } else if (savingsRate > 0) {
                    insights.push({
                      icon: 'fa-chart-line',
                      type: 'info',
                      text: `You're saving ${savingsRate}% of your income. Financial experts recommend aiming for 20% or more.`
                    })
                  } else {
                    insights.push({
                      icon: 'fa-triangle-exclamation',
                      type: 'warning',
                      text: `Your spending exceeds your income this month. Review your expenses and consider cutting back.`
                    })
                  }
                }

                return insights.slice(0, 4).map((insight, index) => (
                  <div key={index} className="insight-item">
                    <i className={`fa-solid ${insight.icon} insight-icon ${insight.type}`}></i>
                    <p>{insight.text}</p>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpendingPage
