
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemsHeaderProps {
  itemsCount: number;
  onAddItem: () => void;
}

const ItemsHeader = ({ itemsCount, onAddItem }: ItemsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Meus Itens</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {itemsCount} {itemsCount === 1 ? 'item cadastrado' : 'itens cadastrados'}
        </p>
      </div>
      <Button 
        onClick={onAddItem}
        className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Item
      </Button>
    </div>
  );
};

export default ItemsHeader;
