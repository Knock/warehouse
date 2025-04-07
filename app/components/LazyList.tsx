'use client';

import { useEffect, useRef } from 'react';
import { Package, Calendar } from 'lucide-react';
import { COLORS } from '@/app/config/colors';
import getColorFromString from '@/app/utils/colors';

interface LazyListProps {
  items: any[];
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
}

export default function LazyList({ items, onLoadMore, hasMore, isLoading }: LazyListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border relative overflow-hidden group transition-all active:bg-gray-50 touch-pan-y"
          style={{ borderColor: COLORS.border.light }}
        >
          {/* Left accent bar */}
          <div 
            className="absolute left-0 top-0 w-1.5 h-full"
            style={{ backgroundColor: getColorFromString(item.item_types?.name || '') }}
          />
          
          <div className="pl-6 pr-4 py-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col min-w-0">
                <h3 
                  className="text-lg font-medium mb-2 truncate pr-4"
                  style={{ color: COLORS.text.primary }}
                >
                  {item.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" style={{ color: COLORS.text.secondary }} />
                    <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" style={{ color: COLORS.text.secondary }} />
                    <span 
                      className="text-sm"
                      style={{ 
                        color: COLORS.text.secondary,
                        opacity: 0.8 
                      }}
                    >
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short'
                      }).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${getColorFromString(item.item_types?.name || '')}15`,
                    color: getColorFromString(item.item_types?.name || '')
                  }}
                >
                  {item.area_stored}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div ref={observerTarget} className="h-4" />
      
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2" 
            style={{ 
              borderColor: `${COLORS.accent.blue}40`,
              borderTopColor: COLORS.accent.blue
            }} 
          />
        </div>
      )}
    </div>
  );
} 