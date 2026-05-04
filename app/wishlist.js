import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../utils/supabase';

export default function WishlistScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    const { data, error: sbError } = await supabase
      .from('products')
      .select()
      .eq('favourite', true);
    if (sbError) {
      setError(sbError.message);
    } else {
      setProducts(data ?? []);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        await load();
        if (active) setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const removeFromWishlist = async (product) => {
    const previous = products;
    setProducts((curr) => curr.filter((p) => p.id !== product.id));
    const { error: sbError } = await supabase
      .from('products')
      .update({ favourite: false })
      .eq('id', product.id);
    if (sbError) {
      setProducts(previous);
      setError(sbError.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading wishlist...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          Your wishlist is empty. Tap the heart on a product to add it.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {products.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => removeFromWishlist(item)}
                hitSlop={8}
              >
                <Text style={styles.heartFilled}>♥</Text>
              </TouchableOpacity>
            </View>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
            <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  description: { marginTop: 4, color: '#444' },
  price: { marginTop: 6 },
  heartFilled: { fontSize: 22, color: '#e0245e' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  muted: { color: '#666', textAlign: 'center' },
  error: { color: '#b00020', textAlign: 'center' },
});