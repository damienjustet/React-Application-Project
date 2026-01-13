import { useState, useMemo, useCallback } from 'react'
import './RecurringPage.css'
import SpendingHeader from '../components/SpendingHeader'
import { useData, EXPENSE_CATEGORIES, categoryIcons } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { detectRecurringTransactions, calculateMonthlyTotal, calculateYearlyCost } from '../utils/recurringDetection'

function RecurringPage({ isExpanded, toggleSidebar }) {
  const { recurringBills, setRecurringBills, transactions } = useData()
  const { themeColor } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [viewMode, setViewMode] = useState('upcoming') // 'upcoming', 'all', 'calendar'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('due') // 'due', 'name', 'amount'
  const [confetti, setConfetti] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [newBill, setNewBill] = useState({ 
    name: '', 
    amount: 0, 
    dueDate: '1', 
    category: 'Bills and Utilities', 
    frequency: 'monthly',
    icon: 'fa-file-invoice-dollar',
    isPaid: false
  })

  const frequencies = ['weekly', 'monthly', 'quarterly', 'yearly']

  // Calculate days until due for an item
  const getDaysUntilDue = useCallback((item) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let dueDate
    if (item.dueDate) {
      const due = parseInt(item.dueDate)
      dueDate = new Date(today.getFullYear(), today.getMonth(), due)
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1)
      }
    } else if (item.nextCharge) {
      dueDate = new Date(item.nextCharge + ' 2026')
    } else {
      return 999
    }
    
    const diffTime = dueDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [])

  // Get actual due date for an item
  const getDueDate = useCallback((item) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (item.dueDate) {
      const due = parseInt(item.dueDate)
      const dueDate = new Date(today.getFullYear(), today.getMonth(), due)
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1)
      }
      return dueDate
    } else if (item.nextCharge) {
      return new Date(item.nextCharge + ' 2026')
    }
    return null
  }, [])

  // Auto-detect recurring transactions
  const detectedRecurring = useMemo(() => 
    detectRecurringTransactions(transactions), 
    [transactions]
  )

  // Combine manual and detected bills
  const allRecurring = useMemo(() => {
    const manual = recurringBills.map(b => ({ ...b, isManual: true }))
    const detected = detectedRecurring.filter(d => 
      !recurringBills.some(b => 
        b.name.toLowerCase().includes(d.merchant.toLowerCase()) ||
        d.merchant.toLowerCase().includes(b.name.toLowerCase())
      )
    )
    return [...manual, ...detected]
  }, [recurringBills, detectedRecurring])

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allRecurring
    const query = searchQuery.toLowerCase()
    return allRecurring.filter(item => 
      (item.name || item.merchant || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query)
    )
  }, [allRecurring, searchQuery])

  // Sort items
  const sortedItems = useMemo(() => {
    const items = [...filteredItems]
    switch (sortBy) {
      case 'name':
        return items.sort((a, b) => (a.name || a.merchant || '').localeCompare(b.name || b.merchant || ''))
      case 'amount':
        return items.sort((a, b) => (b.averageAmount || b.amount) - (a.averageAmount || a.amount))
      case 'due':
      default:
        return items.sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b))
    }
  }, [filteredItems, sortBy, getDaysUntilDue])

  // Upcoming view sections
  const upcomingNext7Days = useMemo(() => 
    sortedItems.filter(item => {
      const days = getDaysUntilDue(item)
      return days >= 0 && days <= 7
    }), [sortedItems, getDaysUntilDue])

  const upcomingLaterThisMonth = useMemo(() => 
    sortedItems.filter(item => {
      const days = getDaysUntilDue(item)
      const dueDate = getDueDate(item)
      const today = new Date()
      return days > 7 && dueDate && dueDate.getMonth() === today.getMonth()
    }), [sortedItems, getDaysUntilDue, getDueDate])

  // Calculate totals
  const yearlyTotal = useMemo(() => 
    allRecurring.reduce((sum, item) => sum + calculateYearlyCost(item), 0), 
    [allRecurring]
  )

  // Trigger themed confetti
  const triggerConfetti = useCallback((amount) => {
    setConfetti({ amount, color: themeColor })
    setTimeout(() => setConfetti(null), 2000)
  }, [themeColor])

  const convertToManual = (detectedItem) => {
    const bill = {
      id: Date.now(),
      name: detectedItem.merchant,
      amount: detectedItem.averageAmount,
      dueDate: new Date(detectedItem.nextCharge + ' 2026').getDate().toString(),
      category: detectedItem.category,
      frequency: detectedItem.frequency,
      icon: detectedItem.icon,
      isPaid: false
    }
    setRecurringBills([...recurringBills, bill])
  }

  const handleAddBill = () => {
    if (newBill.name && newBill.amount > 0) {
      const bill = {
        id: Date.now(),
        ...newBill,
        icon: categoryIcons[newBill.category] || 'fa-file-invoice-dollar'
      }
      setRecurringBills([...recurringBills, bill])
      setNewBill({ 
        name: '', 
        amount: 0, 
        dueDate: '1', 
        category: 'Bills and Utilities', 
        frequency: 'monthly',
        icon: 'fa-file-invoice-dollar',
        isPaid: false
      })
      setShowAddModal(false)
    }
  }

  const handleEditClick = (bill, e) => {
    e.stopPropagation()
    setEditingBill({...bill})
    setShowEditModal(true)
  }

  const handleUpdateBill = () => {
    setRecurringBills(recurringBills.map(b => 
      b.id === editingBill.id ? { ...editingBill, icon: categoryIcons[editingBill.category] || editingBill.icon } : b
    ))
    setShowEditModal(false)
    setEditingBill(null)
  }

  const handleDeleteBill = () => {
    const yearlySavings = calculateYearlyCost(editingBill)
    setRecurringBills(recurringBills.filter(b => b.id !== editingBill.id))
    setShowEditModal(false)
    setEditingBill(null)
    triggerConfetti(yearlySavings)
  }

  // Format due text
  const formatDueText = (item) => {
    const days = getDaysUntilDue(item)
    if (days < 0) return `${Math.abs(days)} days ago`
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `in ${days} days`
  }

  // Calendar helpers
  const getCalendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const billsOnDay = allRecurring.filter(item => {
        const dueDate = getDueDate(item)
        return dueDate && 
          dueDate.getDate() === i && 
          dueDate.getMonth() === month &&
          dueDate.getFullYear() === year
      })
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        date,
        bills: billsOnDay,
        isToday: new Date().toDateString() === date.toDateString()
      })
    }
    
    return days
  }, [calendarMonth, allRecurring, getDueDate])

  const navigateMonth = (direction) => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  // Render a subscription row
  const renderSubscriptionRow = (item) => {
    const daysUntil = getDaysUntilDue(item)
    const isOverdue = daysUntil < 0
    
    return (
      <div key={item.id} className={`subscription-row ${isOverdue ? 'overdue' : ''}`}>
        <div className="subscription-info">
          <div className="subscription-icon">
            <i className={`fa-solid ${item.icon}`}></i>
          </div>
          <div className="subscription-details">
            <span className="subscription-name">{item.name || item.merchant}</span>
            <span className="subscription-frequency">{item.frequency}</span>
          </div>
        </div>
        
        <div className="subscription-due">
          <span className={`due-text ${isOverdue ? 'overdue' : daysUntil <= 3 ? 'soon' : ''}`}>
            {formatDueText(item)}
          </span>
        </div>
        
        <div className="subscription-amount">
          <span className="amount font-numeric">${(item.averageAmount || item.amount).toFixed(2)}</span>
        </div>
        
        <div className="subscription-actions">
          {item.isAutoDetected && (
            <button 
              className="action-icon-btn track"
              onClick={(e) => { e.stopPropagation(); convertToManual(item); }}
              title="Track this subscription"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          )}
          {item.isManual && (
            <button 
              className="action-icon-btn"
              onClick={(e) => handleEditClick(item, e)}
              title="More options"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="recurring-page">
      <SpendingHeader 
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
      />

      {/* Confetti overlay */}
      {confetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                '--x': `${Math.random() * 100}vw`,
                '--delay': `${Math.random() * 0.5}s`,
                '--rotation': `${Math.random() * 360}deg`,
                backgroundColor: confetti.color,
                opacity: 0.7 + Math.random() * 0.3
              }}
            />
          ))}
          <div className="savings-toast">
            <i className="fa-solid fa-party-horn"></i>
            You'll save <span className="font-numeric">${confetti.amount.toFixed(2)}</span>/year!
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Subscription</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Netflix"
                  value={newBill.name}
                  onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={newBill.amount || ''}
                  onChange={(e) => setNewBill({...newBill, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Due Date (Day of Month)</label>
                <input 
                  type="number" 
                  min="1"
                  max="31"
                  placeholder="1"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newBill.category}
                  onChange={(e) => setNewBill({...newBill, category: e.target.value})}
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select 
                  value={newBill.frequency}
                  onChange={(e) => setNewBill({...newBill, frequency: e.target.value})}
                >
                  {frequencies.map(freq => (
                    <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleAddBill}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && editingBill && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Subscription</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editingBill.name}
                  onChange={(e) => setEditingBill({...editingBill, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  value={editingBill.amount}
                  onChange={(e) => setEditingBill({...editingBill, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Due Date (Day of Month)</label>
                <input 
                  type="number" 
                  min="1"
                  max="31"
                  value={editingBill.dueDate}
                  onChange={(e) => setEditingBill({...editingBill, dueDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={editingBill.category}
                  onChange={(e) => setEditingBill({...editingBill, category: e.target.value})}
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select 
                  value={editingBill.frequency}
                  onChange={(e) => setEditingBill({...editingBill, frequency: e.target.value})}
                >
                  {frequencies.map(freq => (
                    <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-delete" onClick={handleDeleteBill}>
                <i className="fa-solid fa-trash"></i>
                Cancel Subscription
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-add" onClick={handleUpdateBill}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="recurring-content">
        {/* Search and Controls */}
        <div className="recurring-toolbar">
          <div className="search-container">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text"
              placeholder="Search bills and subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <button className="add-subscription-btn" onClick={() => setShowAddModal(true)}>
              <i className="fa-solid fa-plus"></i>
              Add
            </button>
            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="due">Sort by due date</option>
                <option value="name">Sort by name</option>
                <option value="amount">Sort by amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <span className="subscription-count">{allRecurring.length} SUBSCRIPTIONS</span>
          <span className="yearly-total">You spend <strong className="font-numeric">${yearlyTotal.toFixed(0)}</strong>/yearly</span>
        </div>

        {/* View Tabs */}
        <div className="view-tabs-bar">
          <button 
            className={`view-tab-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
            onClick={() => setViewMode('upcoming')}
          >
            <i className="fa-solid fa-clock"></i>
            Upcoming
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            <i className="fa-solid fa-list"></i>
            All Recurring
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <i className="fa-solid fa-calendar"></i>
            Calendar
          </button>
        </div>

        {/* Upcoming View */}
        {viewMode === 'upcoming' && (
          <div className="upcoming-view">
            {/* Next 7 Days Section */}
            <div className="upcoming-section">
              <h3 className="section-title">Next 7 Days</h3>
              {upcomingNext7Days.length === 0 ? (
                <div className="empty-section">No bills due in the next 7 days</div>
              ) : (
                <div className="subscription-list">
                  <div className="list-header">
                    <span className="header-name">Name/Frequency</span>
                    <span className="header-due">Due</span>
                    <span className="header-amount">Amount</span>
                    <span className="header-actions"></span>
                  </div>
                  {upcomingNext7Days.map(renderSubscriptionRow)}
                </div>
              )}
            </div>

            {/* Later This Month Section */}
            <div className="upcoming-section">
              <h3 className="section-title">Later This Month</h3>
              {upcomingLaterThisMonth.length === 0 ? (
                <div className="empty-section">No other bills due this month</div>
              ) : (
                <div className="subscription-list">
                  <div className="list-header">
                    <span className="header-name">Name/Frequency</span>
                    <span className="header-due">Due</span>
                    <span className="header-amount">Amount</span>
                    <span className="header-actions"></span>
                  </div>
                  {upcomingLaterThisMonth.map(renderSubscriptionRow)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Recurring View */}
        {viewMode === 'all' && (
          <div className="all-recurring-view">
            {sortedItems.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-receipt"></i>
                <p>No subscriptions found</p>
                <span>Add a subscription or we'll auto-detect them from your transactions</span>
              </div>
            ) : (
              <div className="subscription-list">
                <div className="list-header">
                  <span className="header-name">Name/Frequency</span>
                  <span className="header-due">Due</span>
                  <span className="header-amount">Amount</span>
                  <span className="header-actions"></span>
                </div>
                {sortedItems.map(renderSubscriptionRow)}
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="calendar-view">
            <div className="calendar-header">
              <button className="calendar-nav" onClick={() => navigateMonth(-1)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <h3 className="calendar-month">
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button className="calendar-nav" onClick={() => navigateMonth(1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {getCalendarDays.map((dayInfo, index) => (
                  <div 
                    key={index} 
                    className={`calendar-day ${dayInfo.isCurrentMonth ? '' : 'other-month'} ${dayInfo.isToday ? 'today' : ''} ${dayInfo.bills?.length > 0 ? 'has-bills' : ''}`}
                  >
                    {dayInfo.day && (
                      <>
                        <span className="day-number">{dayInfo.day}</span>
                        {dayInfo.bills?.length > 0 && (
                          <div className="day-bills">
                            {dayInfo.bills.slice(0, 2).map((bill, i) => (
                              <div key={i} className="day-bill-item">
                                <span className="bill-name">{bill.name || bill.merchant}</span>
                                <span className="bill-amount font-numeric">${(bill.averageAmount || bill.amount).toFixed(0)}</span>
                              </div>
                            ))}
                            {dayInfo.bills.length > 2 && (
                              <div className="day-bill-more">+{dayInfo.bills.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecurringPage
