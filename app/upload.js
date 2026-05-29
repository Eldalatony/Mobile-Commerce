import { useState } from 'react';
import { Button, Image, View, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';

const BUCKET = 'images';

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

  // 🚀 EL FUNCTION EL GDEDA HENA 🚀
  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);

    try {
      console.log('Starting upload...');
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = decode(base64);

      const ext = image.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}.${ext}`;
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      // 1. Upload to Supabase Storage Bucket
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType, upsert: false });

      if (error) {
        throw error;
      }

      // 2. Get the Public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);
        
      const imageUrl = publicUrlData.publicUrl;

      // 3. Create a NEW Product in the Database using this image URL
      const { error: dbError } = await supabase
        .from('products')
        .insert([
          { 
            name: 'New Custom Product', // Esm default
            description: 'Uploaded from camera/gallery',
            price: 99.99, // Se3r default
            image_url: imageUrl, // B-nsave el link bta3 el sora hena
            stock_quantity: 10 
          }
        ]);

      if (dbError) {
        throw dbError;
      }

      Alert.alert('Success!', 'Image uploaded AND added to your products!');
      setImage(null);
      
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
            color="#28a745"
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
    alignItems: 'center',
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