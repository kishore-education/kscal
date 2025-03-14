import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, PanResponder } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as KeepAwake from 'expo-keep-awake';
import AppHeader from './AppHeader';
import CustomerListScreen from './CustomerListScreen';
import CustomerBillScreen from './CustomerBillScreen';
import ProductScreen from './ProductScreen';
import NumericKeypad from './NumericKeypad'; // Import our new component
import SavedBillsScreen from './SavedBillsScreen'; // Import the new screen

// Import our extracted functionality
import { printBill } from './PrintService';
import { evaluateExpression, createBillItem, updateTotal, sendBillToBackend } from './CalculatorFunctions';
import MenuModal from './MenuModal';
import CustomerNameModal from './CustomerNameModal';
import { loadSettings, updateSetting } from './SettingsStorage';
import { saveCurrentBill, loadCurrentBill, saveCurrentListInCalculator } from './CustomerStorage';

// Import main functions
import {
  handleCalculateFn,
  handleClearFn,
  handleUndoFn,
  handleNameSubmitFn,
  handleReadyCashFn,
  handleSkipFn,
  handleToggleCalculationsFn,
  handleToggleCustomerNameFn,
  handleUpdateStoreNameFn,
  handleUpdateFooterTextFn,
} from './MainFunctions';

// Import the saveToHistoricalLists function from StorageService
import { saveToHistoricalLists, initStorage, saveCustomerListToStorage } from './StorageService';

