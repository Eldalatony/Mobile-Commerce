import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Barcode() {
  // 1. Bena5od el permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Lw lsa by7amel
  if (!permission) {
    return <View />;
  }

  // Lw el user lsa mdash allow
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 2. El function elly btemsak el raqam lma n-scan
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert('Zay el fol!', `Barcode Data: ${data}`);
  };

  return (
    <View style={styles.container}>
      {/* 3. Shashet el Camera mtazabata lel scan */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Zorar yzhar 3ashan t-scan tany */}
      {scanned && (
        <View style={styles.buttonContainer}>
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  }
});