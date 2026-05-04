import { useState } from 'react';
import { Button, Image, View, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';

const BUCKET = 'product-images';

export default function ImageUploadScreen() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access gallery is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to capture a new photo using the camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);

    try {
      console.log('Starting upload...');
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('[upload] base64 length:', base64.length);
      const bytes = decode(base64);
      console.log('[upload] bytes byteLength:', bytes.byteLength);

      const ext = image.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}.${ext}`;
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType, upsert: false });

      console.log('[upload] response data:', data);
      console.log('[upload] response error:', error);

      if (error) {
        Alert.alert('Upload failed', error.message);
      } else {
        Alert.alert('Uploaded', 'Your product image has been uploaded successfully.');
        setImage(null);
      }
    } catch (e) {
      console.log('[upload] caught:', e);
      Alert.alert('Error', e.message ?? String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Image Upload</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Take a Photo" onPress={takePhoto} />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Select from Gallery" onPress={pickImage} />
      </View>

      {image && <Image source={{ uri: image }} style={styles.image} />}
      
      {image && (
        <View style={styles.uploadContainer}>
          <Button
            title={uploading ? 'Uploading...' : 'Upload Image to Supabase'}
            onPress={uploadImage}
            disabled={uploading}
            color="#28a745" // Giving the upload button a distinct color
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center', // Center content horizontally
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  uploadContainer: {
    width: '100%',
    marginTop: 12,
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
});