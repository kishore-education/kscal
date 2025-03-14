import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CustomerListScreen = ({ route, navigation }) => {
  const { customerList: initialCustomerList } = route.params;
  const [customerList, setCustomerList] = useState(initialCustomerList);

  const handleCustomerPress = (customer) => {
    navigation.navigate('CustomerBill', { customer });
  };

  const handleDeleteCustomer = (customerName) => {
    const updatedList = customerList.filter((customer) => customer.name !== customerName);
    setCustomerList(updatedList);
  };

  const handleClearAll = () => {
    setCustomerList([]);
    navigation.navigate('Calculator', { action: 'clearAllCustomers' });
  };

  useEffect(() => {
    if (route.params?.action === 'deleteCustomer') {
      const { customerName } = route.params;
      const updatedList = customerList.filter((customer) => customer.name !== customerName);
      setCustomerList(updatedList);
    }
  }, [route.params?.action]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {customerList.map((customer, index) => (
          <View key={index} style={styles.customerItem}>
            <TouchableOpacity onPress={() => handleCustomerPress(customer)}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerDateTime}>{customer.dateTime}</Text>
              <Text style={styles.customerTotal}>Total: {customer.total}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteCustomer(customer.name)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
        <Text style={styles.clearAllButtonText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  customerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerDateTime: {
    fontSize: 14,
    color: '#666',
  },
  customerTotal: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearAllButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  clearAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomerListScreen;
