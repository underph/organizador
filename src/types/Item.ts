
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  amount_saved: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ItemEntry {
  id: string;
  item_id: string;
  amount: number;
  description?: string;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  is_purchased: boolean;
  created_at: string;
  updated_at: string;
}
