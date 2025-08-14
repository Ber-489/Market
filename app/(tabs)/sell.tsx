// app/(tabs)/sell.tsx
import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function Sell() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Chọn ảnh từ điện thoại
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Upload ảnh lên Supabase Storage và trả về public URL
  const uploadImageAsync = async (userId: string, uri: string) => {
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Đọc file dưới dạng base64
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Chuyển base64 → Uint8Array (không dùng Buffer)
      const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const { error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, fileBytes, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e: any) {
      throw new Error(e.message || 'Failed to upload image');
    }
  };

  const onSubmit = async () => {
    if (!session) return Alert.alert('Auth', 'Please sign in first.');
    if (!title || !price) return Alert.alert('Missing', 'Title and price are required.');
    if (!imageUri) return Alert.alert('Missing', 'Please select an image.');

    try {
      setLoading(true);
      const imageUrl = await uploadImageAsync(session.user.id, imageUri);

      const { error } = await supabase.from('listings').insert({
        title,
        description: description || null,
        price: Number(price),
        image_url: imageUrl,
        user_id: session.user.id,
      });
      if (error) throw error;

      Alert.alert('Success', 'Listing created');
      setTitle('');
      setPrice('');
      setDescription('');
      setImageUri(null);
      router.push('/(tabs)/my'); // chuyển sang My Listings
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  // UI nếu chưa đăng nhập
  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16, justifyContent: 'center' }}>
        <Text style={{ color: '#065f46', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
          Sign in to sell your items
        </Text>
        <PrimaryButton title="Log in" onPress={() => router.push('/(auth)/login')} style={{ marginTop: 12 }} />
      </View>
    );
  }

  // UI khi đã đăng nhập
  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16 }}>
      <Text style={{ color: '#065f46', fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Create Listing</Text>

      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <FormField label="Description" value={description} onChangeText={setDescription} />

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 176, borderRadius: 20, marginBottom: 12 }}
        />
      ) : null}

      <PrimaryButton title={imageUri ? 'Change image' : 'Pick image'} onPress={pickImage} />
      <View style={{ height: 8 }} />
      <PrimaryButton title="Submit" onPress={onSubmit} loading={loading} />
    </View>
  );
}
