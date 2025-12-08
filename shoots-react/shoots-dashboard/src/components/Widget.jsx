import './Widget.css'

function Widget({ type, title, data }) {
  const renderWidgetContent = () => {
    switch(type) {
      case 'savings':
        const percentage = ((data.current / data.goal) * 100).toFixed(0)
        return (
          <div className="widget-savings">
            <div className="savings-amount">
              <span className="currency">{data.currency}</span>
              <span className="value">{data.current.toLocaleString()}</span>
            </div>
            <div className="savings-goal">
              of {data.currency}{data.goal.toLocaleString()} goal
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="progress-text">{percentage}% Complete</div>
          </div>
        )
      
      case 'spending':
        const difference = data.lastMonth - data.thisMonth
        const isPositive = difference > 0
        return (
          <div className="widget-spending">
            <div className="spending-amount">
              <span className="currency">{data.currency}</span>
              <span className="value">{data.thisMonth.toLocaleString()}</span>
            </div>
            <div className="spending-label">This Month</div>
            <div className={`spending-compare ${isPositive ? 'positive' : 'negative'}`}>
              <span className="icon">{isPositive ? '📉' : '📈'}</span>
              <span>{data.currency}{Math.abs(difference)} vs last month</span>
            </div>
          </div>
        )
      
      case 'budget':
        return (
          <div className="widget-budget">
            {data.categories.map((cat, idx) => {
              const percent = (cat.spent / cat.limit * 100).toFixed(0)
              const isOverBudget = cat.spent > cat.limit
              return (
                <div key={idx} className="budget-category">
                  <div className="budget-header">
                    <span className="budget-name">{cat.name}</span>
                    <span className="budget-amounts">
                      ${cat.spent} / ${cat.limit}
                    </span>
                  </div>
                  <div className="budget-bar">
                    <div 
                      className={`budget-fill ${isOverBudget ? 'over-budget' : ''}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      
      case 'recurring':
        return (
          <div className="widget-recurring">
            {data.payments.map((payment, idx) => (
              <div key={idx} className="recurring-item">
                <div className="recurring-info">
                  <span className="recurring-name">{payment.name}</span>
                  <span className="recurring-date">Due: {payment.dueDate}</span>
                </div>
                <span className="recurring-amount">${payment.amount}</span>
              </div>
            ))}
          </div>
        )
      
      case 'transactions':
        return (
          <div className="widget-transactions">
            {data.transactions.map((tx, idx) => (
              <div key={idx} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-name">{tx.name}</span>
                  <span className="transaction-date">{tx.date}</span>
                </div>
                <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount > 0 ? '$' : '-$'}{Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )
      
      default:
        return <div>Widget type not found</div>
    }
  }

  return (
    <div className={`widget widget-${type}`}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        <button className="widget-menu" title="Widget options">⋮</button>
      </div>
      <div className="widget-content">
        {renderWidgetContent()}
      </div>
    </div>
  )
}

export default Widget
