import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';

const MenuModal = ({ 
  isVisible, 
  onClose, 
  showCalculationsInPrint,
  toggleCalculationsInPrint,
  showCustomerNameInPrint,
  toggleCustomerNameInPrint,
  showProductNameInPrint,
  toggleProductNameInPrint,
  roundOffCalculations,
  toggleRoundOffCalculations,
  showAddProductButton,
  toggleShowAddProductButton,
  storeName,
  setStoreName,
  footerText,
  setFooterText,
  printFontSize,
  setPrintFontSize,
  onViewSavedBills // Add this prop
}) => {
  const [storeNameInput, setStoreNameInput] = useState('');
  const [footerTextInput, setFooterTextInput] = useState('');

  useEffect(() => {
    if (isVisible) {
      setStoreNameInput(storeName || '');
      setFooterTextInput(footerText || 'Thank you!');
    }
  }, [isVisible, storeName, footerText]);

  const handleSaveStoreName = () => {
    setStoreName(storeNameInput);
  };

  const handleSaveFooterText = () => {
    setFooterText(footerTextInput);
  };

  // Font size options for print
  const fontSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ];

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu</Text>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={toggleCalculationsInPrint}
              >
                <View style={[
                  styles.checkboxBox, 
                  showCalculationsInPrint && styles.checkboxChecked
                ]}>
                  {showCalculationsInPrint && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Show Calculations on Print</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={toggleCustomerNameInPrint}
              >
                <View style={[
                  styles.checkboxBox, 
                  showCustomerNameInPrint && styles.checkboxChecked
                ]}>
                  {showCustomerNameInPrint && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Show Customer Name on Print</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={toggleProductNameInPrint}
              >
                <View style={[
                  styles.checkboxBox, 
                  showProductNameInPrint && styles.checkboxChecked
                ]}>
                  {showProductNameInPrint && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Show Product Name on Print</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={toggleRoundOffCalculations}
              >
                <View style={[
                  styles.checkboxBox, 
                  roundOffCalculations && styles.checkboxChecked
                ]}>
                  {roundOffCalculations && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Round Off Calculations</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={toggleShowAddProductButton}
              >
                <View style={[
                  styles.checkboxBox, 
                  showAddProductButton && styles.checkboxChecked
                ]}>
                  {showAddProductButton && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Show Add Product Button</Text>
              </TouchableOpacity>
            </View>

            {/* Font Size Selector */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Print Font Size:</Text>
              <View style={styles.fontSizeButtonsContainer}>
                {fontSizeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.fontSizeButton,
                      printFontSize === option.value && styles.fontSizeButtonSelected
                    ]}
                    onPress={() => setPrintFontSize(option.value)}
                  >
                    <Text 
                      style={[
                        styles.fontSizeButtonText,
                        printFontSize === option.value && styles.fontSizeButtonTextSelected
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.storeNameContainer}>
              <Text style={styles.storeNameLabel}>Store Name:</Text>
              <TextInput
                style={styles.storeNameInput}
                value={storeNameInput}
                onChangeText={setStoreNameInput}
                placeholder="Enter store name for receipt"
              />
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveStoreName}
              >
                <Text style={styles.saveButtonText}>Save Store Name</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.storeNameContainer}>
              <Text style={styles.storeNameLabel}>Footer Text:</Text>
              <TextInput
                style={[styles.storeNameInput, styles.multilineInput]}
                value={footerTextInput}
                onChangeText={setFooterTextInput}
                placeholder="Enter footer text for receipt"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveFooterText}
              >
                <Text style={styles.saveButtonText}>Save Footer Text</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={onViewSavedBills} // Add this button
            >
              <Text style={styles.menuItemText}>View Saved Bills</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  modalContent: {
    width: '90%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuItem: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuItemText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  checkboxContainer: {
    width: '100%',
    marginVertical: 15,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  sectionContainer: {
    width: '100%',
    marginVertical: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fontSizeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontSizeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    margin: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  fontSizeButtonSelected: {
    backgroundColor: '#007BFF',
  },
  fontSizeButtonText: {
    color: '#007BFF',
  },
  fontSizeButtonTextSelected: {
    color: '#fff',
  },
  storeNameContainer: {
    width: '100%',
    marginVertical: 15,
  },
  storeNameLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storeNameInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007BFF',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});

export default MenuModal;
