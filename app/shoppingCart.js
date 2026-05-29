import { useState, useEffect } from 'react';
import {View,Text,ScrollView,Button,StyleSheet,TouchableOpacity,Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as haptics from 'expo-haptics';

const STORAGE_KEY = 'cart';

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  // B-y-load el cart mn el AsyncStorage (el memory bta3t el mobile) awel ma el shasha tzhar
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

  // Function bt3ml save lel array el gdeda fel State w fel AsyncStorage fe nafs el wa2t 3ashan y-update el UI w y7faz fel memory
  const saveCart = async (newItems) => {
    setItems(newItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  // B-t-loop 3ala el 7agat elly fel cart, w lma t-la2y el id elly el user das 3aleh, b-tzawed el quantity wa7ed w te3mel hazza 5afefa (haptic)
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

  // Nfs fekret el increase bas bel na2s. W law el quantity weslet le sfer aw a2al, b-temsa7 el product mn el cart 5ales
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

  // B-t-dawar 3ala el product w temsa7o mn el array 3alatool mn 8eir ma t-check el quantity
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

  // B-t-tala3 pop-up (Alert) tet2akad mn el user eno 3ayz ymsa7 kol 7aga. Law wafe2, b-t-save array fadya [] fel cart w te3mel hazza qaweya lel ta2keed
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

  // Loop b-tlf 3ala kol 7aga fel cart 3ashan t-7seb el raqam el total bta3 el 7etat (quantity) w 2gmaty el s3r (price * quantity)
  let totalItems = 0;
  let totalPrice = 0;
  for (let i = 0; i < items.length; i++) {
    totalItems = totalItems + items[i].quantity;
    totalPrice = totalPrice + items[i].price * items[i].quantity;
  }

  // El UI bta3 el Cart. Fih list b-td-map 3ala el items w t-tl3 esm w s3r w zrayer el + w -, w ta7t 5ales el Footer elly fih el 7esba el neha2ya w zrar el Clear
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