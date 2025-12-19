# Currency Input System

## Overview
The app now uses a custom currency input system that eliminates the need for users to manually type decimal points when entering dollar amounts.

## How It Works

### User Input Examples
- Type `800` → Displays as `$8.00`
- Type `1299` → Displays as `$12.99`
- Type `50` → Displays as `$0.50`
- Type `5` → Displays as `$0.05`
- Type `123456` → Displays as `$1,234.56`

### Key Features
1. **No Decimal Point Needed**: Users enter amounts as cents (e.g., 1299 for $12.99)
2. **Auto-Formatting**: When input loses focus, the value displays with proper decimal formatting
3. **Raw Entry on Focus**: When focused, shows the raw numeric value for easy editing
4. **Mobile-Friendly**: Uses `inputMode="numeric"` for optimal mobile keyboard
5. **Smart Validation**: Limits input to 8 digits (max $999,999.99)

## Implementation

### Files Created

#### 1. `src/utils/currencyUtils.js`
Utility functions for currency conversion and formatting:
- `inputToCents(input)` - Converts raw input to cents
- `formatCentsAsDollars(cents)` - Formats cents as dollar string
- `formatDollarDisplay(dollars)` - Formats with $ symbol
- `getInputAsDollars(input)` - Converts input to dollar value

#### 2. `src/components/CurrencyInput.jsx`
Reusable React component for currency input:
- Handles all formatting automatically
- Returns dollar values to parent components
- Displays formatted value when not focused
- Shows raw value when focused for easy editing

### Usage Example

```jsx
import CurrencyInput from '../components/CurrencyInput';

function MyComponent() {
  const [amount, setAmount] = useState(0);

  return (
    <CurrencyInput
      value={amount}
      onChange={(dollars) => setAmount(dollars)}
      placeholder="0.00"
    />
  );
}
```

### Integration Points

The currency input system has been integrated into:
- **SpendingPage.jsx**: Both "Add Transaction" and "Edit Transaction" modals

## Edge Cases Handled

| Input | Result | Notes |
|-------|--------|-------|
| `0` | `$0.00` | Zero amount |
| `5` | `$0.05` | 5 cents |
| `50` | `$0.50` | 50 cents |
| `500` | `$5.00` | 5 dollars |
| `000` | `$0.00` | Leading zeros removed |
| `99999999` | Rejected | Over max limit |
| `abc123` | `$1.23` | Non-numeric chars stripped |

## Validation

The system includes automatic validation:
- Only numeric input is accepted
- Maximum 8 digits (prevents amounts over $999,999.99)
- Minimum amount is $0.00
- Non-numeric characters are automatically filtered out

## Mobile Considerations

- Uses `inputMode="numeric"` to trigger numeric keyboard on mobile devices
- Touch-friendly with proper input sizing
- No need for decimal key on mobile keyboards

## Future Enhancements

Possible improvements:
- Add thousand separators for display (e.g., $1,234.56)
- Support for negative amounts (refunds, corrections)
- Currency symbol selection for international support
- Configurable decimal places for different currencies
