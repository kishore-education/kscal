import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CustomerBillScreen = ({ route, navigation }) => {
  const { customer } = route.params;

  const handleEdit = () => {
    navigation.navigate('Calculator', { bill: customer.bill, total: customer.total, customerName: customer.name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text style={styles.customerDateTime}>{customer.dateTime}</Text>
      <ScrollView style={styles.billContainer}>
        {customer.bill.map((item, index) => (
          <View key={index} style={styles.billItem}>
            <Text style={styles.billText}>
              {item.id}. {item.expression} = {item.result}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Edit</Text>
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
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  customerDateTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  billContainer: {
    flex: 1,
  },
  billItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  billText: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomerBillScreen;
