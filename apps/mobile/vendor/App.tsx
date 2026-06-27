import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, vendorApi } from './src/api';

type Product = { id: number; name: string; price: number; stock: number; status: string };

export default function App() {
  const [email, setEmail] = useState('vendor1@nileshop.ss');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const store = await vendorApi.store();
    const list = await vendorApi.products();
    setStoreName(store.data?.store_name ?? 'Vendor');
    setProducts(list.data ?? []);
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

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>NileShop Vendor</Text>
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
      <Text style={styles.title}>{storeName}</Text>
      <Text style={styles.subtitle}>Your products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>SSP {item.price} · Stock {item.stock} · {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No products yet. Add them from the web dashboard.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#1e40af', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  name: { fontWeight: '600' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
});
