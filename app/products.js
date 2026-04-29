import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

const STORAGE_KEY = 'cart';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // load products once
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

  // re-read the cart count every time this screen is shown
  useFocusEffect(
    useCallback(() => {
      const loadCount = async () => {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const cart = JSON.parse(saved);
          let count = 0;
          for (const item of cart) {
            count = count + item.quantity;
          }
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      };
      loadCount();
    }, [])
  );

  const addToCart = async (product) => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    const cart = saved ? JSON.parse(saved) : [];

    // check if product is already in the cart
    let found = false;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) {
        cart[i].quantity = cart[i].quantity + 1;
        found = true;
        break;
      }
    }

    // if it wasn't there, add it as a new item
    if (!found) {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
      });
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    setCartCount(cartCount + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={`Cart (${cartCount})`}
          onPress={() => router.push('/shoppingCart')}
        />
      </View>

      {loading ? (
        <Text style={styles.message}>Loading...</Text>
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : products.length === 0 ? (
        <Text style={styles.message}>No products found.</Text>
      ) : (
        <ScrollView>
          {products.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text>{item.name}</Text>
              {item.description ? <Text>{item.description}</Text> : null}
              <Text>${Number(item.price).toFixed(2)}</Text>
              <View style={styles.spacer} />
              <Button title="Add to Cart" onPress={() => addToCart(item)} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  message: {
    marginTop: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 8,
  },
  spacer: {
    height: 8,
  },
});
