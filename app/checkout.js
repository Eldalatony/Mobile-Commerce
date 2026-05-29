import React from 'react';
import { View, Button, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics'; // <-- Import Haptics

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

      // 2. Nehseb el total amount mn el products (price * quantity)
      const totalAmount = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

      // 3. N-gehez el data, w nzawed "order_items" elly 3mlnah fel Supabase
      const orderDetails = {
        total_amount: totalAmount, 
        payment_status: 'Securely Paid',
        order_items: cartItems 
      };

      // 4. Bnb3t el data l table 'orders'
      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderDetails]);

      if (orderError) {
        throw orderError;
      }

      // 🚀 5. EL MAGIC HENA: N-update el stock fel Supabase 🚀
      // B-nlff 3ala kol product fel cart w n-na2as el stock bta3o
      for (const item of cartItems) {
        // Awel 7aga: n-geeb el stock el 7aly lel product da mn database
        const { data: productData } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (productData) {
          // Tany 7aga: Nehseb el stock el gded (Current Stock - Cart Quantity)
          const newStock = productData.stock_quantity - item.quantity;
          
          // Talet 7aga: N-save el stock el gded
          await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', item.id);
        }
      }

      // 6. Nefaddy el cart 3ashan el order 5alas et3amal
      await AsyncStorage.removeItem('cart');

      // 7. TRIGGER HAPTIC SUCCESS (Requirement 15)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert('✅ Done', 'Order placed! Stock updated in realtime.');
    } catch (error) {
      // Law 7asal error ne-trigger error vibration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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