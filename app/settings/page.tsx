'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Package, MapPin, Plus, X, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { COLORS, STYLES } from '@/app/config/colors';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';

interface StorageArea {
  id: string;  // UUID
  area_code: string;
}

interface ItemType {
  id: number;
  name: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'storage' | 'items'>('storage');
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStorageArea, setNewStorageArea] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        redirect("/sign-in");
      }
    });

    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Load storage areas
      const { data: storageData, error: storageError } = await supabase
        .from('storage_areas')
        .select('id, area_code')
        .order('area_code');

      if (storageError) throw storageError;

      // Load item types
      const { data: itemData, error: itemError } = await supabase
        .from('item_types')
        .select('*')
        .order('name');

      if (itemError) throw itemError;

      setStorageAreas(storageData || []);
      setItemTypes(itemData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load settings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStorageArea = async () => {
    if (!newStorageArea.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('storage_areas')
        .insert([{ area_code: newStorageArea.toLowerCase() }]);

      if (error) throw error;

      toast.success('Storage area added successfully');
      setNewStorageArea('');
      loadData();
    } catch (error) {
      console.error('Error adding storage area:', error);
      toast.error('Failed to add storage area');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStorageArea = async (id: string) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('storage_areas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Storage area deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting storage area:', error);
      toast.error('Failed to delete storage area');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItemType = async () => {
    if (!newItemType.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('item_types')
        .insert([{ name: newItemType }]);

      if (error) throw error;

      toast.success('Item type added successfully');
      setNewItemType('');
      loadData();
    } catch (error) {
      console.error('Error adding item type:', error);
      toast.error('Failed to add item type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItemType = async (id: number) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('item_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item type deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting item type:', error);
      toast.error('Failed to delete item type');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLORS.accent.blue }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <SettingsIcon className="h-8 w-8 mr-3" style={{ color: COLORS.accent.blue }} />
          <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
            Settings
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm" style={{ border: `1px solid ${COLORS.border.light}` }}>
          <div className="flex border-b" style={{ borderColor: COLORS.border.light }}>
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'storage'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center">
                <MapPin className="h-5 w-5 mr-2" />
                Storage Areas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'items'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center">
                <Package className="h-5 w-5 mr-2" />
                Item Types
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newStorageArea}
                    onChange={(e) => setNewStorageArea(e.target.value)}
                    placeholder="Enter new storage area code"
                    className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.border.light,
                      color: COLORS.text.primary
                    }}
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleAddStorageArea}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                    style={{
                      backgroundColor: COLORS.accent.blue,
                      color: 'white',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {storageAreas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{
                        backgroundColor: COLORS.surface,
                        borderColor: COLORS.border.light
                      }}
                    >
                      <span className="font-medium" style={{ color: COLORS.text.primary }}>
                        {area.area_code.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleDeleteStorageArea(area.id)}
                        disabled={isSubmitting}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: COLORS.text.secondary }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    placeholder="Enter new item type"
                    className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.border.light,
                      color: COLORS.text.primary
                    }}
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleAddItemType}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                    style={{
                      backgroundColor: COLORS.accent.blue,
                      color: 'white',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {itemTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{
                        backgroundColor: COLORS.surface,
                        borderColor: COLORS.border.light
                      }}
                    >
                      <span className="font-medium" style={{ color: COLORS.text.primary }}>
                        {type.name}
                      </span>
                      <button
                        onClick={() => handleDeleteItemType(type.id)}
                        disabled={isSubmitting}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: COLORS.text.secondary }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 