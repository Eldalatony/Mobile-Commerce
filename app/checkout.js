import React from 'react';
import { View, Button, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Lazm ne3mel import hena

export default function CheckoutScreen() {

  const handleSecureCheckout = async () => {
    try {
      // 1. Negeeb el cart items mn el AsyncStorage
      const cartData = await AsyncStorage.getItem('cart');
      const cartItems = cartData ? JSON.parse(cartData) : [];

      // Law el cart fadya, may3mlsh checkout
      if (cartItems.length === 0) {
        Alert.alert('⚠️ Cart is empty', 'Please add some products to your cart first.');
        return;
      }

      // 2. Nehseb el total amount mn el products elly fel cart
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

      // 3. N-gehez el data, w nzawed "order_items" elly 3mlnah fel Supabase
      const orderDetails = {
        total_amount: totalAmount, 
        payment_status: 'Securely Paid',
        order_items: cartItems // Hena el sater el mohem! Bneb3at el array kolo
        // created_at: supabase by3mlha generate lwa7do f msh lazm nb3tha
      };

      // 4. Bnb3t el data l table 'orders'
      const { data, error } = await supabase
        .from('orders')
        .insert([orderDetails]);

      if (error) {
        throw error;
      }

      // 5. Nefaddy el cart 3ashan el order 5alas et3amal
      await AsyncStorage.removeItem('cart');

      Alert.alert('✅ Done', 'Order with items saved to Supabase successfully!');
    } catch (error) {
      Alert.alert('❌ Error', error.message);
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button 
        title="Confirm Order -> Supabase" 
        onPress={handleSecureCheckout} 
      />
    </View>
  );
}