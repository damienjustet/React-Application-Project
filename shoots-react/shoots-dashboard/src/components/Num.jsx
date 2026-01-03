import React from 'react';

/**
 * Num Component - Displays numeric values with the Moulpali font
 * 
 * This is a simple, reusable component that ensures all numbers
 * in the app use a consistent numeric font (Moulpali).
 * 
 * Usage:
 *   <Num>123.45</Num>
 *   <Num>${amount.toFixed(2)}</Num>
 *   <Num>{percentage}%</Num>
 *   <Num className="extra-class">{value}</Num>
 * 
 * @param {React.ReactNode} children - The numeric content to display
 * @param {string} className - Additional CSS classes (optional)
 * @param {object} style - Inline styles (optional)
 */
function Num({ children, className = '', style = {}, ...props }) {
  return (
    <span 
      className={`font-numeric ${className}`.trim()} 
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Format a number as currency with Num component
 * @param {number} amount - The dollar amount
 * @returns {JSX.Element} Formatted currency with Num wrapper
 */
export function Currency({ amount, showSign = false, className = '' }) {
  const formatted = Math.abs(amount).toFixed(2);
  const sign = amount < 0 ? '-' : (showSign && amount > 0 ? '+' : '');
  return <Num className={className}>{sign}${formatted}</Num>;
}

/**
 * Format a number as percentage with Num component
 * @param {number} value - The percentage value
 * @param {number} decimals - Decimal places (default 0)
 * @returns {JSX.Element} Formatted percentage with Num wrapper
 */
export function Percent({ value, decimals = 0, className = '' }) {
  return <Num className={className}>{value.toFixed(decimals)}%</Num>;
}

export default Num;
