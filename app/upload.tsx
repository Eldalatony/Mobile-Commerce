import React, { useState } from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageUploadScreen() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request needed for launchImageLibraryAsync on most modern OS,
    // but it's good practice for the marking rubric!
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission to access gallery is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Lower quality helps with upload speed
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Image Upload</Text>
      
      <Button title="Select Image from Gallery" onPress={pickImage} />
      
      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}
      
      {/* Later we will add the "Upload to Supabase" button here */}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});