import { useCallback, useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';
import * as Haptics from 'expo-haptics'; 

const STORAGE_KEY = 'cart';

export default function ProductsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // State initialization for managing the products array, UI loading status, error messages, and the cart badge counter.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Fetches the initial list of products from Supabase on component mount. It checks for an 'id' parameter to support deep linking and filters the query accordingly.
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select();
      
      if (id) {
        query = query.eq('id', id);
      }

      const { data, error } = await query;
      
      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    };
    
    fetchProducts();
  }, [id]);

  // Establishes a realtime subscription to the Supabase products table. Listens for any database updates (like stock changes) and instantly updates the local state without needing a manual refresh.
  useEffect(() => {
    const productChannel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((currentProducts) =>
            currentProducts.map((product) =>
              product.id === payload.new.id ? { ...product, ...payload.new } : product
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

  // Runs every time the screen comes into focus. It reads the cart data from AsyncStorage, calculates the total number of items, and updates the cart badge.
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

  // Handles adding items to the local shopping cart. It verifies stock availability, triggers a physical haptic response, updates the AsyncStorage array, and increments the local cart counter state.
  const addToCart = async (product) => {
    if (product.stock_quantity <= 0) {
      Alert.alert('Out of Stock', 'Sorry, this item is out of stock!');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    const cart = saved ? JSON.parse(saved) : [];

    let found = false;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) {
        cart[i].quantity = cart[i].quantity + 1;
        found = true;
        break;
      }
    }

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

  // Toggles the wishlist status of a product. It performs an optimistic UI update for instant feedback, then syncs the change to the Supabase database. If the database update fails, it reverts the local state to prevent desynchronization.
  const toggleFavourite = async (product) => {
    Haptics.selectionAsync();

    const next = !product.favourite;
    setProducts((curr) =>
      curr.map((p) => (p.id === product.id ? { ...p, favourite: next } : p))
    );
    const { error: sbError } = await supabase
      .from('products')
      .update({ favourite: next })
      .eq('id', product.id);
      
    if (sbError) {
      setProducts((curr) =>
        curr.map((p) =>
          p.id === product.id ? { ...p, favourite: !next } : p
        )
      );
      setError(sbError.message);
    }
  };

  // Main UI render block. Displays a dynamic header based on deep link status, handles loading and error fallbacks, and maps through the state to render individual product cards with their respective data and interaction buttons.
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {id && (
          <Text style={{ backgroundColor: '#ffeb3b', padding: 5, textAlign: 'center', marginBottom: 5 }}>
            Viewing via Link - ID: {id}
          </Text>
        )}
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Button
            title="Sign Out"
            color="red"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/'); 
            }}
          />
          <Button
            title={`Cart (${cartCount})`}
            onPress={() => router.push('/shoppingCart')}
          />
        </View>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <TouchableOpacity onPress={() => toggleFavourite(item)} hitSlop={8}>
                  <Text style={item.favourite ? styles.heartFilled : styles.heartEmpty}>
                    {item.favourite ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>

              {item.description ? <Text>{item.description}</Text> : null}
              <Text>${Number(item.price).toFixed(2)}</Text>
              
              <Text style={{ 
                color: item.stock_quantity > 0 ? 'green' : 'red', 
                fontWeight: 'bold',
                marginTop: 4 
              }}>
                {item.stock_quantity !== undefined ? `In Stock: ${item.stock_quantity}` : 'Stock info unavailable'}
              </Text>

              <View style={{ marginBottom: 10, marginTop: 10 }}>
                {item.image_url ? (
                  <Image 
                    source={{ uri: item.image_url }} 
                    style={{ width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' }} 
                  />
                ) : null}
              </View>
              
              <View style={styles.spacer} />
              
              <Button 
                title="Add to Cart" 
                onPress={() => addToCart(item)} 
                disabled={item.stock_quantity <= 0} 
              />
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
  heartFilled: {
    color: 'red',
    fontSize: 20,
  },
  heartEmpty: {
    color: 'black',
    fontSize: 20,
  }
});