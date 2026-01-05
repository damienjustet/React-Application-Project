import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchModal.css'
import { useData, categoryIcons } from '../context/DataContext'

function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { transactions, savingsGoals, recurringBills, budgets } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // Quick actions - shortcuts for common tasks
  const suggestedActions = [
    { type: 'action', title: 'Add New Transaction', path: '/spending', icon: 'fa-plus-circle', subtitle: 'Log a new expense or income' },
    { type: 'action', title: 'Create Savings Goal', path: '/savings', icon: 'fa-piggy-bank', subtitle: 'Set a new savings target' },
    { type: 'action', title: 'Set Monthly Budget', path: '/budget', icon: 'fa-wallet', subtitle: 'Define spending limits' },
    { type: 'action', title: 'Add Recurring Bill', path: '/recurring', icon: 'fa-calendar-plus', subtitle: 'Track regular payments' }
  ]

  // Search across all data
  const getSearchResults = () => {
    if (!searchQuery.trim()) {
      return { recent: suggestedActions, results: [] }
    }

    const query = searchQuery.toLowerCase()
    const results = []

    // Search transactions
    transactions.forEach(t => {
      if (t.merchant.toLowerCase().includes(query) || 
          t.category.toLowerCase().includes(query)) {
        results.push({
          type: 'transaction',
          title: t.merchant,
          subtitle: `${t.category} • $${t.amount.toFixed(2)} • ${t.date}`,
          path: '/spending',
          icon: t.icon || categoryIcons[t.category],
          data: t
        })
      }
    })

    // Search savings goals
    savingsGoals.forEach(g => {
      if (g.name.toLowerCase().includes(query)) {
        const progress = g.target > 0 ? ((g.current / g.target) * 100).toFixed(0) : 0
        results.push({
          type: 'savings',
          title: g.name,
          subtitle: `${progress}% complete • $${g.current.toFixed(2)} of $${g.target.toFixed(2)}`,
          path: '/savings',
          icon: g.icon,
          data: g
        })
      }
    })

    // Search recurring bills
    recurringBills.forEach(b => {
      if (b.name.toLowerCase().includes(query) || 
          b.category.toLowerCase().includes(query)) {
        results.push({
          type: 'recurring',
          title: b.name,
          subtitle: `${b.category} • $${b.amount.toFixed(2)} • Due ${b.dueDate}`,
          path: '/recurring',
          icon: b.icon,
          data: b
        })
      }
    })

    // Search budgets
    budgets.forEach(b => {
      if (b.category.toLowerCase().includes(query)) {
        const remaining = b.limit - b.spent
        results.push({
          type: 'budget',
          title: `${b.category} Budget`,
          subtitle: `$${remaining.toFixed(2)} remaining of $${b.limit.toFixed(2)}`,
          path: '/budget',
          icon: categoryIcons[b.category],
          data: b
        })
      }
    })

    // Add action results
    suggestedActions.forEach(a => {
      if (a.title.toLowerCase().includes(query)) {
        results.unshift(a)
      }
    })

    return { recent: [], results }
  }

  const { recent, results } = getSearchResults()
  const allItems = searchQuery.trim() ? results : recent
  const hasResults = allItems.length > 0

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && hasResults) {
        e.preventDefault()
        handleSelectItem(allItems[selectedIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, allItems, hasResults])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedIndex(0)
      
      // Only auto-focus on desktop, not mobile
      const isMobile = window.innerWidth <= 768
      if (!isMobile) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      
      // Push a history state for mobile back gesture
      if (isMobile) {
        window.history.pushState({ searchModal: true }, '')
      }
    }
  }, [isOpen])

  // Handle browser back button/gesture
  useEffect(() => {
    const handlePopState = (e) => {
      if (isOpen) {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isOpen, onClose])

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  const handleSelectItem = (item) => {
    navigate(item.path)
    onClose()
  }

  const getTypeLabel = (type) => {
    const labels = {
      page: 'Page',
      action: 'Quick Action',
      transaction: 'Transaction',
      savings: 'Savings Goal',
      recurring: 'Recurring Bill',
      budget: 'Budget'
    }
    return labels[type] || type
  }

  if (!isOpen) return null

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <button className="search-close-btn" onClick={onClose}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-shortcut">Esc</span>
        </div>

        <div className="search-results">
          {!searchQuery.trim() && recent.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">Quick Actions</div>
              {recent.map((item, index) => (
                <div
                  key={index}
                  className={`search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <i className={`fa-solid ${item.icon} result-icon`}></i>
                  <div className="result-content">
                    <div className="result-title">{item.title}</div>
                    <div className="result-subtitle">{item.subtitle || getTypeLabel(item.type)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim() && results.length === 0 && (
            <div className="no-results">
              <i className="fa-solid fa-magnifying-glass"></i>
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}

          {searchQuery.trim() && results.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </div>
              {results.map((item, index) => (
                <div
                  key={index}
                  className={`search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <i className={`fa-solid ${item.icon} result-icon`}></i>
                  <div className="result-content">
                    <div className="result-title">{item.title}</div>
                    <div className="result-subtitle">{item.subtitle}</div>
                  </div>
                  <span className="result-type">{getTypeLabel(item.type)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-footer">
          <div className="search-tips">
            <span className="tip">
              <kbd>↑</kbd><kbd>↓</kbd> Navigate
            </span>
            <span className="tip">
              <kbd>↵</kbd> Select
            </span>
            <span className="tip">
              <kbd>Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
