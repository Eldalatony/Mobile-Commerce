import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Localization from 'expo-localization';

export default function LocalizationScreen() {
  // We'll set the default state to whatever the device ACTUALLY uses
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('EGP');

  useEffect(() => {
    // 1. Detect Real Device Locale on Load
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const deviceLang = locales[0].languageCode;
      const deviceCurr = locales[0].currencyCode;
      
      // We only support 'en' or 'fr' in this prototype, default to 'en'
      setLanguage(deviceLang === 'fr' ? 'fr' : 'en');
      // Set currency to EGP or USD based on device, default EGP
      setCurrency(deviceCurr === 'USD' ? 'USD' : 'EGP');
    }
  }, []);

  const translations = {
    en: {
      title: 'Classic White T-Shirt',
      description: 'A comfortable, everyday cotton tee perfect for the summer weather.',
      langButton: '🇫🇷 Switch to French',
      currButton: '💵 Switch to USD',
    },
    fr: {
      title: 'T-Shirt Blanc Classique',
      description: 'Un t-shirt en coton confortable pour tous les jours, parfait pour l\'été.',
      langButton: '🇬🇧 Switch to English',
      currButton: '🇪🇬 Switch to EGP',
    }
  };

  const basePriceUSD = 15;
  const conversionRate = 47; 

  const displayPrice = currency === 'USD' 
    ? `$${basePriceUSD}` 
    : `${basePriceUSD * conversionRate} EGP`;

  return (
    <View style={styles.container}>
      
      {/* Real Device Detection Info (from your screenshot) */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Device Detected Language: **{language}**</Text>
        <Text style={styles.infoText}>Device Detected Currency: **{currency}**</Text>
      </View>

      <View style={styles.spacer} />

      {/* The Demo Product Card */}
      <View style={styles.productCard}>
        <Text style={styles.title}>{translations[language].title}</Text>
        <Text style={styles.description}>{translations[language].description}</Text>
        <Text style={styles.price}>{displayPrice}</Text>
      </View>

      <View style={styles.spacer} />

      {/* Manual Toggle Buttons for the Dr. */}
      <Button 
        title={translations[language].langButton} 
        onPress={() => setLanguage(language === 'en' ? 'fr' : 'en')} 
      />
      
      <View style={styles.smallSpacer} />
      
      <Button 
        title={translations[language].currButton} 
        onPress={() => setCurrency(currency === 'EGP' ? 'USD' : 'EGP')} 
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  infoCard: {
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b0c4de',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginVertical: 4,
    color: '#333'
  },
  productCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  spacer: {
    height: 30,
  },
  smallSpacer: {
    height: 10,
  }
});