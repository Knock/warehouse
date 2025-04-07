'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Package, MapPin, Plus, X, Loader2, Settings as SettingsIcon, Trash2, Edit2 } from 'lucide-react';
import { COLORS, STYLES } from '@/app/config/colors';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface StorageArea {
  id: string;
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
  const [editingItem, setEditingItem] = useState<ItemType | null>(null);
  const [editingArea, setEditingArea] = useState<StorageArea | null>(null);

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
      const [storageResponse, itemsResponse] = await Promise.all([
        supabase.from('storage_areas').select('id, area_code').order('area_code'),
        supabase.from('item_types').select('id, name').order('name')
      ]);

      if (storageResponse.error) throw storageResponse.error;
      if (itemsResponse.error) throw itemsResponse.error;

      setStorageAreas(storageResponse.data || []);
      setItemTypes(itemsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStorageArea = async () => {
    if (!newStorageArea.trim()) {
      toast.error('Please enter a storage area code');
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('storage_areas')
        .insert([{ area_code: newStorageArea.trim() }]);

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
    if (!confirm('Are you sure you want to delete this storage area?')) return;

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
    }
  };

  const handleAddItemType = async () => {
    if (!newItemType.trim()) {
      toast.error('Please enter an item type name');
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('item_types')
        .insert([{ name: newItemType.trim() }]);

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
    if (!confirm('Are you sure you want to delete this item type?')) return;

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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <SettingsIcon className="w-8 h-8" style={{ color: COLORS.primary }} />
        <h1 className="text-3xl font-bold" style={{ color: COLORS.foreground }}>Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b" style={{ borderColor: COLORS.border }}>
          <button
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'storage' ? 'border-b-2' : 'opacity-50'
            }`}
            style={{
              color: activeTab === 'storage' ? COLORS.primary : COLORS.foreground,
              borderColor: activeTab === 'storage' ? COLORS.primary : 'transparent'
            }}
            onClick={() => setActiveTab('storage')}
          >
            Storage Areas
          </button>
          <button
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'items' ? 'border-b-2' : 'opacity-50'
            }`}
            style={{
              color: activeTab === 'items' ? COLORS.primary : COLORS.foreground,
              borderColor: activeTab === 'items' ? COLORS.primary : 'transparent'
            }}
            onClick={() => setActiveTab('items')}
          >
            Item Types
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'storage' ? (
              <motion.div
                key="storage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={newStorageArea}
                    onChange={(e) => setNewStorageArea(e.target.value.toUpperCase())}
                    placeholder="Enter storage area code"
                    className="flex-1 px-4 py-2 rounded-md border"
                    style={{
                      borderColor: COLORS.border,
                      backgroundColor: COLORS.background,
                      color: COLORS.foreground
                    }}
                  />
                  <button
                    onClick={handleAddStorageArea}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    style={{
                      backgroundColor: COLORS.primary,
                      color: 'white',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Area
                  </button>
                </div>

                <div className="grid gap-4">
                  {storageAreas.map((area) => (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{
                        borderColor: COLORS.border,
                        backgroundColor: COLORS.background
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: COLORS.primary }} />
                        <span style={{ color: COLORS.foreground }}>{area.area_code}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteStorageArea(area.id)}
                        className="p-2 rounded-full hover:bg-red-100 transition-colors"
                        style={{ color: COLORS.destructive }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    placeholder="Enter item type name"
                    className="flex-1 px-4 py-2 rounded-md border"
                    style={{
                      borderColor: COLORS.border,
                      backgroundColor: COLORS.background,
                      color: COLORS.foreground
                    }}
                  />
                  <button
                    onClick={handleAddItemType}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    style={{
                      backgroundColor: COLORS.primary,
                      color: 'white',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Type
                  </button>
                </div>

                <div className="grid gap-4">
                  {itemTypes.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{
                        borderColor: COLORS.border,
                        backgroundColor: COLORS.background
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5" style={{ color: COLORS.primary }} />
                        <span style={{ color: COLORS.foreground }}>{item.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteItemType(item.id)}
                        className="p-2 rounded-full hover:bg-red-100 transition-colors"
                        style={{ color: COLORS.destructive }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 