import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveCustomerListToDb, 
  loadCustomerListFromDb,
  saveCurrentBillToDb,
  loadCurrentBillFromDb,
  clearAllCustomerDataFromDb,
  saveCalculatorList,
  initDatabase
} from './DatabaseService';
import { retrieveLatestCalculatorList } from './StorageService';

// Keys for storing customer data (keeping for compatibility)
const CUSTOMER_LIST_KEY = 'KSCAL_CUSTOMER_LIST';
const CURRENT_BILL_KEY = 'KSCAL_CURRENT_BILL';
const CURRENT_LIST_IN_CALCULATOR_KEY = 'KSCAL_CURRENT_LIST_IN_CALCULATOR';

// Initialize storage
initDatabase();

/**
 * Save customer list to storage
 */
export const saveCustomerList = async (customerList) => {
  try {
    // Save using DatabaseService
    const saveResult = await saveCustomerListToDb(customerList);
    return saveResult;
  } catch (error) {
    console.error('Error saving customer list:', error);
    return false;
  }
};

/**
 * Load customer list from storage
 */
export const loadCustomerList = async () => {
  try {
    const customerList = await loadCustomerListFromDb();
    return customerList;
  } catch (error) {
    console.error('Error loading customer list:', error);
    return [];
  }
};

/**
 * Save current bill state to storage
 */
export const saveCurrentBill = async (billData) => {
  try {
    // Save using DatabaseService
    const saveResult = await saveCurrentBillToDb(billData);
    return saveResult;
  } catch (error) {
    console.error('Error saving current bill:', error);
    return false;
  }
};

/**
 * Load current bill state from storage
 */
export const loadCurrentBill = async () => {
  try {
    const billData = await loadCurrentBillFromDb();
    return billData;
  } catch (error) {
    console.error('Error loading current bill:', error);
    return null;
  }
};

/**
 * Clear all saved customer data
 */
export const clearAllCustomerData = async () => {
  try {
    // Clear data from storage
    const clearResult = await clearAllCustomerDataFromDb();
    return clearResult;
  } catch (error) {
    console.error('Error clearing customer data:', error);
    return false;
  }
};

/**
 * Add a customer to the list (adding at the beginning for newest first)
 */
export const addCustomerToList = async (customer) => {
  try {
    const currentList = await loadCustomerList();
    const updatedList = [customer, ...currentList]; // Add new customer at the beginning
    await saveCustomerList(updatedList);
    return true;
  } catch (error) {
    console.error('Error adding customer to list:', error);
    return false;
  }
};

/**
 * Save current list in calculator to storage
 */
export const saveCurrentListInCalculator = async (currentList) => {
  try {
    // Save using DatabaseService
    const saveResult = await saveCalculatorList(currentList);
    return saveResult;
  } catch (error) {
    console.error('Error saving current list in calculator:', error);
    return false;
  }
};

/**
 * Load current list in calculator from storage
 */
export const loadCurrentListInCalculator = async () => {
  try {
    const calculatorList = await retrieveLatestCalculatorList();
    return calculatorList;
  } catch (error) {
    console.error('Error loading current list in calculator:', error);
    return [];
  }
};
