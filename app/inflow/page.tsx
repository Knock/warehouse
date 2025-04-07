'use client';

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Package, MapPin, Phone, Loader2 } from "lucide-react";
import { COLORS, STYLES } from "@/app/config/colors";
import { useRouter } from "next/navigation";

interface StorageArea {
  area_code: string;
}

export default function InflowPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: 'sandeep',
    mobile_number: '9160606633',
    quantity: '500',
    area_stored: 's1',
    inflow_date: new Date().toISOString().split('T')[0],
    item_type_id: ''
  });
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        redirect("/sign-in");
      }
      setUser(user);
    });

    // Fetch item types
    supabase
      .from('item_types')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching item types:', error);
        } else {
          setItemTypes(data || []);
          // Set the first item type as default if available
          if (data && data.length > 0) {
            setFormData(prev => ({
              ...prev,
              item_type_id: data[0].id
            }));
          }
        }
      });

    // Fetch storage areas
    supabase
      .from('storage_areas')
      .select('area_code')
      .order('area_code')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching storage areas:', error);
        } else {
          setStorageAreas(data || []);
          // Set the first storage area as default if available
          if (data && data.length > 0) {
            setFormData(prev => ({
              ...prev,
              area_stored: data[0].area_code
            }));
          }
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    if (!user) {
      setError("Please sign in to submit the form");
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('inflow')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            mobile_number: formData.mobile_number,
            quantity: parseInt(formData.quantity),
            area_stored: formData.area_stored,
            inflow_date: formData.inflow_date,
            item_type_id: formData.item_type_id
          }
        ]);

      if (error) {
        throw error;
      }

      setSuccess("Item added successfully!");
      setIsRedirecting(true);
      
      // Reset form
      setFormData({
        name: '',
        mobile_number: '',
        quantity: '',
        area_stored: '',
        inflow_date: new Date().toISOString().split('T')[0],
        item_type_id: ''
      });
      
      // Redirect to protected page after 1.5 seconds
      setTimeout(() => {
        router.push('/protected');
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center min-h-screen relative" style={{ backgroundColor: COLORS.background }}>
      {(isSubmitting || isRedirecting) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center" style={STYLES.card}>
            <Loader2 className="h-8 w-8 animate-spin mb-4" style={STYLES.icon.primary} />
            <p className="text-lg font-medium" style={{ color: COLORS.text.primary }}>
              {isSubmitting ? 'Submitting...' : 'Redirecting to protected page...'}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="mb-6" style={STYLES.card}>
          <div className="flex items-center justify-center mb-3">
            <Package className="h-7 w-7 mr-2" style={STYLES.icon.primary} />
            <h1 className="text-2xl font-bold text-center" style={{ color: COLORS.text.primary }}>Inflow Management</h1>
          </div>
          <p className="text-center text-sm" style={{ color: COLORS.text.secondary }}>Track and manage incoming inventory items</p>
        </div>
        
        <div style={STYLES.card}>
          <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: COLORS.text.primary }}>
            <Package className="h-5 w-5 mr-2" style={STYLES.icon.primary} />
            Add New Item
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.accent.red + '20', color: COLORS.accent.red }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.accent.green + '20', color: COLORS.accent.green }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium flex items-center" style={{ color: COLORS.text.secondary }}>
                  <Package className="h-4 w-4 mr-1" style={STYLES.icon.tertiary} />
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                  style={STYLES.input}
                  placeholder="Enter name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mobile_number" className="block text-sm font-medium flex items-center" style={{ color: COLORS.text.secondary }}>
                  <Phone className="h-4 w-4 mr-1" style={STYLES.icon.tertiary} />
                  Mobile Number
                </label>
                <input
                  id="mobile_number"
                  name="mobile_number"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                  className="w-full"
                  style={STYLES.input}
                  placeholder="Enter mobile number"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="item_type_id" className="block text-sm font-medium flex items-center" style={{ color: COLORS.text.secondary }}>
                  <Package className="h-4 w-4 mr-1" style={STYLES.icon.tertiary} />
                  Item Type
                </label>
                <select
                  id="item_type_id"
                  name="item_type_id"
                  value={formData.item_type_id}
                  onChange={handleChange}
                  required
                  className="w-full"
                  style={STYLES.input}
                  disabled={isSubmitting}
                >
                  <option value="">Select item type</option>
                  {itemTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium flex items-center" style={{ color: COLORS.text.secondary }}>
                  <Package className="h-4 w-4 mr-1" style={STYLES.icon.tertiary} />
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full"
                  style={STYLES.input}
                  placeholder="Enter quantity"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="area_stored" className="block text-sm font-medium flex items-center" style={{ color: COLORS.text.secondary }}>
                  <MapPin className="h-4 w-4 mr-1" style={STYLES.icon.tertiary} />
                  Storage Location
                </label>
                <select
                  id="area_stored"
                  name="area_stored"
                  value={formData.area_stored}
                  onChange={handleChange}
                  required
                  className="w-full"
                  style={STYLES.input}
                  disabled={isSubmitting}
                >
                  <option value="">Select storage location</option>
                  {storageAreas.map((area) => (
                    <option key={area.area_code} value={area.area_code}>
                      {area.area_code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="inflow_date" className="block text-sm font-medium flex items-center" style={{ color: COLORS.text.secondary }}>
                  <Package className="h-4 w-4 mr-1" style={STYLES.icon.tertiary} />
                  Inflow Date
                </label>
                <input
                  id="inflow_date"
                  name="inflow_date"
                  type="date"
                  value={formData.inflow_date}
                  onChange={handleChange}
                  required
                  className="w-full"
                  style={STYLES.input}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center"
              style={{
                ...STYLES.button.primary,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            >
              <Package className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 