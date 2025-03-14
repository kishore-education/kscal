import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppHeader = ({ title, onMenuPress, theme = 'dark' }) => {
  // Choose styles based on theme
  const isLight = theme === 'light';
  const isBlack = theme === 'black';
  
  return (
    <View>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={isLight ? "#ffffff" : isBlack ? "#000000" : "#121212"} 
      />
      <View style={[
        styles.header,
        isLight ? styles.headerLight : isBlack ? styles.headerBlack : styles.headerDark
      ]}>
        <Text style={[
          styles.title,
          isLight ? styles.titleLight : styles.titleDark
        ]}>{title}</Text>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Ionicons 
            name="menu" 
            size={24} 
            color={isLight ? "#121212" : "#ffffff"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  headerDark: {
    backgroundColor: '#121212',
  },
  headerBlack: {
    backgroundColor: '#000000',
  },
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleDark: {
    color: '#ffffff',
  },
  titleLight: {
    color: '#121212',
  },
  menuButton: {
    padding: 8,
  }
});

export default AppHeader;
