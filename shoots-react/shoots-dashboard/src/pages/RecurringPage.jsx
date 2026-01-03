import { useState, useMemo } from 'react'
import './RecurringPage.css'
import SpendingHeader from '../components/SpendingHeader'
import { useData, EXPENSE_CATEGORIES, categoryIcons } from '../context/DataContext'
import { detectRecurringTransactions, calculateMonthlyTotal, calculateYearlyCost } from '../utils/recurringDetection'

function RecurringPage({ isExpanded, toggleSidebar }) {
  const { recurringBills, setRecurringBills, transactions } = useData()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [viewMode, setViewMode] = useState('all') // 'all', 'manual', 'detected'
  const [expandedItems, setExpandedItems] = useState(new Set())
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

  // Filter based on view mode
  const displayedItems = useMemo(() => {
    if (viewMode === 'manual') return allRecurring.filter(r => r.isManual)
    if (viewMode === 'detected') return allRecurring.filter(r => r.isAutoDetected)
    return allRecurring
  }, [allRecurring, viewMode])

  // Calculate totals
  const monthlyTotal = useMemo(() => calculateMonthlyTotal(allRecurring), [allRecurring])
  const detectedCount = detectedRecurring.length
  const unusedCount = allRecurring.filter(r => r.possiblyUnused).length
  const priceIncreases = allRecurring.filter(r => r.hasIncrease).length

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const convertToManual = (detectedItem) => {
    const bill = {
      id: Date.now(),
      name: detectedItem.merchant,
      amount: detectedItem.averageAmount,
      dueDate: new Date(detectedItem.nextCharge + ' 2024').getDate().toString(),
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

  const handleEditClick = (bill) => {
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
    setRecurringBills(recurringBills.filter(b => b.id !== editingBill.id))
    setShowEditModal(false)
    setEditingBill(null)
  }

  const togglePaidStatus = (billId) => {
    setRecurringBills(recurringBills.map(b => 
      b.id === billId ? { ...b, isPaid: !b.isPaid } : b
    ))
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date().getDate()
    const due = parseInt(dueDate)
    if (due >= today) {
      return due - today
    } else {
      // Next month
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      return daysInMonth - today + due
    }
  }

  return (
    <div className="recurring-page">
      <SpendingHeader 
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
      />

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Recurring Bill</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Bill Name</label>
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
              <button className="btn-add" onClick={handleAddBill}>Add Bill</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && editingBill && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Recurring Bill</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Bill Name</label>
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
                Delete
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-add" onClick={handleUpdateBill}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="recurring-content">
        <div className="recurring-header-section">
          <div>
            <h1 className="page-title">Recurring & Subscriptions</h1>
            <p className="page-subtitle">Track and manage your recurring expenses</p>
          </div>
          <button className="action-btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fa-solid fa-plus"></i>
            Add Manual Bill
          </button>
        </div>

        {/* Smart Insights Banner */}
        <div className="insights-banner">
          <div className="insight-item">
            <div className="insight-value font-numeric">${monthlyTotal.toFixed(2)}</div>
            <div className="insight-label">Monthly Total</div>
          </div>
          <div className="insight-divider"></div>
          <div className="insight-item">
            <div className="insight-value font-numeric">{detectedCount}</div>
            <div className="insight-label">Auto-Detected</div>
          </div>
          <div className="insight-divider"></div>
          <div className="insight-item">
            <div className="insight-value font-numeric" style={{ color: unusedCount > 0 ? '#ffd93d' : '#6aa84f' }}>
              {unusedCount}
            </div>
            <div className="insight-label">Possibly Unused</div>
          </div>
          <div className="insight-divider"></div>
          <div className="insight-item">
            <div className="insight-value font-numeric" style={{ color: priceIncreases > 0 ? '#ff6b6b' : '#6aa84f' }}>
              {priceIncreases}
            </div>
            <div className="insight-label">Price Increases</div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="view-tabs">
          <button 
            className={`view-tab ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            All ({allRecurring.length})
          </button>
          <button 
            className={`view-tab ${viewMode === 'manual' ? 'active' : ''}`}
            onClick={() => setViewMode('manual')}
          >
            Manual ({recurringBills.length})
          </button>
          <button 
            className={`view-tab ${viewMode === 'detected' ? 'active' : ''}`}
            onClick={() => setViewMode('detected')}
          >
            Auto-Detected ({detectedRecurring.length})
          </button>
        </div>

        {/* Recurring Items Grid - Card Style */}
        <div className="recurring-grid">
          {displayedItems.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>No recurring bills found</p>
              <span>Add a bill manually or we'll auto-detect them from your transactions</span>
            </div>
          )}

          {displayedItems.map((item) => {
            const isExpanded = expandedItems.has(item.id)
            const yearlyCost = calculateYearlyCost(item)
            
            return (
              <div 
                key={item.id} 
                className={`recurring-card ${isExpanded ? 'expanded' : ''} ${item.isPaid ? 'paid' : ''} ${item.possiblyUnused ? 'unused' : ''} ${item.isAutoDetected ? 'auto-detected' : ''}`}
              >
                <div className="card-header">
                  <div className="card-icon-wrapper" style={{ backgroundColor: item.possiblyUnused ? 'rgba(255, 217, 61, 0.15)' : 'rgba(131, 130, 125, 0.15)' }}>
                    <i className={`fa-solid ${item.icon}`} style={{ color: item.possiblyUnused ? '#ffd93d' : '#83827d' }}></i>
                  </div>
                  
                  <div className="card-main-info">
                    <div className="card-title">
                      {item.name || item.merchant}
                      {item.isAutoDetected && (
                        <span className="auto-badge">
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="card-category">{item.category}</div>
                  </div>

                  <div className="card-amount">
                    <div className="amount-value font-numeric">${(item.averageAmount || item.amount).toFixed(2)}</div>
                    <div className="amount-frequency">{item.frequency}</div>
                  </div>
                </div>

                {/* Badges Row */}
                {(item.possiblyUnused || item.hasIncrease) && (
                  <div className="card-badges">
                    {item.possiblyUnused && (
                      <span className="warning-badge">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        Possibly Unused
                      </span>
                    )}
                    {item.hasIncrease && (
                      <span className="increase-badge">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        Price increased by <span className="font-numeric">${item.priceChange.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer with Actions */}
                <div className="card-footer">
                  <div className="card-details">
                    {item.isAutoDetected && (
                      <span className="detail-text">
                        <i className="fa-solid fa-chart-line"></i>
                        {item.occurrences} charges detected
                      </span>
                    )}
                    {item.nextCharge && (
                      <span className="detail-text">
                        <i className="fa-solid fa-calendar"></i>
                        Next: {item.nextCharge}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="detail-text">
                        <i className="fa-solid fa-calendar"></i>
                        Due: Day {item.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="card-actions">
                    {item.isManual && (
                      <>
                        <button 
                          className={`action-btn ${item.isPaid ? 'paid' : ''}`}
                          onClick={(e) => { e.stopPropagation(); togglePaidStatus(item.id); }}
                          title={item.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                        >
                          <i className={`fa-solid ${item.isPaid ? 'fa-circle-check' : 'fa-circle'}`}></i>
                        </button>
                        <button 
                          className="action-btn"
                          onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      </>
                    )}
                    {item.isAutoDetected && (
                      <button 
                        className="action-btn track-btn"
                        onClick={(e) => { e.stopPropagation(); convertToManual(item); }}
                        title="Add to tracked bills"
                      >
                        <i className="fa-solid fa-plus"></i>
                        Track This
                      </button>
                    )}
                    <button 
                      className="expand-btn"
                      onClick={() => toggleExpanded(item.id)}
                      title={isExpanded ? 'Show less' : 'Show more'}
                    >
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="card-expanded">
                    <div className="expanded-row">
                      <div className="expanded-stat">
                        <span className="stat-label">Yearly Cost</span>
                        <span className="stat-value font-numeric">${yearlyCost.toFixed(2)}</span>
                      </div>
                      {item.lastCharge && (
                        <div className="expanded-stat">
                          <span className="stat-label">Last Charge</span>
                          <span className="stat-value">{item.lastCharge}</span>
                        </div>
                      )}
                      {item.averageAmount && item.amount !== item.averageAmount && (
                        <div className="expanded-stat">
                          <span className="stat-label">Amount Range</span>
                          <span className="stat-value font-numeric">${Math.min(...item.transactions.map(t => t.amount)).toFixed(2)} - ${Math.max(...item.transactions.map(t => t.amount)).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    {item.transactions && item.transactions.length > 0 && (
                      <div className="transaction-history">
                        <div className="history-title">Recent Transactions</div>
                        <div className="history-list">
                          {item.transactions.slice(0, 5).map((t, idx) => (
                            <div key={idx} className="history-item">
                              <span className="history-date">{t.date}</span>
                              <span className="history-merchant">{t.merchant}</span>
                              <span className="history-amount font-numeric">${t.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RecurringPage