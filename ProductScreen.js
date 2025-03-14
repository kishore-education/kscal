import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal
} from 'react-native';
import AppHeader from './AppHeader';

const ProductScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [usedProductIds, setUsedProductIds] = useState([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [isQuickAddMode, setIsQuickAddMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProductSection, setShowAddProductSection] = useState(false);
  
  // Add a ref for the search input
  const searchInputRef = useRef(null);

  // Load products from AsyncStorage when component mounts
  useEffect(() => {
    // loadProducts();
  }, []);

  // Check if we're in "add product" mode from the floating button
  useEffect(() => {
    if (route.params?.addProductMode) {
      setIsAddingProduct(true);
      setIsQuickAddMode(true);
    }
  }, [route.params?.addProductMode]);

  // Check for used products in the current bill
  useEffect(() => {
    if (route.params?.bill) {
      // Extract product IDs from bill items that are products
      const productIdsInBill = route.params.bill
        .filter(item => item.isProduct)
        .map(item => {
          // Try to extract product ID from the bill item
          try {
            // Assume product ID is embedded in the bill item id or can be extracted from expression
            const nameMatch = item.expression.match(/^(.*?) x/);
            const productName = nameMatch ? nameMatch[1] : null;
            
            if (productName) {
              // Find the product by name
              const foundProduct = products.find(p => p.name === productName);
              return foundProduct ? foundProduct.id : null;
            }
            return null;
          } catch (err) {
            return null;
          }
        })
        .filter(id => id !== null);
      
      setUsedProductIds(productIdsInBill);
    }
  }, [route.params?.bill, products]);

  // Filter products whenever the list changes or used IDs change
  useEffect(() => {
    let filtered = products;
    
    // First filter by search query if it exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.price.toString().includes(query)
      );
    }
    
    // Then apply the existing filter logic
    if (!route.params?.showAllProducts) {
      filtered = filtered.filter(product => !usedProductIds.includes(product.id));
    }
    
    setFilteredProducts(filtered);
  }, [products, usedProductIds, route.params?.showAllProducts, searchQuery]);

  const handleAddProduct = () => {
    if (!productName || !productPrice) {
      Alert.alert('Error', 'Please enter both product name and price');
      return;
    }

    const price = parseFloat(productPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: productName,
      price: price
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    
    // If in quick add mode, automatically select the newly created product
    if (isQuickAddMode) {
      setSelectedProduct(newProduct);
      setQuantity('1');
      setShowQuantityModal(true);
      setIsQuickAddMode(false);
    } else {
      setProductName('');
      setProductPrice('');
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity('1');
    setShowQuantityModal(true);
  };

  const handleQuantityConfirm = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Calculate the raw total
    let total = selectedProduct.price * qty;
    
    // Apply rounding if specified in route params
    const roundOffCalculations = route.params?.roundOffCalculations || false;
    if (roundOffCalculations) {
      total = Math.ceil(total);
      console.log('Rounded product total:', total);
    } else {
      total = parseFloat(total.toFixed(2));
    }

    const selectedProductWithQuantity = {
      ...selectedProduct,
      quantity: qty,
      total: total
    };

    // Create a bill item for the calculator
    const expression = `${selectedProductWithQuantity.name} x ${qty}`;
    const result = selectedProductWithQuantity.total;
    
    // Extract product ID to mark it as used
    const productId = selectedProduct.id;
    
    // Add the product ID to the list of used products
    setUsedProductIds(prev => [...prev, productId]);

    // Create bill item in the format expected by the calculator
    const billItem = {
      id: new Date().getTime().toString(),
      expression: expression,
      result: result,
      isProduct: true,
      productId: productId // Store the product ID for reference
    };

    // Get existing bill and total from route params
    const existingBill = route.params?.bill || [];
    const existingTotal = route.params?.total || 0;
    const existingCustomerName = route.params?.customerName || '';
    
    const updatedBill = [...existingBill, billItem];
    // Ensure we're adding a number, not an object
    const updatedTotal = parseFloat((existingTotal + result).toFixed(2));

    // Navigate back to Calculator with updated bill
    navigation.navigate('Calculator', {
      bill: updatedBill,
      total: updatedTotal,
      customerName: existingCustomerName
    });
    
    setShowQuantityModal(false);
  };

  // Focus on search when directed by navigation params
  useEffect(() => {
    if (route.params?.focusSearch && searchInputRef.current) {
      // Short delay to ensure the component is fully rendered
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [route.params?.focusSearch]);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleProductSelect(item)}
      onLongPress={() => Alert.alert(
        'Delete Product',
        `Do you want to delete ${item.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => handleDeleteProduct(item.id), style: 'destructive' }
        ]
      )}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title={isQuickAddMode ? "Add New Product" : "Products"} 
        onMenuPress={() => {
          // If in quick add mode, going back should return to calculator
          if (isQuickAddMode) {
            navigation.navigate('Calculator', {
              bill: route.params?.bill || [],
              total: route.params?.total || 0,
              customerName: route.params?.customerName || '',
            });
          } else {
            navigation.navigate('Calculator');
          }
        }} 
      />
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={[
            styles.toggleAddProductButton,
            showAddProductSection && styles.toggleAddProductButtonActive
          ]}
          onPress={() => setShowAddProductSection(!showAddProductSection)}
        >
          <Text style={styles.toggleAddProductButtonText}>
            {showAddProductSection ? "Hide Add Product" : "Show Add Product"}
          </Text>
        </TouchableOpacity>

        {showAddProductSection && (
          <>
            {!isAddingProduct ? (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setIsAddingProduct(true)}
              >
                <Text style={styles.addButtonText}>+ Add New Product</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addProductForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={productName}
                  onChangeText={setProductName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="decimal-pad"
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton]}
                    onPress={() => {
                      setIsAddingProduct(false);
                      setProductName('');
                      setProductPrice('');
                    }}
                  >
                    <Text style={styles.formButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton]}
                    onPress={handleAddProduct}
                  >
                    <Text style={styles.formButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoFocus={route.params?.focusSearch}
          />
        </View>

        <Text style={styles.sectionTitle}>Your Products</Text>
        
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsList}
          />
        ) : (
          <Text style={styles.emptyText}>
            {products.length === 0 ? 
              "No products added yet" : 
              searchQuery.trim() ? "No matches found" :
              "All products are in use. Clear bill to reset."}
          </Text>
        )}

        {/* Show a button to toggle visibility when there are used products */}
        {usedProductIds.length > 0 && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => navigation.setParams({ 
              showAllProducts: !route.params?.showAllProducts 
            })}
          >
            <Text style={styles.toggleButtonText}>
              {route.params?.showAllProducts ? "Hide Used Products" : "Show All Products"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <Text style={styles.productDetails}>
              {selectedProduct?.name} - ₹{selectedProduct?.price?.toFixed(2)}
            </Text>
            
            <TextInput
              style={styles.quantityInput}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowQuantityModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={handleQuantityConfirm}
              >
                <Text style={styles.modalButtonText}>Add to Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addProductForm: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formButton: {
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  formButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productsList: {
    paddingBottom: 20,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 5, // Use margin instead of marginBottom for equal spacing
    flex: 1, // Allow items to flex to fill available space
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 100, // Minimum height for the box
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    padding: 10,
    fontSize: 16,
  },
  toggleAddProductButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleAddProductButtonActive: {
    backgroundColor: '#0056b3',
  },
  toggleAddProductButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProductScreen;
