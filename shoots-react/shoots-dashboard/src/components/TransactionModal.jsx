import { useData, EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryIcons } from '../context/DataContext'
import CurrencyInput from './CurrencyInput'

function TransactionModal() {
  const {
    showAddTransactionModal,
    newTransaction,
    closeAddTransactionModal,
    handleModalAddTransaction,
    updateNewTransaction
  } = useData()

  if (!showAddTransactionModal) return null

  return (
    <div className="modal-overlay" onClick={closeAddTransactionModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Transaction</h2>
          <button className="modal-close" onClick={closeAddTransactionModal}>
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
              onChange={(e) => updateNewTransaction({ merchant: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <CurrencyInput
              value={newTransaction.amount}
              onChange={(dollars) => updateNewTransaction({ amount: dollars })}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={newTransaction.date}
              onChange={(e) => updateNewTransaction({ date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <div className="type-toggle">
              <button 
                type="button"
                className={`type-btn ${newTransaction.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => updateNewTransaction({ type: 'expense', category: 'Dining' })}
              >
                <i className="fa-solid fa-arrow-down"></i>
                Expense
              </button>
              <button 
                type="button"
                className={`type-btn ${newTransaction.type === 'income' ? 'active income' : ''}`}
                onClick={() => updateNewTransaction({ type: 'income', category: 'Salary' })}
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
              onChange={(e) => updateNewTransaction({ category: e.target.value })}
            >
              {(newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={closeAddTransactionModal}>Cancel</button>
          <button className="btn-add" onClick={handleModalAddTransaction}>Add Transaction</button>
        </div>
      </div>
    </div>
  )
}

export default TransactionModal