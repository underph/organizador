
import { useState, useEffect } from "react";
import { Plus, Check, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingItem } from "@/types/Item";

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, price: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens da lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .insert([{
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price
        }])
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setNewItem({ name: "", quantity: 1, price: 0 });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const togglePurchased = async (id: string, is_purchased: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ is_purchased: !is_purchased })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === id ? { ...item, is_purchased: !is_purchased } : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  };

  const updateItemPrice = async (id: string, price: number) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ price })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === id ? { ...item, price } : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const purchasedValue = items.filter(item => item.is_purchased).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div>Carregando lista de compras...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Lista de Compras
        </CardTitle>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-primary">R$ {totalValue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Comprado: </span>
            <span className="font-bold text-secondary">R$ {purchasedValue.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Adicionar novo item */}
        <div className="grid grid-cols-12 gap-2">
          <Input
            placeholder="Nome do item"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="col-span-5"
          />
          <Input
            type="number"
            placeholder="Qtd"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            className="col-span-2"
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
            className="col-span-3"
          />
          <Button onClick={addItem} className="col-span-2 bg-secondary hover:bg-secondary/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de itens */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-2 p-3 rounded border ${
                item.is_purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePurchased(item.id, item.is_purchased)}
                className={`p-1 ${
                  item.is_purchased ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Check className="w-4 h-4" />
              </Button>
              
              <div className={`flex-1 ${item.is_purchased ? 'line-through text-gray-500' : ''}`}>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  Qtd: {item.quantity}
                </div>
              </div>
              
              <Input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                className="w-20 text-sm"
                disabled={item.is_purchased}
              />
              
              <div className="text-sm font-medium w-16 text-right">
                R$ {(item.price * item.quantity).toFixed(2)}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteItem(item.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhum item na lista de compras
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShoppingList;
