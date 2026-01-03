import React from 'react';
import './BudgetProgressBar.css';

function getFontSize(amount) {
  // Shrink font size for larger numbers
  const len = amount.toFixed(2).length;
  if (len > 10) return '1rem';
  if (len > 8) return '1.1rem';
  if (len > 6) return '1.2rem';
  return '1.3rem';
}

const BudgetProgressBar = ({ spent = 120.06, budget = 120.00 }) => {
  const percent = Math.min(100, Math.max(0, (spent / budget) * 100));
  return (
    <div className="budget-progress-bar">
      <div className="budget-progress-bar__padding">
        <div
          className="budget-progress-bar__fill"
          style={{ width: `${percent}%` }}
        >
          <span
            className="budget-progress-bar__amount budget-progress-bar__amount--spent font-numeric"
            style={{ fontSize: getFontSize(spent) }}
          >
            ${spent.toFixed(2)}
          </span>
        </div>
        <span
          className="budget-progress-bar__amount budget-progress-bar__amount--budget font-numeric"
          style={{ fontSize: getFontSize(budget) }}
        >
          ${budget.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default BudgetProgressBar;
