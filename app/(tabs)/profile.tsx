// app/(tabs)/profile.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';

export default function Profile() {
  const { session, signOut } = useAuth(); // Thêm signOut ở đây
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 10;

  // --- Load profile name ---
  const loadProfile = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error) console.warn(error);
    setDisplayName((data?.display_name as string) || '');
  };

  useEffect(() => {
    loadProfile();
    fetchOrders(true);
  }, [session]);

  // --- Save profile ---
  const save = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, display_name: displayName });
      if (error) throw error;
      Alert.alert('Saved', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // --- Logout ---
  const logout = async () => {
    await signOut(); // Sử dụng signOut từ context để đảm bảo điều hướng đúng
    setDisplayName('');
    setOrders([]);
  };

  // --- Fetch orders ---
  const fetchOrders = async (reset = false) => {
    if (!session) return;

    const from = reset ? 0 : page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('guest_orders')
      .select('id, name, phone, address, quantity, created_at, listings(title)')
      .eq('seller_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      if (reset) {
        setOrders(data as any);
        setPage(1);
      } else {
        setOrders(prev => [...prev, ...(data as any)]);
        setPage(prev => prev + 1);
      }
    }
  };

  // --- Refresh control ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true).then(() => setRefreshing(false));
  }, [session]);

  // --- Delete order ---
  const deleteOrder = async (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('guest_orders').delete().eq('id', id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            setOrders(prev => prev.filter(order => order.id !== id));
          }
        },
      },
    ]);
  };

  // --- UI khi chưa đăng nhập ---
  if (!session) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#ecfdf5',
          padding: 16,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: '#065f46',
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          You are not signed in
        </Text>
        <Text style={{ color: '#4b5563', textAlign: 'center', marginTop: 8 }}>
          Log in to manage your profile and listings.
        </Text>
        <PrimaryButton
          title="Log in"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  // --- UI khi đã đăng nhập ---
  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16 }}>
      <Text style={{ color: '#065f46', fontSize: 20, fontWeight: '600' }}>
        Profile
      </Text>
      <Text style={{ color: '#4b5563', marginBottom: 16 }}>
        {session.user.email}
      </Text>

      <FormField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <PrimaryButton title="Save" onPress={save} loading={loading} />
      <View style={{ height: 8 }} />
      <PrimaryButton title="Logout" onPress={logout} />

      {/* Orders */}
      <Text
        style={{
          marginTop: 24,
          marginBottom: 12,
          fontSize: 18,
          fontWeight: '700',
          color: '#065f46',
        }}
      >
        Orders
      </Text>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Text style={{ fontWeight: '700', color: '#065f46' }}>
              {item.name}
            </Text>
            <Text style={{ color: '#374151' }}>{item.phone}</Text>
            <Text style={{ color: '#374151' }}>{item.address}</Text>
            <Text style={{ color: '#374151', fontWeight: '600', marginTop: 4 }}>
              Product: {item.listings?.title || 'Unknown'}
            </Text>
            <Text style={{ color: '#374151' }}>
              Quantity: {item.quantity}
            </Text>
            <Text
              style={{
                color: '#6b7280',
                marginTop: 4,
                fontSize: 12,
              }}
            >
              {new Date(item.created_at).toLocaleString()}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => deleteOrder(item.id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: '#fee2e2',
                }}
              >
                <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onEndReached={() => fetchOrders(false)}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>
            No orders found.
          </Text>
        }
      />
    </View>
  );
}
