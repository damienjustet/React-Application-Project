import { useState } from 'react'
import './SpendingPage.css'
import SpendingHeader from '../components/SpendingHeader'
import IncomeVsSpendingChart from '../components/IncomeVsSpendingChart'
import CurrencyInput from '../components/CurrencyInput'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useData, EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryIcons, categoryColors } from '../context/DataContext'

function SpendingPage({ isExpanded, isHovering, toggleSidebar }) {
  // Constants
  const RECENT_TRANSACTIONS_LIMIT = 10

  // Context
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByMonth } = useData()

  // State
  const [isHoveringChart, setIsHoveringChart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Recent')
  const [selectedMonth, setSelectedMonth] = useState('Dec')
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

    if (activeFilter === 'Income') {
      return transaction.type === 'income'
    }
    
    return true
  }).slice(0, activeFilter === 'Recent' ? RECENT_TRANSACTIONS_LIMIT : undefined)

  // Handlers
  const handleAddTransaction = () => {
    if (newTransaction.merchant && newTransaction.amount > 0 && newTransaction.date) {
      const dateObj = new Date(newTransaction.date)
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
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
    // Convert date format from "Dec 10" to "2024-12-10" for date input
    const [monthStr, day] = transaction.date.split(' ')
    const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', 
                      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }
    const month = monthMap[monthStr]
    const year = new Date().getFullYear()
    const dateForInput = `${year}-${month}-${day.padStart(2, '0')}`
    
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
      const dateObj = new Date(editTransaction.date)
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
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
              <button className="add-transaction-btn" onClick={() => setShowAddModal(true)}>
                <i className="fa-solid fa-plus"></i>
                Add Transaction
              </button>
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
                      <div className="transaction-amount">${transaction.amount.toFixed(2)}</div>
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
                          fontSize: '0.8125rem'
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
                              onMouseEnter={() => setIsHoveringChart(true)}
                              onMouseLeave={() => setIsHoveringChart(false)}
                            >
                              {isHoveringChart ? `$${total.toFixed(2)}` : `$${(total / 1000).toFixed(1)}k`}
                            </div>
                            <div className="chart-bottom-row">
                              <div className={`chart-percent-change ${totalPercentChange >= 0 ? 'increase' : 'decrease'}`}>
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
                                <span className="category-amount">${category.amount.toFixed(2)}</span>
                                <span 
                                  className={`category-percent ${category.percentChange > 0 ? 'increase' : category.percentChange < 0 ? 'decrease' : ''}`}
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
