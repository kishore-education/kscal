import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';

// Theme constants for consistency
const THEME = {
  background: '#000000',
  text: '#FFFFFF',
  border: '#333333',
  accent: '#222222',
};

const AppBar = ({ title, onMenuPress, onSettingsPress }) => {
  return (
    <>
      <StatusBar backgroundColor={THEME.background} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {onMenuPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
              <Text style={styles.iconText}>☰</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.title}>{title || 'Calculator'}</Text>
          
          {onSettingsPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: THEME.background,
  },
  container: {
    height: 56,
    backgroundColor: THEME.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  title: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: THEME.accent,
  },
  iconText: {
    color: THEME.text,
    fontSize: 24,
  },
});

export default AppBar;
