
import React from "react";
import ItemCard from "@/components/ItemCard";
import { Item } from "@/types/Item";

interface ItemsGridProps {
  items: Item[];
  onUpdateItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onAddEntry: (itemId: string, amount: number, quantity: number, description?: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const ItemsGrid = ({ 
  items, 
  onUpdateItem, 
  onDeleteItem, 
  onAddEntry, 
  onUpdateQuantity 
}: ItemsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ItemCard 
            item={item} 
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            onAddEntry={onAddEntry}
            onUpdateQuantity={onUpdateQuantity}
          />
        </div>
      ))}
    </div>
  );
};

export default ItemsGrid;
