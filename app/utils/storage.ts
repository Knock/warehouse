import { createClient } from '@/utils/supabase/client';
import { StorageAreaCode } from '@/app/types/storage';

export async function getStorageAreas(): Promise<StorageAreaCode[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('storage_areas')
    .select('area_code')
    .order('area_code');

  if (error) {
    console.error('Error fetching storage areas:', error);
    return [];
  }

  return data.map(item => item.area_code as StorageAreaCode);
} 