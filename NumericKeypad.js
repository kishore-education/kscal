import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';

const NumericKeypad = ({ onKeyPress, onCalculate }) => {
  // Add state to track scroll attempts and scroll enabled status
  const [scrollAttempts, setScrollAttempts] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  // Define the keypad layout - removing operators as they'll be on the right
  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', '⌫'],
  ];
  
  // Operators for the right side bottom section
  const operators = ['+', '-', '/', '%'];
  
  // Special buttons for the scrollable section
  const specialButtons = [
    { key: '*', color: '#007BFF', onPress: () => handleKeyPress('*') },
    { key: '=', color: '#28a745', onPress: onCalculate }
  ];

  const handleKeyPress = (key) => {
    // Handle backspace separately
    if (key === '⌫') {
      onKeyPress('backspace');
      return;
    }
    onKeyPress(key);
  };

  // Add handler for scroll attempts
  const handleScrollAttempt = () => {
    if (!scrollEnabled) {
      const newAttempts = scrollAttempts + 1;
      setScrollAttempts(newAttempts);
      
      if (newAttempts >= 2) {
        setScrollEnabled(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content - keypad on left, special buttons on right */}
      <View style={styles.content}>
        {/* Scrollable keypad area */}
        <View style={styles.keypadArea}>
          {keys.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.6}
                  style={[
                    styles.keyButton,
                    key === '⌫' ? styles.backspaceButton : {}
                  ]}
                  onPress={() => handleKeyPress(key)}
                >
                  <Text style={[
                    styles.keyText,
                    key === '⌫' ? styles.operatorText : {}
                  ]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Right side containing both special buttons and operators in a single ScrollView */}
        <View style={styles.rightSideContainer}>
          <ScrollView 
            style={styles.rightSideScroll} 
            contentContainerStyle={styles.rightSideScrollContent}
            scrollEnabled={scrollEnabled}
            onTouchMove={handleScrollAttempt}
            onScrollBeginDrag={handleScrollAttempt}
          >
            {!scrollEnabled && scrollAttempts > 0 && (
              <View style={styles.scrollHint}>
                <Text style={styles.hintText}>
                  {`Scroll again to enable (${scrollAttempts}/2)`}
                </Text>
              </View>
            )}
            {/* Special buttons (* and =) with custom heights for ratio */}
            <TouchableOpacity 
              key={specialButtons[0].key}
              activeOpacity={0.6}
              style={[styles.specialButton, styles.multiplyButton]}
              onPress={specialButtons[0].onPress}
            >
              <Text style={styles.specialButtonText}>{specialButtons[0].key}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              key={specialButtons[1].key}
              activeOpacity={0.5}
              style={[styles.specialButton, styles.equalsButton]}
              onPress={specialButtons[1].onPress}
            >
              <Text style={styles.specialButtonText}>{specialButtons[1].key}</Text>
            </TouchableOpacity>
            
            {/* Operators (+, -, /, %) */}
            {operators.map(op => (
              <TouchableOpacity
                key={op}
                activeOpacity={0.6}
                style={styles.operatorButton}
                onPress={() => handleKeyPress(op)}
              >
                <Text style={styles.operatorText}>{op}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const buttonSize = (width * 0.75) / 3 - 8; // Adjusted for 3 buttons per row
const rightSideWidth = width * 0.25; // 25% of width for right side

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#121212', // Dark background
    borderTopWidth: 1,
    borderColor: '#333', // Darker border
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    height: height * 0.415,
  },
  keypadArea: {
    width: width * 0.75,
    paddingRight: 4,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  keyButton: {
    backgroundColor: '#1e1e1e', // Dark button background
    width: buttonSize,
    height: buttonSize * 0.95,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3, // Increased shadow opacity for dark theme
    shadowRadius: 2,
    elevation: 3,
  },
  backspaceButton: {
    backgroundColor: '#8b0000', // Darker red
  },
  keyText: {
    fontSize: 40, // Reduced from 48
    fontWeight: 'bold',
    color: '#ffffff', // White text for contrast
  },
  rightSideContainer: {
    width: rightSideWidth,
    height: '100%',
  },
  rightSideScroll: {
    flex: 1,
  },
  rightSideScrollContent: {
    paddingVertical: 1,
  },
  specialButton: {
    width: rightSideWidth - 4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  multiplyButton: {
    backgroundColor: '#0056b3', // Darker blue
    height: (height * 0.415 * 0.25) - 2, // 1/4 of the visible height (using correct content height)
  },
  equalsButton: {
    backgroundColor: '#1c6b33', // Darker green
    height: (height * 0.415 * 0.75) - 2, // 3/4 of the visible height (using correct content height)
  },
  operatorButton: {
    backgroundColor: '#0056b3', // Darker blue
    width: rightSideWidth - 4,
    height: (height * 0.38 * 0.15) - 3, // Each operator button takes 15% of the scroll area height
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  operatorText: {
    color: '#ffffff', // White text
    fontSize: 24, // Reduced from 28
    fontWeight: 'bold',
  },
  specialButtonText: {
    color: '#ffffff', // White text
    fontSize: 32, // Reduced from 38
    fontWeight: 'bold',
  },
  scrollHint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    zIndex: 10,
  },
  hintText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default NumericKeypad;
