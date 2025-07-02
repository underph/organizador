
import { useState, useEffect } from "react";
import { Plus, Check, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingItem } from "@/types/Item";

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    price: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      console.error('Erro ao buscar lista de compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('shopping_list')
        .insert([{
          user_id: user.id,
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price
        }]);

      if (error) throw error;

      setNewItem({ name: "", quantity: 1, price: 0 });
      fetchItems();
      
      toast({
        title: "Item adicionado!",
        description: "O item foi adicionado à lista de compras.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePurchased = async (itemId: string, isPurchased: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ is_purchased: isPurchased })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_purchased: isPurchased } : item
      ));
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removido!",
        description: "O item foi removido da lista de compras.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const purchasedValue = items
    .filter(item => item.is_purchased)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div className="p-8 text-center">Carregando lista de compras...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumo da Lista */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <p className="text-xs text-muted-foreground">
              {items.filter(item => item.is_purchased).length} comprados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Já Comprado</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {purchasedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adicionar Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Item à Lista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Nome do Item</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Ex: Leite"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Preço Unitário (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar à Lista
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Lista vazia
              </h3>
              <p className="text-gray-500">
                Adicione itens à sua lista de compras para começar!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    item.is_purchased 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={item.is_purchased}
                      onCheckedChange={(checked) => togglePurchased(item.id, checked as boolean)}
                    />
                    <div className={item.is_purchased ? 'line-through text-gray-500' : ''}>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        Quantidade: {item.quantity} | 
                        Preço: R$ {item.price.toFixed(2)} | 
                        Total: R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingList;
