import React from 'react';
import { View, Text } from 'react-native';

export default function EmptyState({ title = 'Nothing here yet', subtitle = 'Check back soon.' }) {
  return (
    <View style={{ alignItems:'center' }}>
      <Text style={{ color:'#065f46', fontSize:18, fontWeight:'600' }}>{title}</Text>
      <Text style={{ marginTop:4 }}>{subtitle}</Text>
    </View>
  );
}
