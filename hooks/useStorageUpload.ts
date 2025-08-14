import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

export async function uploadImageAsync(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const fileExt = localUri.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType: blob.type || `image/${fileExt}`,
    upsert: false
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
