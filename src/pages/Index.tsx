
import { useState, useEffect } from "react";
import { Plus, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import AddItemModal from "@/components/AddItemModal";
import ShoppingList from "@/components/ShoppingList";
import FinancialControl from "@/components/FinancialControl";
import Auth from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@/types/Item";
import type { User, Session } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchItems();
          }, 0);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setItems([]);
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async (newItem: Omit<Item, "id" | "created_at" | "updated_at">) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...newItem,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setIsAddModalOpen(false);
      
      toast({
        title: "Item adicionado!",
        description: "O item foi adicionado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (updatedItem: Item) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          amount_saved: updatedItem.amount_saved,
          image_url: updatedItem.image_url
        })
        .eq('id', updatedItem.id);

      if (error) throw error;

      setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
      
      toast({
        title: "Item atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removido!",
        description: "O item foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddEntry = async (itemId: string, amount: number, description?: string) => {
    try {
      // Adicionar entrada na tabela de entradas
      const { error: entryError } = await supabase
        .from('item_entries')
        .insert([{
          item_id: itemId,
          amount: amount,
          description: description
        }]);

      if (entryError) throw entryError;

      // Atualizar o valor total arrecadado no item
      const item = items.find(i => i.id === itemId);
      if (item) {
        const newAmountSaved = item.amount_saved + amount;
        
        const { error: updateError } = await supabase
          .from('items')
          .update({ amount_saved: newAmountSaved })
          .eq('id', itemId);

        if (updateError) throw updateError;

        // Atualizar estado local
        setItems(items.map(i => 
          i.id === itemId ? { ...i, amount_saved: newAmountSaved } : i
        ));
        
        toast({
          title: "Entrada adicionada!",
          description: `R$ ${amount.toFixed(2)} foi adicionado ao item.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar entrada",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!user || !session) {
    return <Auth onAuthSuccess={() => setLoading(false)} />;
  }

  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  const totalSaved = items.reduce((sum, item) => sum + item.amount_saved, 0);
  const progressPercentage = totalValue > 0 ? (totalSaved / totalValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header username={user.email || 'Usuário'} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="items">Meus Itens</TabsTrigger>
            <TabsTrigger value="shopping">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Lista de Compras
            </TabsTrigger>
            <TabsTrigger value="financial">
              <TrendingUp className="w-4 h-4 mr-2" />
              Controle Financeiro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-8">
            {/* Dashboard Summary */}
            <div className="animate-fade-in-up">
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
            <div className="flex justify-between items-center animate-fade-in-up">
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
                      onAddEntry={handleAddEntry}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingList />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialControl />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <AddItemModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
};

export default Index;
