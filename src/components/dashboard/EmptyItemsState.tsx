
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyItemsStateProps {
  onAddItem: () => void;
}

const EmptyItemsState = ({ onAddItem }: EmptyItemsStateProps) => {
  return (
    <div className="text-center py-12 animate-scale-in">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Nenhum item cadastrado
        </h3>
        <p className="text-muted-foreground mb-4">
          Comece adicionando seu primeiro item para organizar suas compras!
        </p>
        <Button 
          onClick={onAddItem}
          className="bg-secondary hover:bg-secondary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Primeiro Item
        </Button>
      </div>
    </div>
  );
};

export default EmptyItemsState;
