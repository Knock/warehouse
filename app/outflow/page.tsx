'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { Package, MapPin, Loader2, Search } from 'lucide-react';
import { COLORS, STYLES } from '@/app/config/colors';

// Function to generate a consistent color based on string
function getColorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export default function OutflowPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    inflow_date: '',
    quantity: '',
    area_stored: '',
    outflow_date: new Date().toISOString().split('T')[0],
    item_type_id: undefined as string | undefined,
    price: '',
    total_price: '',
  });
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemTypes, setItemTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [selectedInflowItem, setSelectedInflowItem] = useState<any>(null);

  // Update all border styles to use a single color
  const borderStyle = { borderColor: COLORS.border.light };

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect('/sign-in');
      }
      setUser(user);
    };
    getUser();

    // Fetch item types
    const fetchItemTypes = async () => {
      const { data, error } = await supabase
        .from('item_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching item types:', error);
        return;
      }
      
      setItemTypes(data || []);
    };
    fetchItemTypes();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inflow')
      .select(`
        *,
        item_types (
          name
        )
      `)
      .ilike('name', `%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching inflow items:', error);
      return;
    }

    setSearchResults(data || []);
    setShowSearchResults(true);
  };

  const calculatePrice = (inflowDate: string, outflowDate: string) => {
    const start = new Date(inflowDate);
    const end = new Date(outflowDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30);
    
    // Calculate number of full years and remaining months
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    // Base price calculation
    let price = 0;
    
    // For each full year, add 66
    price += years * 66;
    
    // For remaining months
    if (remainingMonths > 0) {
      if (remainingMonths < 6) {
        price += 36;
      } else {
        price += 66;
      }
    }
    
    return price;
  };

  const handleSelectItem = (item: any) => {
    setSelectedInflowItem(item);
    const calculatedPrice = calculatePrice(item.inflow_date, new Date().toISOString().split('T')[0]);
    const totalPrice = calculatedPrice * parseInt(item.quantity);
    
    setFormData({
      name: item.name,
      mobile_number: item.mobile_number,
      inflow_date: item.inflow_date,
      quantity: item.quantity.toString(),
      area_stored: item.area_stored,
      outflow_date: new Date().toISOString().split('T')[0],
      item_type_id: item.item_type_id,
      price: calculatedPrice.toString(),
      total_price: totalPrice.toString(),
    });
    setShowSearchResults(false);
    setSearchQuery('');
    setIsItemSelected(true);
  };

  const handleOutflowDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (selectedInflowItem) {
      const calculatedPrice = calculatePrice(selectedInflowItem.inflow_date, newDate);
      const totalPrice = calculatedPrice * parseInt(formData.quantity);
      setFormData(prevData => ({
        ...prevData,
        inflow_date: prevData.inflow_date,
        outflow_date: newDate,
        price: calculatedPrice.toString(),
        total_price: totalPrice.toString(),
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        inflow_date: prevData.inflow_date,
        outflow_date: newDate,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked - Starting outflow submission process');
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Log the form data being submitted
      console.log('Form data being submitted:', {
        name: formData.name,
        mobile_number: formData.mobile_number,
        quantity: formData.quantity,
        area_stored: formData.area_stored,
        outflow_date: formData.outflow_date,
        item_type_id: formData.item_type_id,
        price: formData.price,
        total_price: formData.total_price
      });
      
      // Prepare the outflow data with proper types
      const outflowData = {
        user_id: user?.id,
        name: formData.name,
        mobile_number: formData.mobile_number,
        quantity: parseInt(formData.quantity),
        area_stored: formData.area_stored,
        outflow_date: formData.outflow_date,
        item_type_id: formData.item_type_id,
        price: parseFloat(formData.price),
        total_price: parseFloat(formData.total_price),
      };

      console.log('Submitting outflow data:', outflowData);
      
      // First, insert the outflow record
      const { data: insertedData, error: outflowError } = await supabase
        .from('outflow')
        .insert(outflowData)
        .select()
        .single();

      if (outflowError) {
        console.error('Error inserting outflow:', outflowError);
        console.error('Error details:', {
          message: outflowError.message,
          details: outflowError.details,
          hint: outflowError.hint,
          code: outflowError.code
        });
        throw outflowError;
      }

      console.log('Successfully inserted outflow:', insertedData);

      // Then, delete the corresponding inflow record
      if (selectedInflowItem) {
        console.log('Attempting to delete inflow record:', selectedInflowItem.id);
        const { error: deleteError } = await supabase
          .from('inflow')
          .delete()
          .eq('id', selectedInflowItem.id);

        if (deleteError) {
          console.error('Error deleting inflow:', deleteError);
          throw deleteError;
        }
        console.log('Successfully deleted inflow record');
      }

      // Send SMS confirmation using the API route
      console.log('Initiating SMS sending process');
      let smsSuccess = false;
      let smsResult: any = null;
      try {
        const smsPayload = {
          name: formData.name,
          mobile_number: formData.mobile_number,
          area_stored: formData.area_stored,
        };
        console.log('SMS payload:', smsPayload);

        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(smsPayload),
        });

        smsResult = await response.json();
        console.log('SMS API response:', smsResult);

        if (!smsResult.success) {
          console.warn('SMS sending status:', smsResult.note);
          console.warn('SMS error details:', smsResult.error);
          // In production, you might want to log this to your error tracking service
          if (process.env.NODE_ENV === 'production') {
            // Log to your error tracking service here
            console.error('SMS sending failed:', smsResult.error);
          }
          // Only show error if it's not a trial account limitation
          if (!smsResult.isTrialAccount) {
            setError('Failed to send SMS notification. Please try again.');
          } else {
            // For trial account limitations, show a warning but proceed
            console.log('SMS not sent due to trial account limitations, proceeding with outflow');
          }
        } else {
          console.log('SMS sent successfully:', smsResult.messageSid);
          smsSuccess = true;
        }
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        // In production, log to your error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Log to your error tracking service here
          console.error('SMS sending error:', smsError);
        }
        setError('Failed to send SMS notification. Please try again.');
      }

      console.log('Outflow process completed successfully');
      setIsSubmitting(false);

      // Redirect if SMS was sent successfully OR if it's a trial account limitation
      if (smsSuccess || smsResult?.isTrialAccount) {
        setIsRedirecting(true);
        setTimeout(() => {
          console.log('Redirecting to protected page');
          router.push('/protected');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An error occurred while submitting the outflow');
      setIsSubmitting(false);
    }
  };

  if (isSubmitting || isRedirecting) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" style={STYLES.icon.primary} />
          <p className="text-lg font-medium" style={{ color: COLORS.text.primary }}>
            {isSubmitting ? 'Submitting...' : 'Redirecting to protected page...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="mb-8" style={STYLES.card}>
          <div className="flex items-center justify-center mb-3">
            <Package className="h-8 w-8 mr-2" style={STYLES.icon.primary} />
            <h1 className="text-3xl font-bold text-center" style={{ color: COLORS.text.primary }}>Outflow Management</h1>
          </div>
          <p className="text-center text-sm" style={{ color: COLORS.text.secondary }}>Record outgoing items from the warehouse</p>
        </div>

        {/* Search Section */}
        <div className="mb-8" style={STYLES.card}>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inflow items by name..."
              className="flex-1 px-3 py-2 rounded-md border"
              style={{ backgroundColor: COLORS.surface, ...borderStyle }}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-md font-medium flex items-center"
              style={{ backgroundColor: COLORS.accent.blue, color: 'white' }}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>

          {showSearchResults && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-md border cursor-pointer hover:bg-gray-50"
                      style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: getColorFromString(item.item_types?.name || 'default') }}
                          />
                          <p className="text-sm" style={{ color: COLORS.text.primary }}>{item.item_types?.name || 'N/A'}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm" style={{ color: COLORS.text.primary }}>{item.name}</p>
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" style={{ color: COLORS.text.secondary }} />
                          <p className="text-sm" style={{ color: COLORS.text.primary }}>{item.quantity}</p>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" style={{ color: COLORS.text.secondary }} />
                          <p className="text-sm" style={{ color: COLORS.text.primary }}>{item.area_stored}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-2" style={{ color: COLORS.text.secondary }}>
                  No items found
                </p>
              )}
            </div>
          )}
        </div>

        {isItemSelected && (
          <form onSubmit={handleSubmit} style={STYLES.card}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border"
                  style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  required
                />
              </div>

              <div>
                <label htmlFor="mobile_number" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile_number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border"
                  style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  required
                />
              </div>

              <div>
                <label htmlFor="item_type" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                  Item Type
                </label>
                <select
                  id="item_type"
                  value={formData.item_type_id || ''}
                  onChange={(e) => setFormData({ ...formData, item_type_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-md border"
                  style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  required
                >
                  <option value="">Select Item Type</option>
                  {itemTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border"
                  style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  required
                />
              </div>

              <div>
                <label htmlFor="area_stored" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                  Storage Location
                </label>
                <input
                  type="text"
                  id="area_stored"
                  value={formData.area_stored}
                  onChange={(e) => setFormData({ ...formData, area_stored: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border"
                  style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  required
                />
              </div>

              <div>
                <label htmlFor="outflow_date" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                  Outflow Date
                </label>
                <input
                  type="date"
                  id="outflow_date"
                  value={formData.outflow_date}
                  onChange={handleOutflowDateChange}
                  className="w-full px-3 py-2 rounded-md border"
                  style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                    Base Price (Auto-calculated)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    readOnly
                    className="w-full px-3 py-2 rounded-md border"
                    style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  />
                  <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
                    Price per item based on duration
                  </p>
                </div>

                <div>
                  <label htmlFor="total_price" className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
                    Total Price
                  </label>
                  <input
                    type="number"
                    id="total_price"
                    value={formData.total_price}
                    readOnly
                    className="w-full px-3 py-2 rounded-md border"
                    style={{ backgroundColor: COLORS.surface, ...borderStyle }}
                  />
                  <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
                    Base price × Quantity
                  </p>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md font-medium"
                style={{ backgroundColor: COLORS.accent.blue, color: 'white' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Outflow'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 