// CalculatorScreen Component
const CalculatorScreen = ({ route, navigation }) => {
  const { mobileNumber } = route.params || {};
  const [input, setInput] = useState('');
  const [result, setResult] = useState('0');
  const [bill, setBill] = useState([]);
  const [clearedBill, setClearedBill] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [previousCustomerName, setPreviousCustomerName] = useState('');
  const [previousBill, setPreviousBill] = useState([]);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [showCalculationsInPrint, setShowCalculationsInPrint] = useState(true);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [showCustomerNameInPrint, setShowCustomerNameInPrint] = useState(true);
  const [footerText, setFooterText] = useState('Thank you!');
  const [showProductNameInPrint, setShowProductNameInPrint] = useState(true);
  const [roundOffCalculations, setRoundOffCalculations] = useState(false);
  const [showAddProductButton, setShowAddProductButton] = useState(true);
  const [isPrinted, setIsPrinted] = useState(false);
  const [printFontSize, setPrintFontSize] = useState('medium');
  const scrollViewRef = useRef();

  // Setup pan responder for swipe detection - removing swipe left detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        // Removed the swipe left detection code
        // We're keeping the structure in case we want to add different gestures later
      },
    })
  ).current;

  // Load saved settings, customer list, and current bill when app starts
  useEffect(() => {
    const loadSavedData = async () => {
      // Load settings
      const settings = await loadSettings();
      setShowCalculationsInPrint(settings.showCalculationsInPrint);
      setShowCustomerNameInPrint(settings.showCustomerNameInPrint);
      setShowProductNameInPrint(settings.showProductNameInPrint);
      setRoundOffCalculations(settings.roundOffCalculations);
      setShowAddProductButton(settings.showAddProductButton);
      setStoreName(settings.storeName);
      setFooterText(settings.footerText || 'Thank you!');
      setPrintFontSize(settings.printFontSize || 'medium');
      
      // Load current bill data
      const savedBillData = await loadCurrentBill();
      if (savedBillData) {
        setBill(savedBillData.bill || []);
        setTotal(savedBillData.total || 0);
        setCustomerName(savedBillData.customerName || '');
        if (savedBillData.customerName) {
          setIsModalVisible(false); // Don't show name modal if we have a saved customer name
        }
      }
    };
    
    loadSavedData();
  }, []);

  // Initialize storage when app starts
  useEffect(() => {
    const initApp = async () => {
      await initStorage();
    };
    
    initApp();
  }, []);

  // Save settings when they change
  const handleToggleCalculations = () => {
    handleToggleCalculationsFn(showCalculationsInPrint, setShowCalculationsInPrint);
  };

  const handleToggleCustomerName = () => {
    handleToggleCustomerNameFn(showCustomerNameInPrint, setShowCustomerNameInPrint);
  };

  const handleUpdateStoreName = (name) => {
    handleUpdateStoreNameFn(name, setStoreName);
  };

  const handleUpdateFooterText = (text) => {
    handleUpdateFooterTextFn(text, setFooterText);
  };

  const handleToggleProductName = () => {
    const newValue = !showProductNameInPrint;
    setShowProductNameInPrint(newValue);
    updateSetting('showProductNameInPrint', newValue);
  };

  const handleToggleRoundOff = () => {
    const newValue = !roundOffCalculations;
    console.log('Toggling roundOffCalculations to:', newValue); // Debug log
    setRoundOffCalculations(newValue);
    updateSetting('roundOffCalculations', newValue);
  };

  const handleToggleShowAddProductButton = () => {
    const newValue = !showAddProductButton;
    setShowAddProductButton(newValue);
    updateSetting('showAddProductButton', newValue);
  };

  const handleSetPrintFontSize = (size) => {
    setPrintFontSize(size);
    updateSetting('printFontSize', size);
  };

  useEffect(() => {
    if (route.params?.action === 'clearAllCustomers') {
      setCustomerList([]);
    }
    if (route.params?.bill) {
      setBill(route.params.bill);
      setTotal(route.params.total);
      setCustomerName(route.params.customerName);
      setIsModalVisible(false);
    }
  }, [route.params?.action, route.params?.bill]);

  // Save customer list when it changes
  useEffect(() => {
    if (customerList.length > 0) {
      // saveCustomerList(customerList); // Removed call to saveCustomerList
    }
  }, [customerList]);

  // Save current bill data when it changes
  useEffect(() => {
    const currentBillData = {
      bill,
      total,
      customerName
    };
    saveCurrentBill(currentBillData);
    
    // Also save the current list in calculator to SQLiteCloud
    saveCurrentListInCalculator(bill);
  }, [bill, total, customerName]);

  const handleCalculate = async () => {
    console.log('Round off setting:', roundOffCalculations); // Debug log
    await handleCalculateFn(
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
      roundOffCalculations // Pass the round off setting to the calculation function
    );
  };

  const handleClear = () => {
    if (bill.length === 0) return; // Don't do anything if bill is empty
    
    // Store the current bill before clearing
    setClearedBill(bill);
    
    // Create date-time string for bill name
    const dateTime = new Date().toLocaleString();
    
    // Save the bill with date and time at the beginning of the list
    const newCustomer = { 
      name: dateTime, 
      bill, 
      dateTime, 
      total 
    };
    
    setCustomerList((prevList) => [newCustomer, ...prevList]);
    
    // Save this bill to historical lists in database
    saveToHistoricalLists('cleared_bill', bill, customerName, total);
    
    // Save the current bill to saved bills list
    saveCustomerListToStorage(newCustomer);
    
    // Clear the bill and reset
    setInput('');
    setResult('0');
    setBill([]);
    setTotal(0);
    setIsPrinted(false); // Reset print status
    
    // Reset product visibility in the product screen
    navigation.setParams({ showAllProducts: true });
    
    // Show feedback to user
    Alert.alert('Saved', 'Bill saved with timestamp');
    
    // Save the empty state
    setTimeout(() => {
      saveCurrentBill({ bill: [], total: 0, customerName: '' });
    }, 100);
  };

  const handleAddCustomer = () => {
    if (bill.length === 0) {
      Alert.alert('Error', 'Cannot add empty bill');
      return;
    }
    
    // Show the customer name modal
    setIsModalVisible(true);
  };

  const handleSymbolPress = (symbol) => {
    setInput((prevInput) => prevInput + symbol);
  };

  const handleUndo = () => {
    handleUndoFn(
      input,
      bill,
      clearedBill,
      previousCustomerName,
      previousBill,
      previousTotal,
      setInput,
      setResult,
      setBill,
      setClearedBill,
      setCustomerName,
      setTotal
    );
  };

  const handleNameSubmit = async () => {
    handleNameSubmitFn(
      customerName,
      bill,
      total,
      previousCustomerName,
      previousBill,
      previousTotal,
      setCustomerList,
      setIsModalVisible,
      setPreviousCustomerName,
      setPreviousBill,
      setPreviousTotal
    );
  };

  const handleReadyCash = () => {
    handleReadyCashFn(bill, total, setCustomerList, setIsModalVisible);
  };

  const handleSkip = () => {
    handleSkipFn(bill, total, setCustomerList, setIsModalVisible);
  };

  const handleViewCustomerList = () => {
    setIsMenuModalVisible(false);
    navigation.navigate('CustomerList', { customerList });
  };

  const handleDeleteCustomer = (customerName) => {
    setCustomerList((prevList) => prevList.filter((customer) => customer.name !== customerName));
  };

  const handleMenuPress = () => {
    setIsMenuModalVisible(true);
  };

  const handlePrint = async () => {
    const success = await printBill(
      bill, 
      total, 
      customerName, 
      showCalculationsInPrint, 
      storeName, 
      showCustomerNameInPrint, 
      footerText, 
      showProductNameInPrint,
      printFontSize
    );
    if (success) {
      setIsPrinted(true);
      
      // Save the printed bill to historical lists
      saveToHistoricalLists('printed_bill', bill, customerName, total);
    }
  };

  const handleAddProduct = () => {
    // Navigate to Products screen with current bill data
    navigation.navigate('Products', {
      bill,
      total,
      customerName,
      addProductMode: true,
      roundOffCalculations: roundOffCalculations, // Pass the round-off setting to ProductScreen
      focusSearch: true // Add this parameter to indicate search should be focused
    });
  };

  const handleDeleteItem = (itemId) => {
    // Find the item to be deleted to get its result value
    const itemToDelete = bill.find(item => item.id === itemId);
    if (!itemToDelete) return;

    // Update the bill by filtering out the deleted item
    setBill(prevBill => prevBill.filter(item => item.id !== itemId));
    
    // Update the total by subtracting the deleted item's result
    setTotal(prevTotal => {
      const updatedTotal = parseFloat(prevTotal) - parseFloat(itemToDelete.result);
      return Math.max(0, parseFloat(updatedTotal.toFixed(2))); // Ensure total doesn't go negative
    });
  };

  // Handle numeric keypad input
  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      // Handle backspace - remove last character
      setInput(prevInput => prevInput.slice(0, -1));
      return;
    }
    
    // For all other keys, append to the input
    setInput(prevInput => prevInput + key);
  };

  const handleViewSavedBills = () => {
    setIsMenuModalVisible(false);
    navigation.navigate('SavedBills');
  };

  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers} // Add the pan responder
    >
      <CustomerNameModal 
        isVisible={isModalVisible} 
        customerName={customerName}
        onChangeText={setCustomerName}
        onSubmit={handleNameSubmit}
        onReadyCash={handleReadyCash}
        onSkip={handleSkip}
        onClose={() => setIsModalVisible(false)}
      />
      
      <MenuModal 
        isVisible={isMenuModalVisible}
        onClose={() => setIsMenuModalVisible(false)}
        onViewCustomerList={handleViewCustomerList}
        showCalculationsInPrint={showCalculationsInPrint}
        toggleCalculationsInPrint={handleToggleCalculations}
        showCustomerNameInPrint={showCustomerNameInPrint}
        toggleCustomerNameInPrint={handleToggleCustomerName}
        showProductNameInPrint={showProductNameInPrint}
        toggleProductNameInPrint={handleToggleProductName}
        roundOffCalculations={roundOffCalculations}
        toggleRoundOffCalculations={handleToggleRoundOff}
        showAddProductButton={showAddProductButton}
        toggleShowAddProductButton={handleToggleShowAddProductButton}
        storeName={storeName}
        setStoreName={handleUpdateStoreName}
        footerText={footerText}
        setFooterText={handleUpdateFooterText}
        printFontSize={printFontSize}
        setPrintFontSize={handleSetPrintFontSize}
        onViewSavedBills={handleViewSavedBills} // Add this prop
      />

      <AppHeader 
        title={`${storeName ? storeName : 'Calculator'} ${customerName ? '- ' + customerName : ''}`}
        onMenuPress={handleMenuPress} 
        theme="light" // Add light theme prop
      />

      <View style={styles.calculator}>
        {/* Bill History with delete functionality - show product name where applicable */}
        <ScrollView style={styles.billContainer} ref={scrollViewRef}>
          {bill.map((item, index) => {
            // Extract product name for product items
            let displayText = `${item.result}`;
            if (item.isProduct && item.expression) {
              const matches = item.expression.match(/^(.*?) x/);
              if (matches && matches[1]) {
                displayText = `${matches[1]}: ${item.result}`;
              }
            }
            
            return (
              <View key={item.id} style={[styles.billItem, item.isProduct && styles.productBillItem]}>
                <Text style={styles.billText}>
                  {index + 1}. {displayText}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteItemButton}
                  onPress={() => {
                    Alert.alert(
                      "Delete Item",
                      "Are you sure you want to remove this item?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", onPress: () => handleDeleteItem(item.id) }
                      ]
                    );
                  }}
                >
                  <Text style={styles.deleteItemText}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Total Result with Print and Clear buttons */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: {total}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.printButton,
                isPrinted && styles.printedButton
              ]} 
              onPress={handlePrint}
            >
              <Text style={styles.actionButtonText}>
                {isPrinted ? 'Printed' : 'Print'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Input Field */}
        <View style={styles.inputDisplayContainer}>
          <Text style={styles.inputDisplay}>{input || '0'}</Text>
          {showAddProductButton && (
            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.addProductButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Replace the old input and buttons with the NumericKeypad */}
        <NumericKeypad 
          onKeyPress={handleKeyPress}
          onCalculate={handleCalculate}
        />
      </View>
    </View>
  );
};

