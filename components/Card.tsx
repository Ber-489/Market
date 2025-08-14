import React from 'react';
import { View, ViewProps } from 'react-native';

export default function Card({ children, ...props }: ViewProps) {
  return (
    <View {...props} style={{ backgroundColor:'#ffffff', borderRadius:20, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2, elevation:1, borderWidth:1, borderColor:'#d1fae5', padding:16 }} >
      {children}
    </View>
  );
}
