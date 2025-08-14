// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';

export default function Profile() {
  const { session } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error) console.warn(error);
    setDisplayName((data?.display_name as string) || '');
  };

  useEffect(() => {
    loadProfile();
  }, [session]);

  const save = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, display_name: displayName });
      if (error) throw error;
      Alert.alert('Saved', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setDisplayName('');
  };

  // --- UI khi chưa đăng nhập ---
  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16, justifyContent: 'center' }}>
        <Text style={{ color: '#065f46', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
          You are not signed in
        </Text>
        <Text style={{ color: '#4b5563', textAlign: 'center', marginTop: 8 }}>
          Log in to manage your profile and listings.
        </Text>
        <PrimaryButton
          title="Log in"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  // --- UI khi đã đăng nhập ---
  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16 }}>
      <Text style={{ color: '#065f46', fontSize: 20, fontWeight: '600' }}>Profile</Text>
      <Text style={{ color: '#4b5563', marginBottom: 16 }}>{session.user.email}</Text>

      <FormField label="Display name" value={displayName} onChangeText={setDisplayName} />
      <PrimaryButton title="Save" onPress={save} loading={loading} />
      <View style={{ height: 8 }} />
      <PrimaryButton title="Logout" onPress={logout} />
    </View>
  );
}
