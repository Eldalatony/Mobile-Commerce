import { ScrollView, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView >
      <Button title="Auth" onPress={() => router.push('/auth')} />
      <Button title="Products" onPress={() => router.push('/products')} />
      <Button title="Upload" onPress={() => router.push('/upload')} />
      <Button title="barcode" onPress={() => router.push('/barcode')} />
      <Button title="Shopping Cart" onPress={() => router.push('/shoppingCart')} />  
      <Button title="Notification" onPress={() => router.push('/notification')} />  
      <Button title="checknetwork" onPress={() => router.push('/checknetwork')} /> 
      <Button title="receipt" onPress={() => router.push('/receipt')} />  
      <Button title="checkout" onPress={() => router.push('/checkout')} />   
      <Button title="battery" onPress={() => router.push('/battery')} />   
      <Button title="feedback" onPress={() => router.push('/feedback')} />  
      <Button title="currency" onPress={() => router.push('/currency')} />  
      <Button title="mode automatic" onPress={() => router.push('/mode_automatic')} />  
      <Button title="mode manual" onPress={() => router.push('/mode_manual')} />
      <Button title="offline browsing" onPress={() => router.push('/offlinebrowsing')} /> 
      <Button title="wish list" onPress={() => router.push('/wishlist')} />  
      <Button title="order history" onPress={() => router.push('/order_history')} />                
    </ScrollView>
  );
}
