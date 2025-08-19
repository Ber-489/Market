import React from 'react';
import { View, Text, Image } from 'react-native';

interface ListingCardProps {
  title: string;
  price: number;
  image_url?: string | null;
}

export default function ListingCard({ title, price, image_url }: ListingCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {image_url ? (
        <Image
          source={{ uri: image_url }}
          style={{
            width: '100%',
            height: 180,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 180,
            backgroundColor: '#d1fae5',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#065f46', fontSize: 14 }}>No Image</Text>
        </View>
      )}

      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#065f46' }}>{title}</Text>
        <Text style={{ fontSize: 14, color: '#10b981', marginTop: 4 }}>
          ${price.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
