import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select();
      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Products',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/auth')}>
              <Text style={styles.signInBtn}>Sign In</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#3ECF8E" style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : products.length === 0 ? (
          <Text style={styles.empty}>No products found.</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.description}>{item.description}</Text>
                ) : null}
                <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3ECF8E',
  },
  signInBtn: {
    color: '#3ECF8E',
    fontWeight: '600',
    fontSize: 15,
    marginRight: 4,
  },
  error: {
    color: '#e53e3e',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 15,
  },
});
