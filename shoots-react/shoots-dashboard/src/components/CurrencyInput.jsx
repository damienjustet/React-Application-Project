import { useState, useEffect } from 'react';
import { formatCentsAsDollars, inputToCents } from '../utils/currencyUtils';

/**
 * CurrencyInput Component
 * 
 * A reusable input component for currency that:
 * - Accepts input without decimals (e.g., 1299 = $12.99)
 * - Displays formatted currency as user types in real-time
 * - Returns the dollar value when changed
 * 
 * @param {number} value - Current value in dollars (e.g., 12.99)
 * @param {Function} onChange - Callback with dollar amount
 * @param {string} placeholder - Placeholder text
 * @param {Object} props - Additional input props
 */
function CurrencyInput({ value, onChange, placeholder = "0.00", className = "", ...props }) {
  // Store raw input value (in cents format, e.g., "1299" for $12.99)
  const [rawValue, setRawValue] = useState('');

  // Initialize raw value from dollar value
  useEffect(() => {
    if (value !== undefined && value !== null && value > 0) {
      // Convert dollar value to cents format
      const cents = Math.round(value * 100);
      setRawValue(cents.toString());
    } else {
      setRawValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Remove any non-numeric characters
    const cleaned = newValue.replace(/[^\d]/g, '');
    
    // Limit to reasonable length (max $999,999.99 = 99999999 cents)
    if (cleaned.length > 8) {
      return;
    }
    
    setRawValue(cleaned);
    
    // Convert to dollars and pass to parent
    const cents = inputToCents(cleaned);
    const dollars = cents / 100;
    onChange(dollars);
  };

  // Always display formatted value in real-time
  const displayValue = () => {
    if (!rawValue || rawValue === '0') {
      return '';
    }
    
    return formatCentsAsDollars(inputToCents(rawValue));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue()}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

export default CurrencyInput;
