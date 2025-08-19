import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Alert, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useListings } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import PrimaryButton from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';

export default function MyListings() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data, loading, error, refetch } = useListings(userId || undefined);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (session) {
        refetch();
      }
    }, [session, refetch])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const remove = async (id: string, imageUrl?: string | null) => {
    try {
      if (imageUrl) {
        const parts = imageUrl.split('/listing-images/');
        if (parts.length === 2) {
          const filePath = parts[1];
          const { error: storageError } = await supabase
            .storage
            .from('listing-images')
            .remove([filePath]);
          if (storageError) {
            console.warn('Failed to delete image from storage:', storageError.message);
          }
        }
      }

      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) throw error;

      refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete');
    }
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16, justifyContent: 'center' }}>
        <Text style={{ color: '#065f46', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
          Sign in to manage your listings
        </Text>
        <PrimaryButton
          title="Log in"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#065f46', marginBottom: 8 }}>
        My Listings
      </Text>

      {error ? <Text style={{ color: '#b91c1c' }}>{error}</Text> : null}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <ListingCard
              title={item.title}
              price={Number(item.price) || 0}
              image_url={item.image_url}
            />
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <View style={{ flex: 1, marginRight: 4 }}>
                <PrimaryButton
                  title="Edit"
                  onPress={() =>
                    router.push({
                      pathname: '/edit-listing',
                      params: { id: item.id },
                    })
                  }
                />
              </View>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <PrimaryButton
                  title="Delete"
                  onPress={() => remove(item.id, item.image_url)}
                />
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          !loading ? <Text style={{ color: '#065f46' }}>You have no listings yet.</Text> : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
