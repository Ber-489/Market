import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';

export default function EditListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setTitle(data.title);
    setPrice(String(data.price));
    setDescription(data.description || '');
    setImageUrl(data.image_url);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      let finalImageUrl = imageUrl;

      if (imageUrl && !imageUrl.startsWith('https')) {
        const { data: oldData } = await supabase.from('listings').select('image_url').eq('id', id).single();
        if (oldData?.image_url) {
          const parts = oldData.image_url.split('/listing-images/');
          if (parts.length === 2) {
            await supabase.storage.from('listing-images').remove([parts[1]]);
          }
        }

        const ext = imageUrl.split('.').pop();
        const filePath = `${Date.now()}.${ext}`;
        const formData = new FormData();
        formData.append('file', {
          uri: imageUrl,
          type: `image/${ext}`,
          name: filePath,
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, formData as any);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('listings')
        .update({
          title,
          price: Number(price),
          description,
          image_url: finalImageUrl,
        })
        .eq('id', id);
      if (error) throw error;

      Alert.alert('Success', 'Listing updated successfully.');
      router.back(); // Quay lại My Listings
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#065f46', marginBottom: 8 }}>
        Edit Listing
      </Text>

      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <FormField label="Description" value={description} onChangeText={setDescription} multiline />

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 200, marginVertical: 8 }} />
      ) : null}
      <PrimaryButton title="Change Image" onPress={pickImage} />

      <View style={{ height: 12 }} />
      <PrimaryButton title="Save changes" onPress={saveChanges} loading={loading} />
    </View>
  );
}
