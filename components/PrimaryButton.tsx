import React from 'react';
import { Pressable, Text, ActivityIndicator, View, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({ title, onPress, disabled, loading, style }: Props) {
  return (
    <Pressable
      style={[
        { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
        {loading && <ActivityIndicator style={{ marginRight:8 }} />}
        <Text style={{ color:'#0989afff', fontWeight:'600' }}>{title}</Text>
      </View>
    </Pressable>
  );
}
