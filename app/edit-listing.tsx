import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';

export default function EditListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('chicken');
  const [items, setItems] = useState([
    { label: 'Chicken', value: 'chicken' },
    { label: 'Beef', value: 'beef' },
    { label: 'Pork', value: 'pork' },
    { label: 'Fish', value: 'fish' },
    { label: 'Drinks', value: 'drinks' },
    { label: 'Fast Foods', value: 'fast_foods' },
  ]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setTitle(data.title);
    setPrice(String(data.price));
    setDescription(data.description || '');
    setCategory(data.category || '');
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
      const { error } = await supabase
        .from('listings')
        .update({
          title,
          price: Number(price),
          description,
          category,
          image_url: imageUrl,
        })
        .eq('id', id);
      if (error) throw error;

      Alert.alert('Success', 'Listing updated successfully.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const onPriceChange = (text: string) => {
    setPrice(text.replace(',', '.'));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit', headerBackTitle: 'Back' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1, backgroundColor: '#ecfdf5' }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#065f46',
                marginBottom: 8,
              }}
            >
              Edit Listing
            </Text>

            <FormField label="Title" value={title} onChangeText={setTitle} />
            <FormField
              label="Price"
              value={price}
              onChangeText={onPriceChange}
              keyboardType={
                Platform.OS === 'ios'
                  ? 'numbers-and-punctuation'
                  : 'decimal-pad'
              }
            />

            {/* Category Field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#065f46',
                  marginBottom: 4,
                }}
              >
                Category
              </Text>
              <DropDownPicker
                open={open}
                value={category}
                items={items}
                setOpen={setOpen}
                setValue={setCategory}
                setItems={setItems}
                style={{
                  height: 50,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  backgroundColor: 'white',
                }}
                textStyle={{
                  color: '#111827',
                  fontSize: 16,
                }}
                dropDownContainerStyle={{
                  borderColor: '#ccc',
                  borderRadius: 6,
                }}
                placeholder="Select a category"
                placeholderStyle={{
                  color: '#aaa',
                }}
                zIndex={3000}
                listMode="SCROLLVIEW" 
              />
            </View>

            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', height: 200, marginVertical: 8 }}
              />
            ) : null}
            <PrimaryButton title="Change Image" onPress={pickImage} />

            <View style={{ height: 12 }} />
            <PrimaryButton
              title="Save changes"
              onPress={saveChanges}
              loading={loading}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}
