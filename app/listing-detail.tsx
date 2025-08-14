import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import PrimaryButton from '@/components/PrimaryButton';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) {
      setListing(data);
    }
  };

  const handleBuy = () => {
    Alert.alert('Success', 'Purchase completed successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!listing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      {listing.image_url ? (
        <Image
          source={{ uri: listing.image_url }}
          style={{ width: '100%', height: 300 }}
          resizeMode="cover"
        />
      ) : null}

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#065f46', marginBottom: 8 }}>
          {listing.title}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#047857', marginBottom: 12 }}>
          ${listing.price}
        </Text>
        {listing.description ? (
          <Text style={{ fontSize: 16, color: '#374151', marginBottom: 20 }}>
            {listing.description}
          </Text>
        ) : null}

        <PrimaryButton title="Buy" onPress={handleBuy} />
        <View style={{ height: 12 }} />
        <PrimaryButton title="Back" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}
