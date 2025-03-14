import { Alert } from 'react-native';

/**
 * Evaluates a mathematical expression and returns the result
 */
export const evaluateExpression = (expression) => {
  try {
    // Use Function constructor to evaluate the expression
    const result = new Function('return ' + expression)();
    
    // Ensure result is a proper number
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Result is not a valid number');
    }
    
    // Return the numeric result (without rounding here)
    return result;
  } catch (error) {
    console.error('Error evaluating expression:', error);
    throw new Error('Invalid expression');
  }
};

/**
 * Creates a new bill item based on the expression and result
 */
export const createBillItem = (expression, result) => {
  // Ensure result is a proper number
  const numericResult = typeof result === 'number' && !isNaN(result) 
    ? result 
    : 0;
    
  return {
    id: Date.now().toString(),
    expression,
    result: numericResult,
  };
};

/**
 * Updates the total by adding the result value
 */
export const updateTotal = (currentTotal, result) => {
  // Ensure we're adding numbers, not objects
  const numericTotal = typeof currentTotal === 'number' ? currentTotal : parseFloat(currentTotal) || 0;
  const numericResult = typeof result === 'number' ? result : parseFloat(result) || 0;
  
  // Add and return the precise result
  return numericTotal + numericResult;
};

/**
 * Handles API communication for adding bill items (if needed)
 */
export const sendBillToBackend = async (mobileNumber, expression, result) => {
  if (!mobileNumber) return true;
  
  try {
    await fetch('http://127.0.0.1:8000/add_bill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_number: mobileNumber,
        expression,
        result,
      }),
    });
    return true;
  } catch (error) {
    console.error('Failed to send bill to backend:', error);
    return false;
  }
};
