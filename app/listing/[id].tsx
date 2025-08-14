import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/lib/types';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      setListing(data as Listing | null);
    };
    load();
  }, [id]);

  if (!listing) return <View style={{ flex:1, backgroundColor:'#ecfdf5', padding:16 }}><Text>Loading...</Text></View>;

  return (
    <View style={{ flex:1, backgroundColor:'#ecfdf5', padding:16 }}>
      {listing.image_url ? (
        <Image source={{ uri: listing.image_url }} style={{ width:'100%', height:256, borderRadius:20, marginBottom:16 }} />
      ) : null}
      <Text style={{ color:'#065f46', fontSize:24, fontWeight:'700' }}>{listing.title}</Text>
      <Text style={{ color:'#16a34a', fontSize:18, marginTop:4 }}>${'{'}listing.price.toFixed(2){'}'}</Text>
      {listing.description ? <Text style={{ color:'#374151', marginTop:12 }}>{listing.description}</Text> : null}
    </View>
  );
}
