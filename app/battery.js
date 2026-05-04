import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as Battery from 'expo-battery';

export default function App() {
  // 1. Get battery level (returns a number from 0.0 to 1.0)
  const batteryLevel = Battery.useBatteryLevel();
  
  // 2. Get battery state (Charging, Unplugged, Full, etc.)
  const batteryState = Battery.useBatteryState();

  // 3. Define what "critically low" means. Example: <= 20% AND not charging
  const isBatteryCritical = 
    batteryLevel !== null && 
    batteryLevel <= 0.20 && 
    batteryState !== Battery.BatteryState.CHARGING;

  // 4. Your sync function that gets paused if battery is low
  const handleSync = () => {
    if (isBatteryCritical) {
      // Ywa2af el function hna w ymn3 el sync
      Alert.alert("Sync Paused", "Battery is critically low. Background sync is disabled to save power.");
      return; 
    }
    
    // Hna t7ot el logic bta3 el sync lel database bta3tak
    Alert.alert("Syncing", "Data is syncing normally...");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Battery Level: {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : 'Loading...'}
      </Text>
      
      <Text style={[styles.text, { color: isBatteryCritical ? 'red' : 'green' }]}>
        Status: {isBatteryCritical ? 'Critically Low (Sync Paused) ' : 'Healthy / Charged'}
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Simulate Data Sync" 
          onPress={handleSync} 
          color={isBatteryCritical ? "gray" : "#28a745"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  }
});