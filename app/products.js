import { useCallback, useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// 1. Zowedna useLocalSearchParams fel import hena
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';

const STORAGE_KEY = 'cart';

export default function ProductsScreen() {
  const router = useRouter();
  // 2. El hook delwa2ty hayel2ot el ID elly gai mel link (zay: shopapp://products?id=123)
  const { id } = useLocalSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // UseEffect 1: Fetch initial products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      // Bnebda2 el query 3ady
      let query = supabase.from('products').select();
      
      // LAW feeh 'id' gai min el link, ne-filter el data bel id da bas
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

  // el REALTIME STOCK UPDATES
  useEffect(() => {
    const productChannel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // N-update el state bta3 el product elly et8ayar bas mn 8er refresh
          setProducts((currentProducts) =>
            currentProducts.map((product) =>
              product.id === payload.new.id ? { ...product, ...payload.new } : product
            )
          );
        }
      )
      .subscribe();

    // Cleanup: Ne2fel el channel lma ntl3 mn el saf7a
    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

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

  const toggleFavourite = async (product) => {
    const next = !product.favourite;
    setProducts((curr) =>
      curr.map((p) => (p.id === product.id ? { ...p, favourite: next } : p))
    );
    const { error: sbError } = await supabase
      .from('products')
      .update({ favourite: next })
      .eq('id', product.id);
    if (sbError) {
      // revert on failure
      setProducts((curr) =>
        curr.map((p) =>
          p.id === product.id ? { ...p, favourite: !next } : p
        )
      );
      setError(sbError.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {id && (
          <Text style={{ backgroundColor: '#ffeb3b', padding: 5, textAlign: 'center', marginBottom: 5 }}>
            Viewing via Link - ID: {id}
          </Text>
        )}
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavourite(item)}
                  hitSlop={8}
                >
                  <Text style={item.favourite ? styles.heartFilled : styles.heartEmpty}>
                    {item.favourite ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>

              {item.description ? <Text>{item.description}</Text> : null}
              <Text>${Number(item.price).toFixed(2)}</Text>
              
              {/*  Hena ben3red el Stock  */}
              <Text style={{ 
                color: item.stock_quantity > 0 ? 'green' : 'red', 
                fontWeight: 'bold',
                marginTop: 4 
              }}>
                {item.stock_quantity !== undefined ? `In Stock: ${item.stock_quantity}` : 'Stock info unavailable'}
              </Text>

              <View style={{ marginBottom: 10 }}>
   {item.image_url ? (
    <Image 
      source={require('./pic.webp')} 
      style={{ width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' }} 
    />
  ) : null}
</View>
              <View style={styles.spacer} />
              
              <Button 
                title="Add to Cart" 
                onPress={() => addToCart(item)} 
                disabled={item.stock_quantity <= 0} // B-disable el zowrar law el stock 0
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