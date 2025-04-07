import { StorageAreaCode } from './storage';

export interface InflowItem {
  id: number;
  name: string;
  quantity: number;
  mobile_number: string;
  area_stored: StorageAreaCode;
  item_types: {
    name: string;
  };
  created_at: string;
} 