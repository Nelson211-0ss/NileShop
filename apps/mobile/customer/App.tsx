import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Image, ActivityIndicator, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, homeApi, cartApi } from './src/api';

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images?: Array<{ url: string }>;
};

export default function App() {
  const [email, setEmail] = useState('customer@nileshop.ss');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        await AsyncStorage.setItem('nileshop_token', res.data.token);
        setToken(res.data.token);
        loadHome();
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadHome = async () => {
    const res = await homeApi.get();
    if (res.data?.featured_products) {
      setProducts(res.data.featured_products);
    }
  };

  const addToCart = async (productId: number) => {
    await cartApi.add(productId);
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.logo}>NileShop</Text>
        <Text style={styles.subtitle}>South Sudan Marketplace</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Featured Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0].url }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]} />
            )}
            <View style={styles.cardBody}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.price}>{item.price.toLocaleString()} SSP</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item.id)}>
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#1e40af', textAlign: 'center', marginTop: 40 },
  subtitle: { textAlign: 'center', color: '#64748b', marginBottom: 32 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  button: { backgroundColor: '#1e40af', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  list: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, flexDirection: 'row' },
  image: { width: 100, height: 100 },
  imagePlaceholder: { backgroundColor: '#e2e8f0' },
  cardBody: { flex: 1, padding: 12 },
  productName: { fontWeight: '600', fontSize: 14 },
  price: { color: '#1e40af', fontWeight: 'bold', marginTop: 4 },
  addBtn: { backgroundColor: '#1e40af', borderRadius: 8, padding: 8, marginTop: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
