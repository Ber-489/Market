import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

type Props = TextInputProps & { label?: string };

export default function FormField({ label, ...props }: Props) {
  return (
    <View style={{ marginBottom:16 }}>
      {label ? <Text style={{ marginBottom:4, color:'#065f46', fontWeight:'500' }}>{label}</Text> : null}
      <TextInput
        style={{ height:48, borderRadius:20, borderWidth:1, paddingHorizontal: 12, borderColor:'#d1fae5', backgroundColor:'#ffffff' }}
        placeholderTextColor="#6b7280"
        {...props}
      />
    </View>
  );
}
