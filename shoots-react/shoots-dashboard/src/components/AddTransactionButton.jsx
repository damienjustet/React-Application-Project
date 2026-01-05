import { memo } from 'react'
import './AddTransactionButton.css'

function AddTransactionButton({ onClick }) {
  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className="add-transaction-button-widget">
      <button 
        className="add-transaction-widget-btn" 
        onClick={handleClick}
        title="Add Transaction"
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  )
}

export default memo(AddTransactionButton)
