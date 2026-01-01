import { useState } from 'react'
import './SavingsPage.css'
import SpendingHeader from '../components/SpendingHeader'
import { useData } from '../context/DataContext'

function SavingsPage({ isExpanded, isHovering, toggleSidebar }) {
  const { savingsGoals, setSavingsGoals } = useData()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [newGoal, setNewGoal] = useState({ name: '', target: 0, current: 0, color: '#4ecdc4', icon: 'fa-piggy-bank' })

  const goalColors = ['#4ecdc4', '#aa96da', '#ff6b6b', '#95e1d3', '#f38181', '#ffd93d', '#6aa84f']
  const goalIcons = ['fa-piggy-bank', 'fa-plane', 'fa-car', 'fa-house', 'fa-umbrella', 'fa-graduation-cap', 'fa-ring', 'fa-laptop', 'fa-heart']

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.target > 0) {
      const goal = {
        id: Date.now(),
        ...newGoal
      }
      setSavingsGoals([...savingsGoals, goal])
      setNewGoal({ name: '', target: 0, current: 0, color: '#4ecdc4', icon: 'fa-piggy-bank' })
      setShowAddModal(false)
    }
  }

  const handleEditClick = (goal) => {
    setEditingGoal(goal)
    setShowEditModal(true)
  }

  const handleUpdateGoal = () => {
    setSavingsGoals(savingsGoals.map(g => g.id === editingGoal.id ? editingGoal : g))
    setShowEditModal(false)
    setEditingGoal(null)
  }

  const handleDeleteGoal = () => {
    setSavingsGoals(savingsGoals.filter(g => g.id !== editingGoal.id))
    setShowEditModal(false)
    setEditingGoal(null)
  }

  const handleAddFunds = (goalId, amount) => {
    setSavingsGoals(savingsGoals.map(g => 
      g.id === goalId ? { ...g, current: Math.min(g.current + amount, g.target) } : g
    ))
  }

  return (
    <div className="savings-page">
      <SpendingHeader 
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
      />

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Savings Goal</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Goal Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Target Amount</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal({...newGoal, target: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Current Savings</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={newGoal.current || ''}
                  onChange={(e) => setNewGoal({...newGoal, current: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {goalIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newGoal.icon === icon ? 'selected' : ''}`}
                      onClick={() => setNewGoal({...newGoal, icon})}
                    >
                      <i className={`fa-solid ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {goalColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newGoal.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewGoal({...newGoal, color})}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleAddGoal}>Add Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Savings Goal</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Goal Name</label>
                <input 
                  type="text" 
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Target Amount</label>
                <input 
                  type="number" 
                  value={editingGoal.target}
                  onChange={(e) => setEditingGoal({...editingGoal, target: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Current Savings</label>
                <input 
                  type="number" 
                  value={editingGoal.current}
                  onChange={(e) => setEditingGoal({...editingGoal, current: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {goalIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${editingGoal.icon === icon ? 'selected' : ''}`}
                      onClick={() => setEditingGoal({...editingGoal, icon})}
                    >
                      <i className={`fa-solid ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {goalColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${editingGoal.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingGoal({...editingGoal, color})}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-delete" onClick={handleDeleteGoal}>
                <i className="fa-solid fa-trash"></i>
                Delete
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-add" onClick={handleUpdateGoal}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="savings-content">
        <div className="savings-header-section">
          <h1 className="page-title">Savings</h1>
          <button className="action-btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fa-solid fa-plus"></i>
            Add Goal
          </button>
        </div>

        {/* Overview Card */}
        <div className="overview-card">
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-label">Total Saved</span>
              <span className="stat-value">${totalSaved.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Goals</span>
              <span className="stat-value">${totalTarget.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Overall Progress</span>
              <span className="stat-value">{overallProgress.toFixed(0)}%</span>
            </div>
          </div>
          <div className="overview-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="goals-grid">
          {savingsGoals.map(goal => {
            const progress = (goal.current / goal.target) * 100
            const remaining = goal.target - goal.current
            const monthlyTarget = (remaining / 12).toFixed(2) // Assuming 12 month timeline

            return (
              <div key={goal.id} className="goal-card" onClick={() => handleEditClick(goal)}>
                <div className="goal-header">
                  <div className="goal-icon" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                    <i className={`fa-solid ${goal.icon}`}></i>
                  </div>
                  <div className="goal-info">
                    <h3>{goal.name}</h3>
                    <p className="goal-target">${goal.target.toFixed(2)} goal</p>
                  </div>
                </div>
                
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: goal.color 
                      }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    <span className="current-amount">${goal.current.toFixed(2)}</span>
                    <span className="progress-percent">{progress.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="goal-insights">
                  <div className="insight-row">
                    <span className="insight-label">Remaining</span>
                    <span className="insight-value">${remaining.toFixed(2)}</span>
                  </div>
                  <div className="insight-row">
                    <span className="insight-label">Save/month (12mo)</span>
                    <span className="insight-value">${monthlyTarget}</span>
                  </div>
                </div>

                {progress < 100 && (
                  <button 
                    className="quick-add-btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      const amount = parseFloat(prompt(`Add funds to ${goal.name}:`, '100'))
                      if (amount && amount > 0) handleAddFunds(goal.id, amount)
                    }}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Quick Add
                  </button>
                )}

                {progress >= 100 && (
                  <div className="goal-complete">
                    <i className="fa-solid fa-circle-check"></i>
                    Goal Achieved!
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {savingsGoals.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-piggy-bank"></i>
            <h3>No Savings Goals Yet</h3>
            <p>Start building your financial future by creating your first savings goal.</p>
            <button className="add-goal-btn" onClick={() => setShowAddModal(true)}>
              <i className="fa-solid fa-plus"></i>
              Add Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SavingsPage
