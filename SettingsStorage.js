import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing settings
const SETTINGS_KEY = 'KSCAL_APP_SETTINGS';

// Default settings
const DEFAULT_SETTINGS = {
  showCalculationsInPrint: true,
  showCustomerNameInPrint: true,
  showProductNameInPrint: true,
  roundOffCalculations: false,
  showAddProductButton: true,
  storeName: '',
  footerText: 'Thank you!',
  printFontSize: 'medium', // Add default print font size setting
};

/**
 * Save app settings to AsyncStorage
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Load app settings from AsyncStorage
 */
export const loadSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update a single setting value
 */
export const updateSetting = async (key, value) => {
  try {
    const currentSettings = await loadSettings();
    const updatedSettings = { ...currentSettings, [key]: value };
    await saveSettings(updatedSettings);
    return true;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    return false;
  }
};
