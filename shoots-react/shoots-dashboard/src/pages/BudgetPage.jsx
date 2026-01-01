import { useState, useEffect } from 'react'
import './BudgetPage.css'
import SpendingHeader from '../components/SpendingHeader'
import { useData, categoryColors } from '../context/DataContext'

function BudgetPage({ isExpanded, isHovering, toggleSidebar }) {
  const { budgets, setBudgets, transactions } = useData()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('Dec')

  // Calculate spent amounts from transactions
  useEffect(() => {
    const monthTransactions = transactions.filter(t => 
      t.date.includes(selectedMonth) && t.type === 'expense'
    )

    const updatedBudgets = budgets.map(budget => {
      const spent = monthTransactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)
      return { ...budget, spent }
    })

    // Only update if spent values actually changed
    const hasChanged = updatedBudgets.some((budget, index) => 
      budget.spent !== budgets[index].spent
    )

    if (hasChanged) {
      setBudgets(updatedBudgets)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, transactions])

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const onTrackCount = budgets.filter(b => b.spent <= b.limit).length
  const overBudgetCount = budgets.filter(b => b.spent > b.limit).length

  const handleEditClick = (budget) => {
    setEditingBudget({...budget})
    setShowEditModal(true)
  }

  const handleUpdateBudget = () => {
    setBudgets(budgets.map(b => 
      b.category === editingBudget.category ? editingBudget : b
    ))
    setShowEditModal(false)
    setEditingBudget(null)
  }

  const getBudgetStatus = (spent, limit) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return 'over'
    if (percentage >= 80) return 'warning'
    return 'good'
  }

  return (
    <div className="budget-page">
      <SpendingHeader 
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
      />

      {/* Edit Budget Modal */}
      {showEditModal && editingBudget && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Budget - {editingBudget.category}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Monthly Budget Limit</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={editingBudget.limit || ''}
                  onChange={(e) => setEditingBudget({...editingBudget, limit: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="budget-preview">
                <div className="preview-row">
                  <span>Current Spending:</span>
                  <span className="preview-value">${editingBudget.spent.toFixed(2)}</span>
                </div>
                <div className="preview-row">
                  <span>New Limit:</span>
                  <span className="preview-value">${(editingBudget.limit || 0).toFixed(2)}</span>
                </div>
                <div className="preview-row">
                  <span>Remaining:</span>
                  <span className={`preview-value ${(editingBudget.limit - editingBudget.spent) < 0 ? 'over' : ''}`}>
                    ${((editingBudget.limit || 0) - editingBudget.spent).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleUpdateBudget}>Update Budget</button>
            </div>
          </div>
        </div>
      )}

      <div className="budget-content">
        <div className="budget-header-section">
          <div>
            <h1 className="page-title">Budget</h1>
            <p className="page-subtitle">Track your spending against your monthly budgets</p>
          </div>
          <select 
            className="month-selector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="Dec">December</option>
            <option value="Nov">November</option>
            <option value="Oct">October</option>
          </select>
        </div>

        <div className="overview-card budget-overview">
          <div className="overview-main">
            <div className="overview-stat">
              <span className="stat-label">Total Budget</span>
              <span className="stat-value">${totalBudget.toFixed(2)}</span>
            </div>
            <div className="overview-stat">
              <span className="stat-label">Spent</span>
              <span className="stat-value spent">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="overview-stat">
              <span className="stat-label">Remaining</span>
              <span className={`stat-value ${totalRemaining < 0 ? 'over' : 'remaining'}`}>
                ${Math.abs(totalRemaining).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="overview-progress">
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${overallProgress >= 100 ? 'over' : overallProgress >= 80 ? 'warning' : ''}`}
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
            <div className="progress-stats">
              <span>{overallProgress.toFixed(0)}% of budget used</span>
              <div className="budget-badges">
                {onTrackCount > 0 && (
                  <span className="badge good">
                    <i className="fa-solid fa-circle-check"></i>
                    {onTrackCount} on track
                  </span>
                )}
                {overBudgetCount > 0 && (
                  <span className="badge over">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {overBudgetCount} over budget
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="budgets-section">
          <h2>Category Budgets</h2>
          <div className="budgets-grid">
            {budgets.map(budget => {
              const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
              const remaining = budget.limit - budget.spent
              const status = getBudgetStatus(budget.spent, budget.limit)

              return (
                <div 
                  key={budget.category} 
                  className={`budget-card ${status}`}
                  onClick={() => handleEditClick(budget)}
                >
                  <div className="budget-card-header">
                    <div className="budget-category">
                      <div 
                        className="category-dot" 
                        style={{ backgroundColor: budget.color }}
                      />
                      <h3>{budget.category}</h3>
                    </div>
                    {status === 'over' && (
                      <div className="status-badge over">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                      </div>
                    )}
                    {status === 'warning' && (
                      <div className="status-badge warning">
                        <i className="fa-solid fa-exclamation"></i>
                      </div>
                    )}
                    {status === 'good' && (
                      <div className="status-badge good">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                    )}
                  </div>

                  <div className="budget-amounts">
                    <div className="amount-row">
                      <span className="amount-label">Spent</span>
                      <span className="amount-value spent">${budget.spent.toFixed(2)}</span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">Budget</span>
                      <span className="amount-value">${budget.limit.toFixed(2)}</span>
                    </div>
                    <div className="amount-row highlight">
                      <span className="amount-label">
                        {remaining >= 0 ? 'Remaining' : 'Over by'}
                      </span>
                      <span className={`amount-value ${remaining < 0 ? 'over' : 'remaining'}`}>
                        ${Math.abs(remaining).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar-fill ${status}`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: budget.color
                        }}
                      />
                    </div>
                    <span className="progress-text">{percentage.toFixed(0)}% used</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insights Section */}
        <div className="budget-insights">
          <h2>Budget Insights</h2>
          <div className="insights-grid">
            {budgets
              .filter(b => b.spent > b.limit * 0.8)
              .map(budget => {
                const percentage = (budget.spent / budget.limit) * 100
                return (
                  <div key={budget.category} className="insight-card">
                    <i className={`fa-solid ${percentage >= 100 ? 'fa-triangle-exclamation' : 'fa-exclamation'} insight-icon ${percentage >= 100 ? 'over' : 'warning'}`}></i>
                    <div className="insight-content">
                      <h4>{budget.category}</h4>
                      <p>
                        {percentage >= 100 
                          ? `You've exceeded your ${budget.category} budget by $${(budget.spent - budget.limit).toFixed(2)}.`
                          : `You're at ${percentage.toFixed(0)}% of your ${budget.category} budget. Consider reducing spending.`
                        }
                      </p>
                    </div>
                  </div>
                )
              })}
            
            {budgets.filter(b => b.spent > b.limit * 0.8).length === 0 && (
              <div className="insight-card success">
                <i className="fa-solid fa-circle-check insight-icon good"></i>
                <div className="insight-content">
                  <h4>Great Job!</h4>
                  <p>All your budgets are on track. Keep up the good spending habits!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetPage
