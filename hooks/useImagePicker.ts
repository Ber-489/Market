import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Allow photo library access to pick an image.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.8,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
  if (result.canceled) return null;
  return result.assets?.[0]?.uri || null;
}
