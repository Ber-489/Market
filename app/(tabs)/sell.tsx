import React, { useState } from 'react';
import { View, Text, Image, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Sell() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [items, setItems] = useState([
    { label: 'Chicken', value: 'chicken' },
    { label: 'Beef', value: 'beef' },
    { label: 'Pork', value: 'pork' },
    { label: 'Fish', value: 'fish' },
    { label: 'Drinks', value: 'drinks' },
    { label: 'Fast Foods', value: 'fast_foods' },
  ]);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadImageAsync = async (userId: string, uri: string) => {
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { error } = await supabase.storage.from('listing-images').upload(filePath, fileBytes, {
      contentType: `image/${fileExt}`,
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
    return data.publicUrl;
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
        category,
        image_url: imageUrl,
        user_id: session.user.id,
      });
      if (error) throw error;

      Alert.alert('Success', 'Listing created');
      setTitle('');
      setPrice('');
      setCategory('chicken');
      setDescription('');
      setImageUri(null);
      router.push('/(tabs)/my');
    } catch (e: any) {
Alert.alert('Error', e.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const onPriceChange = (text: string) => {
    setPrice(text.replace(',', '.'));
  };

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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={{ flex: 1, backgroundColor: '#ecfdf5' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: '#065f46', fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Create Listing</Text>
          <FormField label="Title" value={title} onChangeText={setTitle} />
          <FormField
            label="Price"
            value={price}
            onChangeText={onPriceChange}
            keyboardType="decimal-pad"
          />

          {/* Category Picker */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#065f46', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Category</Text>
            <DropDownPicker
              open={open}
              value={category}
              items={items}
              setOpen={setOpen}
              setValue={setCategory}
              setItems={setItems}
              style={{ marginBottom: 16 }}
              containerStyle={{ marginBottom: 16 }}
              placeholder="Select category"
              zIndex={1000}
              listMode="SCROLLVIEW"
            />
          </View>

          <FormField label="Description" value={description} onChangeText={setDescription} />
          {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: 176, borderRadius: 20, marginBottom: 12 }} /> : null}
          <PrimaryButton title={imageUri ? 'Change image' : 'Pick image'} onPress={pickImage} />
          <View style={{ height: 8 }} />
          <PrimaryButton title="Submit" onPress={onSubmit} loading={loading} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
