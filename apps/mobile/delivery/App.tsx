import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { authApi, riderApi } from './src/api';

type Delivery = {
  uuid: string;
  status: string;
  earnings: number;
  order?: { order_number: string; shipping_address?: { address_line_1?: string; city?: string } };
};

export default function App() {
  const [email, setEmail] = useState('rider@nileshop.ss');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await riderApi.deliveries();
    setDeliveries(res.data ?? []);
  };

  const login = async () => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      await AsyncStorage.setItem('nileshop_token', res.data.token);
      setToken(res.data.token);
      await load();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      await riderApi.location(loc.coords.latitude, loc.coords.longitude);
    })();
  }, [token]);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>NileShop Delivery</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assigned deliveries</Text>
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.order?.order_number ?? item.uuid}</Text>
            <Text style={styles.meta}>{item.status} · SSP {item.earnings}</Text>
            {item.order?.shipping_address && (
              <Text style={styles.meta}>{item.order.shipping_address.address_line_1}, {item.order.shipping_address.city}</Text>
            )}
            <View style={styles.actions}>
              {item.status === 'assigned' && (
                <TouchableOpacity style={styles.smallBtn} onPress={() => riderApi.pickup(item.uuid).then(load)}>
                  <Text style={styles.smallBtnText}>Picked up</Text>
                </TouchableOpacity>
              )}
              {item.status === 'picked_up' && (
                <TouchableOpacity style={styles.smallBtn} onPress={() => riderApi.complete(item.uuid).then(load)}>
                  <Text style={styles.smallBtnText}>Delivered</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No active deliveries.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#1e40af', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  name: { fontWeight: '600' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallBtn: { backgroundColor: '#1e40af', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  smallBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
