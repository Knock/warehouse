'use client';

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Package, ArrowRight, Search, X, Calendar, Settings } from "lucide-react";
import { COLORS, STYLES } from "@/app/config/colors";
import Link from "next/link";
import LazyList from "@/app/components/LazyList";
import toast, { Toaster } from 'react-hot-toast';
import getColorFromString from '@/app/utils/colors';
import EditInflowModal from '@/app/components/EditInflowModal';

const ITEMS_PER_PAGE = 5;

export default function ProtectedPage() {
  const [user, setUser] = useState<any>(null);
  const [inflowItems, setInflowItems] = useState<any[]>([]);
  const [outflowItems, setOutflowItems] = useState<any[]>([]);
  const [inflowLoading, setInflowLoading] = useState(false);
  const [outflowLoading, setOutflowLoading] = useState(false);
  const [inflowHasMore, setInflowHasMore] = useState(true);
  const [outflowHasMore, setOutflowHasMore] = useState(true);
  const [inflowPage, setInflowPage] = useState(1);
  const [outflowPage, setOutflowPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          redirect("/sign-in");
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!user) {
          redirect("/sign-in");
        }

        setUser(user);
        await loadInitialData();
      } catch (error) {
        console.error('Authentication error:', error);
        redirect("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        redirect("/sign-in");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      toast.error('Please enter a mobile number to search');
      return;
    }

    setIsSearching(true);
    const searchToast = toast.loading('Searching...');
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('inflow')
        .select(`
          *,
          item_types (
            name
          )
        `)
        .ilike('mobile_number', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSearchResults(data || []);
      
      if (data && data.length > 0) {
        toast.success(`Found ${data.length} items`, { id: searchToast });
      } else {
        toast.error('No items found', { id: searchToast });
      }
    } catch (error) {
      console.error('Error searching items:', error);
      toast.error('Error searching items. Please try again.', { id: searchToast });
    } finally {
      setIsSearching(false);
    }
  };

  const loadInflowItems = async () => {
    if (inflowLoading || inflowItems.length > 0) return;
    setInflowLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('inflow')
        .select(`
          *,
          item_types (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (data.length < ITEMS_PER_PAGE) {
        setInflowHasMore(false);
      }

      setInflowItems(data || []);
    } catch (error) {
      console.error('Error loading inflow items:', error);
    } finally {
      setInflowLoading(false);
    }
  };

  const loadOutflowItems = async () => {
    if (outflowLoading || outflowItems.length > 0) return;
    setOutflowLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('outflow')
        .select(`
          *,
          item_types (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (data.length < ITEMS_PER_PAGE) {
        setOutflowHasMore(false);
      }

      setOutflowItems(data || []);
    } catch (error) {
      console.error('Error loading outflow items:', error);
    } finally {
      setOutflowLoading(false);
    }
  };

  const loadInitialData = async () => {
    await Promise.all([
      loadInflowItems(),
      loadOutflowItems()
    ]);
  };

  const handleEditSave = async () => {
    // Refresh both search results and inflow items
    if (searchQuery) {
      await handleSearch();
    }
    await loadInflowItems();
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.accent.blue }}></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: COLORS.surface,
            color: COLORS.text.primary,
            border: `1px solid ${COLORS.border.light}`,
          },
          success: {
            iconTheme: {
              primary: COLORS.accent.green,
              secondary: COLORS.surface,
            },
          },
          error: {
            iconTheme: {
              primary: COLORS.accent.red,
              secondary: COLORS.surface,
            },
          },
          loading: {
            iconTheme: {
              primary: COLORS.accent.blue,
              secondary: COLORS.surface,
            },
          },
        }}
      />
      <div className="w-full max-w-4xl px-4 py-8">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center justify-center">
            <Package className="h-8 w-8 mr-2" style={STYLES.icon.primary} />
            <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>Warehouse Management</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/settings"
              className="p-2 rounded-md hover:bg-gray-100"
              style={{ color: COLORS.text.secondary }}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              {showSearch ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter mobile number..."
                    className="px-3 py-2 rounded-md border"
                    style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border.light }}
                  />
                  <button
                    onClick={handleSearch}
                    className="p-2 rounded-md hover:bg-gray-100"
                    style={{ color: COLORS.text.secondary }}
                    title="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-2 rounded-md hover:bg-gray-100"
                    style={{ color: COLORS.text.secondary }}
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-md hover:bg-gray-100"
                  style={{ color: COLORS.text.secondary }}
                  title="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8" style={STYLES.card}>
            <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: COLORS.text.primary }}>
              <Search className="h-5 w-5 mr-2" style={STYLES.icon.primary} />
              Search Results ({searchResults.length} items found)
            </h2>
            <div className="space-y-4">
              {searchResults.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md flex items-center"
                  style={{ 
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border.light
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full mr-4 flex-shrink-0 transition-transform duration-200 hover:scale-110"
                    style={{ 
                      backgroundColor: getColorFromString(item.item_types?.name || '')
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-lg mb-1 truncate" 
                      style={{ color: getColorFromString(item.item_types?.name || '') }}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" style={{ color: COLORS.text.secondary }} />
                        <span className="text-sm" style={{ color: COLORS.text.secondary }}>{item.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" style={{ color: COLORS.text.secondary }} />
                        <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-4 py-2 rounded-md font-medium flex items-center"
                      style={{ 
                        backgroundColor: COLORS.accent.blue,
                        color: 'white'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length > 5 && (
                <div className="text-center text-sm" style={{ color: COLORS.text.secondary }}>
                  Showing 5 of {searchResults.length} results
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <EditInflowModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleEditSave}
          />
        )}

        {/* Recent Inflow Items */}
        <div className="mb-8" style={STYLES.card}>
          <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: COLORS.text.primary }}>
            <Package className="h-5 w-5 mr-2" style={STYLES.icon.primary} />
            Recent Inflow Items
          </h2>
          <LazyList
            items={inflowItems.slice(0, 5)}
            onLoadMore={loadInflowItems}
            hasMore={inflowHasMore}
            isLoading={inflowLoading}
          />
          {inflowItems.length > 5 && (
            <div className="text-center text-sm mt-4" style={{ color: COLORS.text.secondary }}>
              Showing 5 of {inflowItems.length} items
            </div>
          )}
        </div>

        {/* Recent Outflow Items */}
        <div className="mb-8" style={STYLES.card}>
          <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: COLORS.text.primary }}>
            <Package className="h-5 w-5 mr-2" style={STYLES.icon.primary} />
            Recent Outflow Items
          </h2>
          <LazyList
            items={outflowItems.slice(0, 5)}
            onLoadMore={loadOutflowItems}
            hasMore={outflowHasMore}
            isLoading={outflowLoading}
          />
          {outflowItems.length > 5 && (
            <div className="text-center text-sm mt-4" style={{ color: COLORS.text.secondary }}>
              Showing 5 of {outflowItems.length} items
            </div>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/inflow" className="group" style={STYLES.card}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full mr-4" style={{ backgroundColor: COLORS.accent.blue + '20' }}>
                  <Package className="h-6 w-6" style={{ color: COLORS.accent.blue }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>Inflow</h3>
                  <p className="text-sm" style={{ color: COLORS.text.secondary }}>Track incoming items</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5" style={{ color: COLORS.text.tertiary }} />
            </div>
          </Link>

          <Link href="/outflow" className="group" style={STYLES.card}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full mr-4" style={{ backgroundColor: COLORS.accent.orange + '20' }}>
                  <Package className="h-6 w-6" style={{ color: COLORS.accent.orange }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>Outflow</h3>
                  <p className="text-sm" style={{ color: COLORS.text.secondary }}>Track outgoing items</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5" style={{ color: COLORS.text.tertiary }} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 