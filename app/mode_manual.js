import React, { useState } from 'react';
import { Text, StyleSheet, useColorScheme, Switch } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  // 1. Ne-shouf el mobile system mode f-el awel
  const systemTheme = useColorScheme(); 
  
  // 2. State 3ashan el manual toggle (Demo purposes)
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  // 3. Function elly b-t-ghayar el state lama el user y-doos switch
  const toggleTheme = (value) => {
    setIsDarkMode(value);
  };

  // 4. Dynamic Styles 3ala hasab el isDarkMode state
  const containerStyle = [
    styles.container, 
    { backgroundColor: isDarkMode ? '#242c40' : '#d0d0c0' }
  ];
  
  const textStyle = { 
    color: isDarkMode ? '#d0c0c0' : '#242c40',
    fontSize: 20,
    marginBottom: 10 
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={containerStyle}>
        <Text style={textStyle}>
          {isDarkMode ? 'dark' : 'light'} mode
        </Text>
        
        {/* 5. El Switch component (Dah elly hy-khalleek te-toggle) */}
        <Switch 
          value={isDarkMode} 
          onValueChange={toggleTheme} 
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;