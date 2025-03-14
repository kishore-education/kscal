import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { loadCustomerListFromStorage } from './StorageService';

const SavedBillsScreen = ({ navigation }) => {
  const [savedBills, setSavedBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const fetchSavedBills = async () => {
      const bills = await loadCustomerListFromStorage();
      setSavedBills(bills.reverse()); // Reverse the list to show the last saved bill first
    };

    fetchSavedBills();
  }, []);

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
  };

  const handleEditBill = () => {
    if (selectedBill) {
      navigation.navigate('Calculator', {
        bill: selectedBill.bill,
        total: selectedBill.total,
        customerName: selectedBill.customerName,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Bills</Text>
      <ScrollView style={styles.scrollView}>
        {savedBills.map((bill, index) => (
          <TouchableOpacity key={index} style={styles.billItem} onPress={() => handleSelectBill(bill)}>
            <Text style={styles.billText}>{bill.name}</Text>
            <Text style={styles.billText}>Total: {bill.total}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedBill && (
        <View style={styles.selectedBillContainer}>
          <Text style={styles.selectedBillTitle}>Selected Bill</Text>
          <Text style={styles.selectedBillText}>Name: {selectedBill.name}</Text>
          <Text style={styles.selectedBillText}>Total: {selectedBill.total}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditBill}>
            <Text style={styles.editButtonText}>Edit Bill</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  billItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  billText: {
    fontSize: 16,
  },
  selectedBillContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 20,
  },
  selectedBillTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedBillText: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SavedBillsScreen;
