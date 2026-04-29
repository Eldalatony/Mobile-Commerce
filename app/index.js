import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 12 }}>
      <Button title="Auth" onPress={() => router.push('/auth')} />
      <Button title="Products" onPress={() => router.push('/products')} />
      <Button title="Upload" onPress={() => router.push('/upload')} />
      <Button title="barcode" onPress={() => router.push('/barcode')} />
      <Button title="Shopping Cart" onPress={() => router.push('/shoppingCart')} />  

    </View>
  );
}
