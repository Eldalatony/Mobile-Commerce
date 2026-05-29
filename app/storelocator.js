import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
} from 'react-native';
// FIX: Removed PROVIDER_DEFAULT. Expo Go will automatically pick the best available map.
import MapView, { Marker } from 'react-native-maps'; 
import * as Location from 'expo-location';

// Lista el stores el physical bta3etna (hard-coded el demo)
const STORES = [
  { id: '1', name: 'Downtown Store', latitude: 30.0444, longitude: 31.2357 },
  { id: '2', name: 'Nasr City Branch', latitude: 30.0566, longitude: 31.3460 },
  { id: '3', name: 'Maadi Outlet',    latitude: 29.9603, longitude: 31.2569 },
  { id: '4', name: 'Giza Mall Shop',  latitude: 30.0131, longitude: 31.2089 },
  { id: '5', name: 'Heliopolis Hub',  latitude: 30.0808, longitude: 31.3220 },
];

// Haversine formula 3ashan ne7seb el masafa bel kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // nesf qotr el ard b el km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StoreLocator() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ne-fetch el GPS coordinates
  const fetchLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Ne-talab el permission el awel
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // 2. Ne-geeb el current position
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc.coords);
    } catch (err) {
      setErrorMsg('Could not fetch location: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // 3. Ne-rateb el stores 3ala 7asab el a2rab
  const storesWithDistance = location
    ? STORES.map((s) => ({
        ...s,
        distance: getDistanceKm(
          location.latitude,
          location.longitude,
          s.latitude,
          s.longitude
        ),
      })).sort((a, b) => a.distance - b.distance)
    : STORES.map((s) => ({ ...s, distance: null }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.info}>Fetching your location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Button title="Try Again" onPress={fetchLocation} />
      </View>
    );
  }

  // El initial region: ne-center 3ala el user
  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.2, // Zoom level
    longitudeDelta: 0.2, // Zoom level
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        // FIX: Removed the provider prop entirely
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Marker el user */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />

        {/* Markers el stores */}
        {storesWithDistance.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
            title={s.name}
            description={
              s.distance != null ? `${s.distance.toFixed(2)} km away` : ''
            }
          />
        ))}
      </MapView>

      {/* Listet el a2rab stores ta7t el map */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Nearby Stores</Text>
        <FlatList
          data={storesWithDistance}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.storeRow}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeDistance}>
                {item.distance != null
                  ? `${item.distance.toFixed(2)} km`
                  : '—'}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    height: 200,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  storeName: {
    fontSize: 14,
  },
  storeDistance: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  info: {
    marginTop: 10,
    fontSize: 14,
    color: '#444',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});