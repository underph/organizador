
import { useState } from "react";
import { Edit, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EditItemModal from "./EditItemModal";
import AddEntryModal from "./AddEntryModal";
import { Item } from "@/types/Item";

interface ItemCardProps {
  item: Item;
  onUpdate: (item: Item) => void;
  onDelete: (itemId: string) => void;
  onAddEntry: (itemId: string, amount: number, description?: string) => void;
}

const ItemCard = ({ item, onUpdate, onDelete, onAddEntry }: ItemCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  
  const progressPercentage = (item.amount_saved / item.price) * 100;
  const remainingAmount = item.price - item.amount_saved;
  
  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  const handleAddEntry = (amount: number, description?: string) => {
    onAddEntry(item.id, amount, description);
  };

  return (
    <>
      <Card className="card-hover overflow-hidden bg-white border border-gray-200">
        <div className="aspect-square overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-primary mb-2 line-clamp-1">
            {item.name}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
          
          <div className="space-y-3">
            {/* Preço */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Preço Total:</span>
              <span className="font-bold text-lg text-primary">
                R$ {item.price.toLocaleString()}
              </span>
            </div>
            
            {/* Valor arrecadado */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Arrecadado:</span>
              <span className="font-semibold text-secondary">
                R$ {item.amount_saved.toLocaleString()}
              </span>
            </div>
            
            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Progresso</span>
                <span className="text-xs font-bold text-secondary">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {remainingAmount > 0 
                  ? `Faltam R$ ${remainingAmount.toLocaleString()}`
                  : "Meta atingida! 🎉"
                }
              </p>
            </div>
            
            {/* Botão de entrada */}
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsEntryModalOpen(true)}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Adicionar Entrada
            </Button>
            
            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-white"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditItemModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
        item={item}
      />

      <AddEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onAdd={handleAddEntry}
        itemName={item.name}
      />
    </>
  );
};

export default ItemCard;
