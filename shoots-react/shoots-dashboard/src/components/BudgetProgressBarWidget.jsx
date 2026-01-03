import React from 'react';
import BudgetProgressBar from './BudgetProgressBar';
import { useData } from '../context/DataContext';

const BudgetProgressBarWidget = () => {
  const { budgets } = useData();
  
  // Calculate total budget and total spent from all categories
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 8px', boxSizing: 'border-box' }}>
      <BudgetProgressBar spent={totalSpent} budget={totalBudget} />
    </div>
  );
};

export default BudgetProgressBarWidget;
