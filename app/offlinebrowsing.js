import { useEffect, useState } from 'react';
import {ActivityIndicator,Button,ScrollView,StyleSheet,Text,View,} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import { supabase } from '../utils/supabase';

const CACHE_FILE = FileSystem.documentDirectory + 'products-cache.json';

export default function OfflineBrowsingScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [online, setOnline] = useState(true);
  const [source, setSource] = useState(null); // 'live' | 'cache' | 'empty'
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState('');

  const readCache = async () => {
    const info = await FileSystem.getInfoAsync(CACHE_FILE);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(CACHE_FILE);
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeCache = async (items) => {
    const payload = {
      savedAt: new Date().toISOString(),
      products: items,
    };
    await FileSystem.writeAsStringAsync(CACHE_FILE, JSON.stringify(payload));
    return payload;
  };

  const loadFromCacheOnly = async () => {
    const cached = await readCache();
    if (cached) {
      setProducts(cached.products ?? []);
      setLastSynced(cached.savedAt ?? null);
      setSource('cache');
    } else {
      setProducts([]);
      setSource('empty');
    }
  };

  const fetchAndCache = async () => {
    const { data, error: sbError } = await supabase.from('products').select();
    if (sbError) throw sbError;
    const items = data ?? [];
    const saved = await writeCache(items);
    setProducts(items);
    setLastSynced(saved.savedAt);
    setSource('live');
  };

  const load = async () => {
    setError('');
    try {
      const state = await Network.getNetworkStateAsync();
      const isOnline = !!(state.isConnected && state.isInternetReachable);
      setOnline(isOnline);

      if (isOnline) {
        try {
          await fetchAndCache();
        } catch (e) {
          // online but Supabase failed: fall back to cache
          setError(e.message ?? String(e));
          await loadFromCacheOnly();
        }
      } else {
        await loadFromCacheOnly();
      }
    } catch (e) {
      setError(e.message ?? String(e));
      await loadFromCacheOnly();
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const formatTime = (iso) => {
    if (!iso) return 'never';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const bannerStyle = online ? styles.bannerOnline : styles.bannerOffline;
  const bannerText = online
    ? `Online — live data (synced ${formatTime(lastSynced)})`
    : source === 'cache'
    ? `Offline — showing cached data from ${formatTime(lastSynced)}`
    : 'Offline — no cached data yet. Connect once to load products.';

  return (
    <View style={styles.container}>
      <View style={[styles.banner, bannerStyle]}>
        <Text style={styles.bannerLabel}>{bannerText}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title={refreshing ? 'Refreshing...' : 'Refresh now'}
          onPress={onRefresh}
          disabled={refreshing || loading}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading products...</Text>
        </View>
      ) : error && products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>No products to show.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {products.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}
              <Text style={styles.price}>
                ${Number(item.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bannerOnline: { backgroundColor: '#d4edda' },
  bannerOffline: { backgroundColor: '#fff3cd' },
  bannerLabel: { fontSize: 13, color: '#222' },
  actions: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  list: {
    padding: 12,
    paddingTop: 0,
  },
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 8,
  },
  name: { fontSize: 16, fontWeight: '600' },
  description: { marginTop: 4, color: '#444' },
  price: { marginTop: 6 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  muted: { marginTop: 8, color: '#666' },
  error: { color: '#b00020', textAlign: 'center' },
});