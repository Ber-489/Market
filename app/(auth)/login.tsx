// app/(auth)/login.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import PrimaryButton from '@/components/PrimaryButton';
import FormField from '@/components/FormField';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      Alert.alert('Success', 'Logged in successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);

      // 1. Tạo tài khoản
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      // 2. Đăng nhập ngay để lấy session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      const userId = signInData.user?.id;
      if (userId) {
        // 3. Upsert profile vào bảng profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: userId, display_name: null });
        if (profileError) throw profileError;
      }

      Alert.alert('Success', 'Account created and logged in.');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#ecfdf5' }}>
      <Text style={{ fontSize: 30, fontWeight: '700', textAlign: 'center', color: '#065f46', marginBottom: 8 }}>
        Eventide Market
      </Text>
      <Text style={{ fontSize: 15, textAlign: 'center', color: '#246037ff', marginBottom: 24 }}>
        Sign in to continue
      </Text>

      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={{ textAlign: 'center', color: '#6b7280', marginVertical: 14 }}>
        If you don't have an account, please enter your email and password above, then press Create account.
      </Text>

      <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />
      <View style={{ height: 12 }} />
      <PrimaryButton title="Create account" onPress={handleSignUp} loading={loading} />
    </View>
  );
}
