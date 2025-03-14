import { Alert } from 'react-native';
import { sendBillToBackend } from './CalculatorFunctions';
import { addCustomerToList } from './CustomerStorage';
import { updateSetting } from './SettingsStorage';

// Function to handle calculations
export const handleCalculateFn = async (
  input,
  evaluateExpression,
  createBillItem,
  updateTotal,
  bill,
  setInput,
  setResult,
  setBill,
  setTotal,
  mobileNumber,
  scrollViewRef,
  roundOffCalculations = false
) => {
  if (!input.trim()) {
    return;
  }

  try {
    // Calculate result
    let result = evaluateExpression(input);
    
    // Round off if enabled - use Math.ceil to round up to nearest integer
    if (roundOffCalculations) {
      result = Math.ceil(result);
      console.log('Rounded result:', result); // Debug log
    } else {
      // Otherwise ensure it's formatted to 2 decimal places
      result = parseFloat(result.toFixed(2));
    }

    // Create a new bill item
    const billItem = createBillItem(input, result);

    // Update the bill and total
    setBill((prevBill) => [...prevBill, billItem]);
    
    // Make sure the total is updated with a proper number
    setTotal((prevTotal) => {
      const numericTotal = typeof prevTotal === 'number' ? prevTotal : parseFloat(prevTotal) || 0;
      return parseFloat((numericTotal + result).toFixed(2));
    });

    // Reset the input field
    setInput('');
    setResult(result.toString());

    // Send bill to backend if mobile number is provided
    if (mobileNumber) {
      await sendBillToBackend(mobileNumber, [...bill, billItem]);
    }

    // Scroll to the bottom of the bill
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  } catch (error) {
    console.error('Calculation error:', error); // Debug log
    Alert.alert('Error', 'Invalid expression');
  }
};

// Function to handle clearing the bill - updated to use date/time instead of asking for name
export const handleClearFn = (bill, setInput, setResult, setClearedBill, setBill, setTotal, setCustomerList, setIsPrinted = null, navigation = null) => {
  if (bill.length === 0) return; // Don't do anything if bill is empty
  
  // Clear input and result
  setInput('');
  setResult('0');

  // Store the current bill before clearing
  setClearedBill(bill);

  // Create date-time string for bill name
  const dateTime = new Date().toLocaleString();
  
  // Create the customer entry
  const customerEntry = { 
    name: dateTime, 
    bill, 
    dateTime, 
    total: bill.reduce((sum, item) => sum + parseFloat(item.result || 0), 0) 
  };
  
  // Add customer to the beginning of the list
  setCustomerList(prevList => [customerEntry, ...prevList]);

  // Reset print status if needed
  if (setIsPrinted) {
    setIsPrinted(false);
  }

  // Reset product visibility if navigation is available
  if (navigation) {
    navigation.setParams({ showAllProducts: true });
  }

  // Clear the entire bill
  setBill([]);

  // Reset total
  setTotal(0);

  // After clearing the bill, also save the empty state
  // setTimeout(() => {
  //   saveCurrentBill({ bill: [], total: 0, customerName: '' });
  // }, 100);
};

// Function to handle undo
export const handleUndoFn = (input, bill, clearedBill, previousCustomerName, previousBill, previousTotal, setInput, setResult, setBill, setClearedBill, setCustomerName, setTotal) => {
  if (input.length > 0) {
    // Remove the last character from the input
    setInput((prevInput) => prevInput.slice(0, -1));
  } else if (bill.length > 0) {
    // If the input is empty, revert the last calculation
    const lastBillItem = bill[bill.length - 1];
    setInput(lastBillItem.expression);
    setResult(lastBillItem.result);
    setBill((prevBill) => prevBill.slice(0, -1));
  } else if (clearedBill.length > 0) {
    // Restore the last cleared bill
    setBill(clearedBill);
    setClearedBill([]);
  } else {
    // Restore the previous customer name and bill
    setCustomerName(previousCustomerName);
    setBill(previousBill);
    setTotal(previousTotal);
  }
};

// Function to handle name submission
export const handleNameSubmitFn = async (customerName, bill, total, previousCustomerName, previousBill, previousTotal, setCustomerList, setIsModalVisible, setPreviousCustomerName, setPreviousBill, setPreviousTotal) => {
  if (customerName.trim()) {
    // Store the previous customer name and bill
    setPreviousCustomerName(customerName);
    setPreviousBill(bill);
    setPreviousTotal(total);

    // Add customer to the list with date and time
    const dateTime = new Date().toLocaleString();
    const customerEntry = { name: customerName, bill, dateTime, total };
    
    // Add the new customer to the beginning of the list
    setCustomerList(prevList => [customerEntry, ...prevList]);

    setIsModalVisible(false);
  } else {
    Alert.alert('Invalid Input', 'Please enter a valid name.');
  }
};

// Function to handle ready cash
export const handleReadyCashFn = (bill, total, setCustomerList, setIsModalVisible) => {
  const readyCashName = 'Ready Cash';
  const dateTime = new Date().toLocaleString();
  const customerEntry = { name: readyCashName, bill, dateTime, total };
  
  // Add the new ready cash entry to the beginning of the list
  setCustomerList(prevList => [customerEntry, ...prevList]);
  
  setIsModalVisible(false);
};

// Function to handle skip
export const handleSkipFn = (bill, total, setCustomerList, setIsModalVisible) => {
  const dateTime = new Date().toLocaleString();
  const customerEntry = { name: 'Skipped', bill, dateTime, total };
  
  // Add the new skipped entry to the beginning of the list
  setCustomerList(prevList => [customerEntry, ...prevList]);
  
  setIsModalVisible(false);
};

// Function to toggle calculations in print
export const handleToggleCalculationsFn = (showCalculationsInPrint, setShowCalculationsInPrint) => {
  const newValue = !showCalculationsInPrint;
  setShowCalculationsInPrint(newValue);
  updateSetting('showCalculationsInPrint', newValue);
};

// Function to toggle customer name in print
export const handleToggleCustomerNameFn = (showCustomerNameInPrint, setShowCustomerNameInPrint) => {
  const newValue = !showCustomerNameInPrint;
  setShowCustomerNameInPrint(newValue);
  updateSetting('showCustomerNameInPrint', newValue);
};

// Function to update store name
export const handleUpdateStoreNameFn = (name, setStoreName) => {
  setStoreName(name);
  updateSetting('storeName', name);
};

// Function to update footer text
export const handleUpdateFooterTextFn = (text, setFooterText) => {
  setFooterText(text);
  updateSetting('footerText', text);
};
