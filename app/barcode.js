import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../utils/supabase'; 

export default function Barcode() {
  // B-n3raf el states bta3t el camera 3ashan nshoof el user wafa2 nfta7 el camera wala la2, w state tanya 3ashan n3raf e7na 3mlna scan 5alas wala lsa
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Law el app lsa by7amel w by-check el permissions, bn-zhar shasha fadya mo2aqatan l7d ma n3raf el nateega
  if (!permission) {
    return <View />;
  }

  // Law el user rafad ydy el app permission ysta5dem el camera, bn-zharlo zrar 3ashan ytlob el permission tany
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // El function de btshta8al awel ma el camera tl2ot barcode. B-twa2af el scan, w t-dawar fel database 3ala product 3ando nafs raqam el barcode da, w b3den t-tl3 risala bel nateega
  // 2. El function ba2et Async 3ashan n-fetch mn Supabase
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);

    // Bndawar fel database 3ala el product elly el barcode bta3o howa el scanned data
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', data)
      .single(); // single() 3ashan e7na 3ayzen product wa7ed bas

    if (error || !product) {
      Alert.alert('Not Found', `Mafeesh product fel database bel barcode da: ${data}`);
    } else {
      Alert.alert('Zay el fol!', `L2eena el product:\n\nName: ${product.name}\nPrice: $${product.price}`);
    }
  };

  // El UI el asasy bta3 el shasha. Fih el camera sh8ala fel background, w law 3mal scan bytl3lo zrar 3ashan y2dar y-scan tany law 7ab
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
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