import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase'; // Et2aked mn path el supabase

// Han-load kam order fel marra (Pagination size)
const PAGE_SIZE = 5;

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Function 3ashan ngeeb el data mn Supabase b pagination
  const fetchOrders = async (pageNumber = 0) => {
    if (pageNumber === 0) setLoading(true);
    else setFetchingMore(true);

    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false }) // A7das orders teb2a fo2
        .range(from, to); // 👈 Hena el Pagination by7sal

      if (error) throw error;

      // Law raga3 orders a2al mn 5, yeb2a keda 5alas mafish orders tanya
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (pageNumber === 0) {
        setOrders(data);
      } else {
        setOrders((prevOrders) => [...prevOrders, ...data]); // N-append el gdad 3al adem
      }
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // Awal ma el saf7a tefta7, ngeeb awel page
  useEffect(() => {
    fetchOrders(0);
  }, []);

  // Lama el user yenzal l a5er el list, ngeeb el page elly ba3daha
  const handleLoadMore = () => {
    if (hasMore && !fetchingMore) {
      fetchOrders(page + 1);
    }
  };

  // Design bta3 kol Order (Hena el Detailed View 👈)
  const renderOrder = ({ item }) => {
    // Net2aked en el order_items mawgooda w array
    const items = item.order_items || [];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.status}>Status: {item.payment_status}</Text>
        <Text style={styles.total}>Total: ${item.total_amount}</Text>

        {/* Detailed View: Ne3rad el products elly gowa el order */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Order Details:</Text>
          {items.length > 0 ? (
            items.map((prod, index) => (
              <Text key={index} style={styles.itemText}>
                - {prod.name} (${prod.price})
              </Text>
            ))
          ) : (
            <Text style={styles.noItemsText}>Old order (No details available)</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        // Dol bto3 el Pagination 👇
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Lma ywsl l nos el a5er mn el list ye-load
        ListFooterComponent={fetchingMore ? <ActivityIndicator size="small" color="#0000ff" /> : null}
      />
    </View>
  );
}

// Shwayet style 3ashan el doctor yenbeher bel UI
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  date: { color: '#666' },
  status: { color: 'green', marginBottom: 5 },
  total: { fontWeight: 'bold', fontSize: 15, marginBottom: 10 },
  detailsContainer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  detailsTitle: { fontWeight: '600', marginBottom: 5 },
  itemText: { color: '#444', marginLeft: 5 },
  noItemsText: { color: '#999', fontStyle: 'italic' },
});