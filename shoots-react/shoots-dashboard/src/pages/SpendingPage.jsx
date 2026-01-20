import { useState } from 'react'
import './SpendingPage.css'
import SpendingHeader from '../components/SpendingHeader'
import IncomeVsSpendingChart from '../components/IncomeVsSpendingChart'
import CurrencyInput from '../components/CurrencyInput'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useData, EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryIcons } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { displayToInputDate, inputToDisplayDate, getLastNMonths, matchesMonthYear, getCurrentDate, parseDisplayDate } from '../utils/dateUtils'

function SpendingPage({ isExpanded, toggleSidebar }) {
  // Constants
  const RECENT_TRANSACTIONS_LIMIT = 10

  // Context
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByMonthYear, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useData()
  const { getCategoryColors, palette } = useTheme()
  // Get theme-based category colors
  const categoryColors = getCategoryColors()

  // State
  const [isHoveringChart, setIsHoveringChart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Recent')
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' })
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [newTransaction, setNewTransaction] = useState({ merchant: '', amount: 0, category: 'Dining', date: '', type: 'expense' })
  const [editTransaction, setEditTransaction] = useState({ merchant: '', amount: 0, category: '', date: '', type: '' })
  const [includeBillsInBreakdown, setIncludeBillsInBreakdown] = useState(true)
  const [includeBillsInTrends, setIncludeBillsInTrends] = useState(true)
  const [timePeriod, setTimePeriod] = useState('monthly')
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const now = getCurrentDate()
    const q = Math.ceil((now.getMonth() + 1) / 3)
    return `Q${q}`
  })
  const [selectedPeriodYear, setSelectedPeriodYear] = useState(() => getCurrentDate().getFullYear())

  // Quarter to months mapping
  const quarterMonths = {
    Q1: ['Jan', 'Feb', 'Mar'],
    Q2: ['Apr', 'May', 'Jun'],
    Q3: ['Jul', 'Aug', 'Sep'],
    Q4: ['Oct', 'Nov', 'Dec']
  }

  // Get transactions based on time period
  const periodTransactions = (() => {
    if (timePeriod === 'monthly') {
      return getTransactionsByMonthYear(selectedMonth, selectedYear)
    } else if (timePeriod === 'quarterly') {
      const months = quarterMonths[selectedQuarter] || []
      return transactions.filter(t => {
        // Date format: "Jan 3, 2026" or "Dec 10, 2025"
        const parts = t.date.split(' ')
        const txMonth = parts[0] // e.g., "Jan", "Dec"
        const txYear = parseInt(parts[2]) // e.g., 2026, 2025
        return txYear === selectedPeriodYear && months.includes(txMonth)
      })
    } else if (timePeriod === 'year') {
      return transactions.filter(t => {
        // Date format: "Jan 3, 2026" or "Dec 10, 2025"
        const parts = t.date.split(' ')
        const txYear = parseInt(parts[2])
        return txYear === selectedPeriodYear
      })
    }
    return []
  })()

  // For backward compatibility, also keep monthTransactions
  const monthTransactions = periodTransactions
  
  const filteredTransactions = monthTransactions.filter(transaction => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    // Date range filter
    if (dateRangeFilter.start || dateRangeFilter.end) {
      const transactionDate = new Date(transaction.date)
      if (dateRangeFilter.start && transactionDate < new Date(dateRangeFilter.start)) return false
      if (dateRangeFilter.end && transactionDate > new Date(dateRangeFilter.end)) return false
    }

    if (activeFilter === 'Income') {
      return transaction.type === 'income'
    }
    
    return true
  }).slice(0, activeFilter === 'Recent' ? RECENT_TRANSACTIONS_LIMIT : undefined)

  // Get today's date in input format (YYYY-MM-DD) for placeholder
  const getTodayInputFormat = () => {
    const today = getCurrentDate()
    return today.toISOString().split('T')[0]
  }

  // Handlers
  const handleAddTransaction = () => {
    if (newTransaction.merchant && newTransaction.amount > 0) {
      // Default to today's date if no date provided
      const dateToUse = newTransaction.date || getTodayInputFormat()
      const formattedDate = inputToDisplayDate(dateToUse)
      
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
    a.download = `transactions-${selectedMonth}-${selectedYear}.csv`
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
        <h1 className="page-title">{
          timePeriod === 'monthly' ? `${{
            'Jan': 'January',
            'Feb': 'February',
            'Mar': 'March',
            'Apr': 'April',
            'May': 'May',
            'Jun': 'June',
            'Jul': 'July',
            'Aug': 'August',
            'Sep': 'September',
            'Oct': 'October',
            'Nov': 'November',
            'Dec': 'December'
          }[selectedMonth]} ${selectedYear} Spending` :
          timePeriod === 'quarterly' ? `${selectedQuarter} ${selectedPeriodYear} Spending` :
          timePeriod === 'year' ? `${selectedPeriodYear} Spending` :
          'Spending'
        }</h1>

        {/* Time Period Selector */}
        <div className="time-period-selector">
          <button 
            className={`time-period-cell ${timePeriod === 'year' ? 'active' : ''}`}
            onClick={() => setTimePeriod('year')}
          >
            Year
          </button>
          <button 
            className={`time-period-cell ${timePeriod === 'quarterly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('quarterly')}
          >
            Quarterly
          </button>
          <button 
            className={`time-period-cell ${timePeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`time-period-cell ${timePeriod === 'custom' ? 'active' : ''}`}
            onClick={() => setTimePeriod('custom')}
            disabled
          >
            Custom
          </button>
        </div>

        {/* Income vs Spending Chart */}
        <IncomeVsSpendingChart 
          transactions={transactions} 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          selectedPeriodYear={selectedPeriodYear}
          timePeriod={timePeriod}
          onMonthSelect={(month, year) => {
            setSelectedMonth(month)
            setSelectedYear(year)
          }}
          onQuarterSelect={(quarter, year) => {
            setSelectedQuarter(quarter)
            setSelectedPeriodYear(year)
          }}
          onYearSelect={(year) => {
            setSelectedPeriodYear(year)
          }}
        />

        {/* Main Content - Split Layout */}
        <div className="spending-main">
          {/* Left Column - Transaction List */}
          <div className="transactions-column">
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
                <button className="add-transaction-btn" onClick={() => setShowAddModal(true)} title="Add Transaction">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="transactions-section">
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
                  const catColor = categoryColors[transaction.category] || '#ffb347'
                  return (
                    <div 
                      key={index} 
                      className="transaction-item" 
                      onClick={() => handleEditClick(transaction, actualIndex)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="transaction-icon" style={{ color: catColor }}>
                        <i className={`fa-solid ${transaction.icon}`}></i>
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-merchant">{transaction.merchant}</div>
                        <div className="transaction-meta">
                          <span className="transaction-date">{transaction.date}</span>
                          <span className="category-badge" style={{ color: catColor }}>{transaction.category}</span>
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
          </div>

          {/* Right Column - Charts & Insights */}
          <div className="insights-panel">
            {/* Category Breakdown Section */}
            <div className="insight-section">
              <div className="section-header-with-toggle">
                <h3 className="section-title">Category Breakdown</h3>
                <label className="ios-toggle" title="Include Bills & Utilities" style={{ '--toggle-active-color': palette.primary }}>
                  <input 
                    type="checkbox" 
                    checked={includeBillsInBreakdown} 
                    onChange={() => setIncludeBillsInBreakdown(!includeBillsInBreakdown)} 
                  />
                  <span className="ios-toggle-slider"></span>
                </label>
              </div>
              <div className="insight-card-new">
                <div className="category-breakdown-content">
                {(() => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const selectedIndex = months.indexOf(selectedMonth)
                  const previousMonth = selectedIndex > 0 ? months[selectedIndex - 1] : months[11]

                  const categoryTotals = {}
                  monthTransactions.forEach(t => {
                    if (t.type === 'expense' && categoryColors[t.category]) {
                      if (!includeBillsInBreakdown && t.category === 'Bills and Utilities') return
                      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
                    }
                  })

                  const previousMonthTotals = {}
                  transactions.forEach(t => {
                    if (t.type === 'expense' && t.date.includes(previousMonth) && categoryColors[t.category]) {
                      if (!includeBillsInBreakdown && t.category === 'Bills and Utilities') return
                      previousMonthTotals[t.category] = (previousMonthTotals[t.category] || 0) + t.amount
                    }
                  })

                  const categories = Object.keys(categoryColors).map(name => {
                    const amount = categoryTotals[name] || 0
                    const lastMonth = previousMonthTotals[name] || 0
                    const percentChange = lastMonth === 0 ? (amount > 0 ? 100 : 0) : Math.round(((amount - lastMonth) / lastMonth) * 100)
                    return { name, amount, color: categoryColors[name], percentChange, lastMonth }
                  }).filter(cat => cat.amount > 0)

                  const total = categories.reduce((sum, cat) => sum + cat.amount, 0)
                  const lastMonthTotal = categories.reduce((sum, cat) => sum + cat.lastMonth, 0)
                  const totalPercentChange = lastMonthTotal === 0 ? 0 : Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100)

                  const CustomTooltip = ({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const percentOfTotal = ((data.amount / total) * 100).toFixed(1)
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
                      )
                    }
                    return null
                  }

                  return (
                    <>
                      <div className="chart-container">
                        <div className="chart-center-label">
                          <span 
                            className={`center-amount font-numeric ${isHoveringChart ? 'expanded' : ''}`}
                            onMouseEnter={() => setIsHoveringChart(true)}
                            onMouseLeave={() => setIsHoveringChart(false)}
                          >
                            {isHoveringChart
                              ? `$${total.toFixed(2)}`
                              : total >= 1000
                                ? `$${(total / 1000).toFixed(1)}k`
                                : `$${Math.round(total)}`
                            }
                          </span>
                          <div className="center-meta">
                            <span className={`center-change font-numeric ${totalPercentChange >= 0 ? 'up' : 'down'}`}>
                              {Math.abs(totalPercentChange)}%
                            </span>
                            <span className="center-label">Total</span>
                          </div>
                        </div>
                        <ResponsiveContainer width={200} height={200}>
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

                      <div className="category-legend-new">
                        {categories.map((category, index) => (
                          <div key={index} className="legend-row">
                            <div className="legend-left">
                              <span className="legend-dot" style={{ backgroundColor: category.color }}></span>
                              <span className="legend-name">{category.name}</span>
                            </div>
                            <div className="legend-right">
                              <span className="legend-amount font-numeric">${category.amount.toFixed(2)}</span>
                              <span 
                                className={`legend-change font-numeric ${category.percentChange > 0 ? 'up' : category.percentChange < 0 ? 'down' : ''}`}
                                title={`$${Math.abs(category.amount - category.lastMonth).toFixed(2)} ${category.percentChange > 0 ? 'more' : 'less'} than last month`}
                              >
                                {Math.abs(category.percentChange)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
                </div>
              </div>
            </div>

            {/* Spending Trends Section */}
            <div className="insight-section">
              <div className="section-header-with-toggle">
                <h3 className="section-title">Spending Trends</h3>
                <label className="ios-toggle" title="Include Bills & Utilities" style={{ '--toggle-active-color': palette.primary }}>
                  <input 
                    type="checkbox" 
                    checked={includeBillsInTrends} 
                    onChange={() => setIncludeBillsInTrends(!includeBillsInTrends)} 
                  />
                  <span className="ios-toggle-slider"></span>
                </label>
              </div>
              <div className="insight-card-new">
                <div className="trends-content">
                {(() => {
                  // Get the last 6 months with transaction data
                  const allMonths = getLastNMonths(12)
                  
                  // Calculate totals for each month and filter to only those with data
                  const monthsWithData = allMonths
                    .map(monthInfo => {
                      const total = transactions
                        .filter(t => {
                          if (!matchesMonthYear(t.date, monthInfo.month, monthInfo.year)) return false
                          if (t.type !== 'expense') return false
                          if (!includeBillsInTrends && t.category === 'Bills and Utilities') return false
                          return true
                        })
                        .reduce((sum, t) => sum + t.amount, 0)
                      return { ...monthInfo, total }
                    })
                    .filter(m => m.total > 0)
                  
                  // Take only the last 6 months with data
                  const monthlyTotals = monthsWithData.slice(-6)

                  // Only show if there's data
                  if (monthlyTotals.length === 0) {
                    return (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#83827d' }}>
                        No spending data available
                      </div>
                    )
                  }

                  const maxTotal = Math.max(...monthlyTotals.map(m => m.total), 1)
                  const avgTotal = monthlyTotals.reduce((sum, m) => sum + m.total, 0) / monthlyTotals.length

                  // Get current year for display logic
                  const currentYear = getCurrentDate().getFullYear()

                  return (
                    <>
                      <div className="trends-stats">
                        <div className="trends-stat">
                          <span className="trends-stat-label">6-Month Avg</span>
                          <span className="trends-stat-value font-numeric">${avgTotal.toFixed(0)}</span>
                        </div>
                        <div className="trends-stat">
                          <span className="trends-stat-label">Highest</span>
                          <span className="trends-stat-value font-numeric">${maxTotal.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="trends-line-chart">
                        <ResponsiveContainer width="100%" height={120}>
                          <AreaChart data={monthlyTotals} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                            <XAxis 
                              dataKey="shortLabel" 
                              stroke="#888" 
                              tick={{ fill: '#888', fontSize: 11 }}
                              axisLine={{ stroke: '#333' }}
                              tickLine={false}
                            />
                            <Tooltip 
                              cursor={false}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div style={{
                                      background: '#2a2a2a',
                                      border: '1px solid #3a3a3a',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      color: '#e8e8e8',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}>
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
                              strokeWidth={2.5}
                              fill={palette.primary}
                              fillOpacity={0.15}
                              dot={false}
                              activeDot={(props) => {
                                const { cx, cy } = props
                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={6}
                                    fill={palette.primary}
                                    stroke="#191919"
                                    strokeWidth={2}
                                    style={{
                                      transition: 'cx 0.3s ease-out, cy 0.3s ease-out',
                                    }}
                                  />
                                )
                              }}
                              animationDuration={300}
                              animationEasing="ease-in-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )
                })()}
                </div>
              </div>
            </div>

            {/* Financial Insights Section */}
            <div className="insight-section">
              <h3 className="section-title">Financial Insights</h3>
              <div className="insight-card-new">
                <div className="insights-list-new">
                {(() => {
                  const insights = []
                  const currentMonthExpenses = monthTransactions.filter(t => t.type === 'expense')
                  const totalSpending = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
                  const categoryTotals = {}
                  
                  currentMonthExpenses.forEach(t => {
                    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
                  })

                  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
                  
                  if (topCategory) {
                    const categoryPercent = ((topCategory[1] / totalSpending) * 100).toFixed(0)
                    insights.push({
                      icon: 'fa-chart-pie',
                      type: 'info',
                      text: `${topCategory[0]} accounts for ${categoryPercent}% of your spending this month ($${topCategory[1].toFixed(2)}).`
                    })
                  }

                  const dailyAvg = (totalSpending / 30).toFixed(2)
                  insights.push({
                    icon: 'fa-calendar-day',
                    type: 'info',
                    text: `Your daily average spending is $${dailyAvg}. Consider setting a daily budget to track progress.`
                  })

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

                  const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                  if (income > 0) {
                    const savingsRate = ((income - totalSpending) / income * 100).toFixed(0)
                    if (savingsRate > 20) {
                      insights.push({
                        icon: 'fa-piggy-bank',
                        type: 'success',
                        text: `Excellent! You're saving ${savingsRate}% of your income.`
                      })
                    } else if (savingsRate > 0) {
                      insights.push({
                        icon: 'fa-chart-line',
                        type: 'info',
                        text: `You're saving ${savingsRate}% of your income. Aim for 20% or more.`
                      })
                    } else {
                      insights.push({
                        icon: 'fa-triangle-exclamation',
                        type: 'warning',
                        text: `Your spending exceeds your income this month. Review your expenses.`
                      })
                    }
                  }

                  return insights.slice(0, 4).map((insight, index) => (
                    <div key={index} className="insight-row">
                      <div className={`insight-icon-new ${insight.type}`}>
                        <i className={`fa-solid ${insight.icon}`}></i>
                      </div>
                      <p className="insight-text">{insight.text}</p>
                    </div>
                  ))
                })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpendingPage
