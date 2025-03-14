import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing products
const PRODUCTS_KEY = 'KSCAL_PRODUCTS';

/**
 * Save products to AsyncStorage
 */
export const saveProducts = async (products) => {
  try {
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    return false;
  }
};

/**
 * Load products from AsyncStorage
 */
export const loadProducts = async () => {
  try {
    const productsJson = await AsyncStorage.getItem(PRODUCTS_KEY);
    if (productsJson) {
      return JSON.parse(productsJson);
    }
    return [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

/**
 * Clear all products
 */
export const clearProducts = async () => {
  try {
    await AsyncStorage.removeItem(PRODUCTS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing products:', error);
    return false;
  }
};
