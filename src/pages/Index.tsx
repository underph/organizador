
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ItemCard from "@/components/ItemCard";
import AddItemModal from "@/components/AddItemModal";
import { Item } from "@/types/Item";

const Index = () => {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      name: "Máquina de Café Espresso",
      description: "Máquina de café profissional para uso doméstico com sistema de vapor",
      price: 850,
      amountSaved: 320,
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      createdAt: new Date()
    },
    {
      id: "2", 
      name: "Sofá 3 Lugares",
      description: "Sofá confortável para sala de estar, cor cinza claro",
      price: 1200,
      amountSaved: 450,
      imageUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      createdAt: new Date()
    }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddItem = (newItem: Omit<Item, "id" | "createdAt">) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setItems([...items, item]);
    setIsAddModalOpen(false);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  const totalSaved = items.reduce((sum, item) => sum + item.amountSaved, 0);
  const progressPercentage = totalValue > 0 ? (totalSaved / totalValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Summary */}
        <div className="mb-8 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-primary mb-4">Resumo Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total de Itens</p>
                <p className="text-3xl font-bold text-primary">{items.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-primary">R$ {totalValue.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Valor Arrecadado</p>
                <p className="text-3xl font-bold text-secondary">R$ {totalSaved.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Barra de Progresso Global */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Progresso Total</span>
                <span className="text-sm font-bold text-secondary">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Faltam R$ {(totalValue - totalSaved).toLocaleString()} para completar todos os itens
              </p>
            </div>
          </div>
        </div>

        {/* Header com botão de adicionar */}
        <div className="flex justify-between items-center mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-primary">Meus Itens</h1>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {/* Grid de Itens */}
        {items.length === 0 ? (
          <div className="text-center py-12 animate-scale-in">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Nenhum item cadastrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando seu primeiro item para organizar suas compras!
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ItemCard 
                  item={item} 
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <AddItemModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
};

export default Index;
