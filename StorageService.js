import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add missing utility functions
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// AsyncStorage keys for data storage (for migration and compatibility)
const AS_CALCULATOR_LIST_KEY = 'KSCAL_DB_CALCULATOR_LIST';
const AS_CUSTOMERS_KEY = 'KSCAL_DB_CUSTOMERS';
const AS_CURRENT_BILL_KEY = 'KSCAL_DB_CURRENT_BILL';
const AS_HISTORICAL_LISTS_KEY = 'KSCAL_DB_HISTORICAL_LISTS';

// Current Bill ID constant
const CURRENT_BILL_ID = 'current_bill_singleton';

/**
 * Initialize the storage
 */
export const initStorage = async () => {
  try {
    console.log('Falling back to AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    console.log('Falling back to AsyncStorage');
    return false;
  }
};

/**
 * Save the current calculator list
 */
export const saveCalculatorList = async (listData) => {
  try {
    await AsyncStorage.setItem(AS_CALCULATOR_LIST_KEY, JSON.stringify(listData));
    console.log('Calculator list saved to storage');
    return true;
  } catch (error) {
    console.error('Error saving calculator list:', error);
    return false;
  }
};

/**
 * Save list data to historical lists
 */
export const saveToHistoricalLists = async (listType, listData, customerName = '', total = 0) => {
  try {
    const historicalListsJson = await AsyncStorage.getItem(AS_HISTORICAL_LISTS_KEY);
    const historicalLists = historicalListsJson ? JSON.parse(historicalListsJson) : [];
    historicalLists.push({ listType, listData, customerName, total });
    await AsyncStorage.setItem(AS_HISTORICAL_LISTS_KEY, JSON.stringify(historicalLists));
    console.log('History saved to storage');
    return true;
  } catch (error) {
    console.error('Error saving history:', error);
    return false;
  }
};

/**
 * Get the most recent calculator list
 */
export const getCalculatorList = async () => {
  try {
    const listJson = await AsyncStorage.getItem(AS_CALCULATOR_LIST_KEY);
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('Error getting calculator list from Realm:', error);
    
    // Fallback to AsyncStorage
    try {
      const listJson = await AsyncStorage.getItem(AS_CALCULATOR_LIST_KEY);
      return listJson ? JSON.parse(listJson) : [];
    } catch (asyncError) {
      console.error('Error getting from AsyncStorage fallback:', asyncError);
      return [];
    }
  }
};

/**
 * Save customer list
 */
export const saveCustomerListToStorage = async (customerList) => {
  try {
    const existingListJson = await AsyncStorage.getItem(AS_CUSTOMERS_KEY);
    const existingList = existingListJson ? JSON.parse(existingListJson) : [];
    existingList.push(customerList);
    
    // Keep only the last 10 bills
    if (existingList.length > 10) {
      existingList.splice(0, existingList.length - 10);
    }
    
    await AsyncStorage.setItem(AS_CUSTOMERS_KEY, JSON.stringify(existingList));
    console.log('Customer list saved to AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error saving customer list:', error);
    return false;
  }
};

/**
 * Load customer list
 */
export const loadCustomerListFromStorage = async () => {
  try {
    const listJson = await AsyncStorage.getItem(AS_CUSTOMERS_KEY);
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('Error loading customer list:', error);
    
    // Fallback to AsyncStorage
    try {
      const listJson = await AsyncStorage.getItem(AS_CUSTOMERS_KEY);
      return listJson ? JSON.parse(listJson) : [];
    } catch (asyncError) {
      console.error('Error loading from AsyncStorage fallback:', asyncError);
      return [];
    }
  }
};

/**
 * Save current bill
 */
export const saveCurrentBillToStorage = async (billData) => {
  try {
    await AsyncStorage.setItem(AS_CURRENT_BILL_KEY, JSON.stringify(billData));
    console.log('Current bill saved to AsyncStorage');
    
    // Also save to historical lists
    await saveToHistoricalLists(
      'current_bill', 
      billData.bill, 
      billData.customerName || '', 
      billData.total
    );
    
    return true;
  } catch (error) {
    console.error('Error saving current bill:', error);
    
    // Fallback to AsyncStorage
    try {
      await AsyncStorage.setItem(AS_CURRENT_BILL_KEY, JSON.stringify(billData));
      console.log('Current bill saved to AsyncStorage (fallback)');
      return true;
    } catch (asyncError) {
      console.error('Error saving to AsyncStorage fallback:', asyncError);
      return false;
    }
  }
};

/**
 * Load current bill
 */
export const loadCurrentBillFromStorage = async () => {
  try {
    const billJson = await AsyncStorage.getItem(AS_CURRENT_BILL_KEY);
    return billJson ? JSON.parse(billJson) : null;
  } catch (error) {
    console.error('Error loading current bill:', error);
    
    // Fallback to AsyncStorage
    try {
      const billJson = await AsyncStorage.getItem(AS_CURRENT_BILL_KEY);
      return billJson ? JSON.parse(billJson) : null;
    } catch (asyncError) {
      console.error('Error loading from AsyncStorage fallback:', asyncError);
      return null;
    }
  }
};

/**
 * Clear all customer data
 */
export const clearAllCustomerDataFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(AS_CUSTOMERS_KEY);
    await AsyncStorage.removeItem(AS_CURRENT_BILL_KEY);
    await AsyncStorage.removeItem(AS_CALCULATOR_LIST_KEY);
    console.log('All customer data cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error clearing customer data:', error);
    
    // Fallback to AsyncStorage - Fixed syntax error
    try {
      await AsyncStorage.removeItem(AS_CUSTOMERS_KEY);
      await AsyncStorage.removeItem(AS_CURRENT_BILL_KEY);
      await AsyncStorage.removeItem(AS_CALCULATOR_LIST_KEY);
      console.log('All customer data cleared from AsyncStorage (fallback)');
      return true;
    } catch (asyncError) {
      console.error('Error clearing from AsyncStorage fallback:', asyncError);
      return false;
    }
  }
};

