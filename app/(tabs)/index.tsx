import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

const ITEM_MARGIN = 8;
// 2 cột: (screenWidth - 3 * margin) / 2  => chừa 2 mép + khoảng giữa
const ITEM_WIDTH = (Dimensions.get('window').width - ITEM_MARGIN * 3) / 2;

export default function Market() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchListings = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    const from = reset ? 0 : page * limit;
    const to = reset ? limit - 1 : (page + 1) * limit - 1;

    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && listings) {
      if (reset) {
        setData(listings);
        setPage(1);
      } else {
        setData(prev => [...prev, ...listings]);
        setPage(prev => prev + 1);
      }
    }
    setLoading(false);
  };

  // Lần đầu mở Market
  useEffect(() => {
    fetchListings(true);
  }, []);

  // Mỗi lần tab Market được focus → reload 1 lần
  useFocusEffect(
    useCallback(() => {
      fetchListings(true);
    }, [])
  );

  // Kéo xuống để refresh (tách biệt với auto reload khi focus)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings(true).finally(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        width: ITEM_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: ITEM_MARGIN,
      }}
      onPress={() => router.push({ pathname: '/listing-detail', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={{ width: '100%', height: ITEM_WIDTH }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: ITEM_WIDTH,
            backgroundColor: '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#6b7280' }}>No image</Text>
        </View>
      )}

      <View style={{ padding: 8 }}>
        <Text style={{ fontWeight: '600', color: '#065f46' }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: '#047857', fontWeight: 'bold' }}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: ITEM_MARGIN }}>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: ITEM_MARGIN }}
        onEndReached={() => fetchListings(false)}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: '#065f46', textAlign: 'center' }}>No listings found.</Text>
          ) : null
        }
      />
    </View>
  );
}
