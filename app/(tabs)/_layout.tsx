import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <View style={{ padding: 8, backgroundColor: '#d1fae5' }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#065f46' }}>
          Eventide Market
        </Text>
      </View>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#065f46',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: { backgroundColor: '#ecfdf5' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Market',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="storefront-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sell"
          options={{
            title: 'Sell',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="my"
          options={{
            title: 'My Listings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetags-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
