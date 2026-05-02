import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import * as Network from 'expo-network';

export default function NetworkScreen() {
  // States 34an n7faz feha el m3lomat
  const [isConnected, setIsConnected] = useState(true);
  const [networkType, setNetworkType] = useState('UNKNOWN');
  const [ipAddress, setIpAddress] = useState('Fetching...');
  const [isAirplaneMode, setIsAirplaneMode] = useState(false);

  useEffect(() => {
    const checkNetworkDetails = async () => {
      try {
        // Hena bnst5dm el await gowa async function
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected && networkState.isInternetReachable);
        setNetworkType(networkState.type);

        // Bngeeb el IP address
        const ip = await Network.getIpAddressAsync();
        setIpAddress(ip);

        

      } catch (error) {
        console.error("Error fetching network details:", error);
        setIsConnected(false);
      }
    };

    // N-check awel mara
    checkNetworkDetails();

    // Polling kol 3 sawany 34an n-update el 7ala 
    const intervalId = setInterval(checkNetworkDetails, 3000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.bannerText}>No Internet Connection. You are offline.</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>Network Details</Text>
        <Text style={styles.text}>Status: {isConnected ? " Online" : " Offline"}</Text>
        <Text style={styles.text}>Network Type: {networkType}</Text>
        <Text style={styles.text}>IP Address: {ipAddress}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  offlineBanner: {
    backgroundColor: '#ff4d4d', 
    padding: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'absolute', 
    top: 40, 
    width: '100%', 
    zIndex: 10,
  },
  bannerText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  text: { 
    fontSize: 16, 
    marginVertical: 5 
  }
});