// Main App Component
const App = () => {
  const Stack = createStackNavigator();

  // Activate keep-awake when the app starts
  useEffect(() => {
    const activateKeepAwake = async () => {
      try {
        // Use the namespace import
        await KeepAwake.activateKeepAwakeAsync();
      } catch (error) {
        console.error('Failed to keep screen awake:', error);
      }
    };

    activateKeepAwake();

    // Deactivate keep-awake when the app is closed or backgrounded
    return () => {
      const deactivateKeepAwake = async () => {
        try {
          // Use the namespace import
          await KeepAwake.deactivateKeepAwakeAsync();
        } catch (error) {
          console.error('Failed to deactivate keep-awake:', error);
        }
      };
      
      deactivateKeepAwake();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Calculator">
        <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerBill" component={CustomerBillScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Products" component={ProductScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SavedBills" component={SavedBillsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background matching NumericKeypad
  },
  calculator: {
    flex: 1,
    justifyContent: 'space-between',
  },
  billTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    color: '#ffffff', // White text for dark theme
  },
  billContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  billItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Darker border for dark theme
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billText: {
    fontSize: 16,
    flex: 1,
    color: '#ffffff', // White text for dark theme
  },
  deleteItemButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8b0000', // Darker red matching NumericKeypad
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteItemText: {
    color: '#ffffff', // White text for dark theme
  },
  bottomSection: {
    padding: 20,
    backgroundColor: '#1e1e1e', // Dark background for sections
    borderTopWidth: 1,
    borderTopColor: '#333', // Darker border
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    textAlign: 'right',
  },
  addProductButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c6b33', // Darker green matching NumericKeypad
    borderRadius: 24,
    marginLeft: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addProductButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  symbolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  symbolButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    width: '23%',
    alignItems: 'center',
  },
  symbolButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    width: '30%', // Changed back from 23% to 30% for 3 buttons
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1e1e1e', // Dark background for total container
    borderTopWidth: 1,
    borderTopColor: '#333', // Darker border
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
    color: '#ffffff', // White text for dark theme
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#8b0000', // Darker red matching NumericKeypad
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  printButton: {
    backgroundColor: '#0056b3', // Darker blue matching NumericKeypad
    padding: 8,
    borderRadius: 5,
  },
  printedButton: {
    backgroundColor: '#1c6b33', // Darker green matching NumericKeypad
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  productBillItem: {
    backgroundColor: 'rgba(0, 86, 179, 0.15)', // Darker blue background for product items
  },
  inputDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: '#1e1e1e', // Dark background for input container
    borderTopWidth: 1,
    borderTopColor: '#333', // Darker border
    borderBottomWidth: 0, // Remove border bottom as keypad now has its own border
  },
  inputDisplay: {
    flex: 1,
    fontSize: 23,
    textAlign: 'right',
    padding: 10,
    backgroundColor: '#2c2c2c', // Darker input background
    color: '#ffffff', // White text for dark theme
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#444', // Darker border for input
    minHeight: 50, // Ensure enough height for display
  },
});

export default App;