/**
 * Get all historical lists from a specific date
 */
export const getHistoricalListsByDate = async (date) => {
  try {
    const historicalListsJson = await AsyncStorage.getItem(AS_HISTORICAL_LISTS_KEY);
    const historicalLists = historicalListsJson ? JSON.parse(historicalListsJson) : [];
    return historicalLists.filter(item => new Date(item.dateTime).toDateString() === new Date(date).toDateString());
  } catch (error) {
    console.error('Error retrieving historical lists:', error);
    return [];
  }
};

/**
 * Get count of all saved lists
 */
export const getListCounts = async () => {
  try {
    const customersJson = await AsyncStorage.getItem(AS_CUSTOMERS_KEY);
    const historyJson = await AsyncStorage.getItem(AS_HISTORICAL_LISTS_KEY);
    
    const customerCount = customersJson ? JSON.parse(customersJson).length : 0;
    const historyCount = historyJson ? JSON.parse(historyJson).length : 0;
    
    return {
      customerCount,
      historyCount
    };
  } catch (error) {
    console.error('Error getting list counts:', error);
    
    // Fallback to AsyncStorage
    try {
      const customersJson = await AsyncStorage.getItem(AS_CUSTOMERS_KEY);
      const historyJson = await AsyncStorage.getItem(AS_HISTORICAL_LISTS_KEY);
      
      const customerCount = customersJson ? JSON.parse(customersJson).length : 0;
      const historyCount = historyJson ? JSON.parse(historyJson).length : 0;
      
      return {
        customerCount,
        historyCount
      };
    } catch (asyncError) {
      console.error('Error getting from AsyncStorage fallback:', asyncError);
      return { customerCount: 0, historyCount: 0 };
    }
  }
};

/**
 * Get the most recent calculator list
 */
export const retrieveLatestCalculatorList = async () => {
  try {
    // Use the AsyncStorage implementation from DatabaseService
    const calculatorLists = await AsyncStorage.getItem('KSCAL_CALCULATOR_LIST');
    const parsed = calculatorLists ? JSON.parse(calculatorLists) : [];
    
    if (parsed.length > 0) {
      return JSON.parse(parsed[0].listData);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving calculator list:', error);
    return [];
  }
};
