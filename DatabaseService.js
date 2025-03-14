import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage keys for database-equivalent storage
const CALCULATOR_LIST_KEY = 'KSCAL_CALCULATOR_LIST';
const CURRENT_BILL_KEY = 'KSCAL_CURRENT_BILL';
const HISTORICAL_LIST_KEY = 'KSCAL_HISTORICAL_LIST';

// Initialize the storage (previously database)
export const initDatabase = async () => {
  console.log('AsyncStorage initialized for database replacement');
  return true;
};

// Save the current calculator list
export const saveCalculatorList = async (listData) => {
  try {
    const createdAt = new Date().toISOString();
    
    // Get existing lists
    const existingJson = await AsyncStorage.getItem(CALCULATOR_LIST_KEY);
    const existingLists = existingJson ? JSON.parse(existingJson) : [];
    
    // Add new entry
    existingLists.unshift({
      listData: JSON.stringify(listData),
      createdAt
    });
    
    // Save back to AsyncStorage
    await AsyncStorage.setItem(CALCULATOR_LIST_KEY, JSON.stringify(existingLists));
    console.log('Calculator list saved to AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error saving calculator list to AsyncStorage:', error);
    return false;
  }
};

// Save list data to historical lists
export const saveToHistoricalLists = async (listType, listData, customerName = '', total = 0) => {
  try {
    const dateTime = new Date().toISOString();
    
    // Get existing lists
    const existingJson = await AsyncStorage.getItem(HISTORICAL_LIST_KEY);
    const existingLists = existingJson ? JSON.parse(existingJson) : [];
    
    // Add new entry
    existingLists.unshift({
      id: Date.now().toString(),
      listType,
      listData: JSON.stringify(listData),
      customerName,
      total,
      dateTime,
      createdAt: dateTime
    });
    
    // Save back to AsyncStorage
    await AsyncStorage.setItem(HISTORICAL_LIST_KEY, JSON.stringify(existingLists));
    console.log('History saved to AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error saving history to AsyncStorage:', error);
    return false;
  }
};

// Save current bill
export const saveCurrentBillToDb = async (billData) => {
  try {
    const updatedAt = new Date().toISOString();
    
    // Prepare data
    const dataToSave = {
      bill: JSON.stringify(billData.bill),
      total: billData.total,
      customerName: billData.customerName,
      updatedAt
    };
    
    // Save directly (overwriting previous)
    await AsyncStorage.setItem(CURRENT_BILL_KEY, JSON.stringify(dataToSave));
    console.log('Current bill saved to AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error saving current bill to AsyncStorage:', error);
    return false;
  }
};

// Load current bill
export const loadCurrentBillFromDb = async () => {
  try {
    const billJson = await AsyncStorage.getItem(CURRENT_BILL_KEY);
    if (!billJson) return null;
    
    const billData = JSON.parse(billJson);
    return {
      bill: JSON.parse(billData.bill),
      total: billData.total,
      customerName: billData.customerName
    };
  } catch (error) {
    console.error('Error loading current bill from AsyncStorage:', error);
    return null;
  }
};

// Clear all customer data
export const clearAllCustomerDataFromDb = async () => {
  try {
    await AsyncStorage.removeItem(CUSTOMER_KEY);
    console.log('All customer data cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error clearing customer data from AsyncStorage:', error);
    return false;
  }
};

// Get all historical lists from a specific date
export const getHistoricalListsByDate = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    const listsJson = await AsyncStorage.getItem(HISTORICAL_LIST_KEY);
    const allLists = listsJson ? JSON.parse(listsJson) : [];
    
    // Filter for matching date
    return allLists.filter(item => item.dateTime.startsWith(formattedDate));
  } catch (error) {
    console.error('Error getting historical lists from AsyncStorage:', error);
    return [];
  }
};

// Get count of all saved lists
export const getListCounts = async () => {
  try {
    const customersJson = await AsyncStorage.getItem(CUSTOMER_KEY);
    const historyJson = await AsyncStorage.getItem(HISTORICAL_LIST_KEY);
    
    const customers = customersJson ? JSON.parse(customersJson) : [];
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    return {
      customerCount: customers.length,
      historyCount: history.length
    };
  } catch (error) {
    console.error('Error getting list counts from AsyncStorage:', error);
    return { customerCount: 0, historyCount: 0 };
  }
};
