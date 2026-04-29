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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission to access gallery is required!');
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

  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);

    try {
      console.log('tagroba');
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
        Alert.alert('Uploaded', JSON.stringify(data));
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
      <Button title="Select Image from Gallery" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {image && (
        <Button
          title={uploading ? 'Uploading...' : 'Upload'}
          onPress={uploadImage}
          disabled={uploading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000',
  },
});
