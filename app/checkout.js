import React from 'react';
import { View, Button, Alert } from 'react-native';
import { supabase } from '../utils/supabase'; // Et2kd en el path da sa7 3ndk

export default function CheckoutScreen() {

  const handleSecureCheckout = async () => {
    try {
      // Data gahza mn 8er form 3shan n-test el Supabase insert
      const mockOrderDetails = {
        total_amount: 100.50,
        payment_status: 'Securely Paid',
        created_at: new Date()
      };

      // Bnb3t el data l table esmo 'orders' f Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([mockOrderDetails]);

      if (error) {
        throw error;
      }

      Alert.alert('✅ Done', 'Secure order saved to Supabase successfully!');
    } catch (error) {
      Alert.alert('❌ Error', error.message);
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button 
        title="Test Secure Checkout -> Supabase" 
        onPress={handleSecureCheckout} 
      />
    </View>
  );
}