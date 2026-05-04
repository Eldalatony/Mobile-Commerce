import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Localization from 'expo-localization';

export default function LocalizationScreen() {
  // Get the device settings
  const locales = Localization.getLocales();
  
  // Extract only what is required by the project outline
  const userLanguage = locales[0].languageCode; // For the "Language" requirement
  const userCurrency = locales[0].currencyCode; // For the "Currency" requirement

  return (
    <View style={styles.container}>
      
      <View style={styles.card}>
        <Text style={styles.info}>Device Language: **{userLanguage}**</Text>
        <Text style={styles.info}>Default Currency: **{userCurrency}**</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  card: { 
    padding: 20, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  info: { 
    fontSize: 18, 
    marginVertical: 8 
  }
});