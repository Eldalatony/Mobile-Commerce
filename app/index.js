import React, { useEffect, useState } from 'react';
import { ScrollView, Button, View, Text } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { supabase } from '../utils/supabase';

export default function Index() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hena el Bawab by-check 3ala el JWT Token fel AsyncStorage!
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Checking for Token...</Text>
      </View>
    );
  }

  // LAW FEEH TOKEN: Wadeh 3ala el products 3alatool (Dah elly haybher el Dr!)
  if (session) {
    return <Redirect href="/products" />;
  }

  // LAW MAFEESH TOKEN: A3redlo saf7et el zrayer 3ashan ye3mel Auth
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 50, paddingHorizontal: 20 }}>
      <Button title="Auth (Login/Signup)" onPress={() => router.push('/auth')} />
      <View style={{ height: 10 }} />
      <Button title="Products" onPress={() => router.push('/products')} />
      <View style={{ height: 10 }} />
      <Button title="Upload" onPress={() => router.push('/upload')} />
      <View style={{ height: 10 }} />
      <Button title="Barcode" onPress={() => router.push('/barcode')} />
      <View style={{ height: 10 }} />
      <Button title="Shopping Cart" onPress={() => router.push('/shoppingCart')} />  
      <View style={{ height: 10 }} />
      <Button title="Notification" onPress={() => router.push('/notification')} />  
      <View style={{ height: 10 }} />
      <Button title="Check Network" onPress={() => router.push('/checknetwork')} /> 
      <View style={{ height: 10 }} />
      <Button title="Receipt" onPress={() => router.push('/receipt')} />  
      <View style={{ height: 10 }} />
      <Button title="Checkout" onPress={() => router.push('/checkout')} />   
      <View style={{ height: 10 }} />
      <Button title="Battery" onPress={() => router.push('/battery')} />   
      <View style={{ height: 10 }} />
      <Button title="Feedback" onPress={() => router.push('/feedback')} />  
      <View style={{ height: 10 }} />
      <Button title="Currency" onPress={() => router.push('/currency')} />  
      <View style={{ height: 10 }} />
      <Button title="Mode Automatic" onPress={() => router.push('/mode_automatic')} />  
      <View style={{ height: 10 }} />
      <Button title="Mode Manual" onPress={() => router.push('/mode_manual')} />
      <View style={{ height: 10 }} />
      <Button title="Offline Browsing" onPress={() => router.push('/offlinebrowsing')} /> 
      <View style={{ height: 10 }} />
      <Button title="Wish List" onPress={() => router.push('/wishlist')} />  
      <View style={{ height: 10 }} />
      <Button title="Order History" onPress={() => router.push('/order_history')} />
      <View style={{ height: 10 }} />
      <Button title="StoreLocator" onPress={() => router.push('/storelocator')} />                
    </ScrollView>
  );
}