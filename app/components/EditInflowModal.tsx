'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Package, X } from 'lucide-react';
import { COLORS, STYLES } from '@/app/config/colors';
import { InflowItem } from '@/app/types/inflow';
import toast from 'react-hot-toast';

interface StorageArea {
  area_code: string;
}

interface EditInflowModalProps {
  item: InflowItem;
  onClose: () => void;
  onSave: () => void;
}

export default function EditInflowModal({ item, onClose, onSave }: EditInflowModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>([]);
  const [formData, setFormData] = useState({
    name: item.name,
    quantity: item.quantity,
    mobile_number: item.mobile_number,
    area_stored: item.area_stored,
  });

  useEffect(() => {
    const loadStorageAreas = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('storage_areas')
        .select('area_code')
        .order('area_code');

      if (error) {
        console.error('Error loading storage areas:', error);
        return;
      }

      setStorageAreas(data || []);
    };

    loadStorageAreas();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const saveToast = toast.loading('Saving changes...');
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('inflow')
        .update(formData)
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success('Item updated successfully', { id: saveToast });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item', { id: saveToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="w-full max-w-md p-6 rounded-xl"
        style={{ 
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border.light}`
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: COLORS.text.primary }}>
            Edit Inflow Item
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
            style={{ color: COLORS.text.secondary }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
              Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md border"
              style={{ 
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border"
              style={{ 
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
              Mobile Number
            </label>
            <input
              type="text"
              value={formData.mobile_number}
              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
              className="w-full px-3 py-2 rounded-md border"
              style={{ 
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
              Storage Location
            </label>
            <select
              value={formData.area_stored}
              onChange={(e) => setFormData({ ...formData, area_stored: e.target.value })}
              className="w-full px-3 py-2 rounded-md border"
              style={{ 
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border.light,
                color: COLORS.text.primary
              }}
            >
              <option value="">Select a storage location</option>
              {storageAreas.map((area) => (
                <option key={area.area_code} value={area.area_code}>
                  {area.area_code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium"
              style={{ 
                backgroundColor: COLORS.surface,
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.border.light}`
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-md font-medium flex items-center"
              style={{ 
                backgroundColor: COLORS.accent.blue,
                color: 'white',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 