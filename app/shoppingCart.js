import { useState, useEffect } from 'react';
import {View,Text,ScrollView,Button,StyleSheet,TouchableOpacity,Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as haptics from 'expo-haptics';

const STORAGE_KEY = 'cart';

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  // load the cart when the screen opens
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (exeption) {
      setError(exeption.message);
    }
  };

  // saves to state + AsyncStorage
  const saveCart = async (newItems) => {
    setItems(newItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const increase = async (id) => {
    const newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i].id === id) {
        newItems[i].quantity = newItems[i].quantity + 1;
        break;
        haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
      }
    }
    await saveCart(newItems);
  };

  const decrease = async (id) => {
    const newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i].id === id) {
        if (newItems[i].quantity <= 1) {
          // remove the item if quantity would go to 0
          newItems.splice(i, 1);
        } else {
          newItems[i].quantity = newItems[i].quantity - 1;
        }
        break;
      }
    }
    await saveCart(newItems);
  };

  const remove = async (id) => {
    const newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i].id === id) {
        newItems.splice(i, 1);
        break;
      }
    }
    await saveCart(newItems);
  };

  const clearAll = () => {
   haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    if (items.length === 0) return;

    // 1. Hazza awel ma ydos 3al zorar el asasy
    

    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          await saveCart([]);
          // 2. Hazza ta2keed (Success) lma el cart yfDa f3lan
          haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  // calculate totals
  let totalItems = 0;
  let totalPrice = 0;
  for (let i = 0; i < items.length; i++) {
    totalItems = totalItems + items[i].quantity;
    totalPrice = totalPrice + items[i].price * items[i].quantity;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping Cart</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {items.length === 0 ? (
        <Text style={styles.message}>Your cart is empty.</Text>
      ) : (
        <ScrollView>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text>${Number(item.price).toFixed(2)} each</Text>
              <Text>Subtotal: ${(item.price * item.quantity).toFixed(2)}</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => decrease(item.id)}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qty}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => increase(item.id)}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>

                <View style={styles.spacer} />

                <Button title="Remove" onPress={() => remove(item.id)} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text>Items: {totalItems}</Text>
        <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>
        <View style={styles.spacerV} />
        <Button title="Clear Cart" onPress={clearAll} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  message: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 8,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtyText: {
    fontSize: 16,
  },
  qty: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
  spacerV: {
    height: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 12,
    marginTop: 12,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
