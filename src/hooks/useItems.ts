
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@/types/Item";
import type { User } from "@supabase/supabase-js";

export const useItems = (user: User | null) => {
  const [items, setItems] = useState<Item[]>([]);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que todos os itens tenham propriedades obrigatórias
      const itemsWithDefaults = (data || []).map(item => ({
        ...item,
        quantity: item.quantity || 1,
        purchase_links: item.purchase_links || []
      }));
      
      setItems(itemsWithDefaults);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  }, []);

  const handleAddItem = useCallback(async (newItem: Omit<Item, "id" | "created_at" | "updated_at">) => {
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

      const itemWithDefaults = { 
        ...data, 
        quantity: data.quantity || 1,
        purchase_links: data.purchase_links || []
      };
      setItems(prev => [itemWithDefaults, ...prev]);
      
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
  }, [user, toast]);

  const handleUpdateItem = useCallback(async (updatedItem: Item) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          quantity: updatedItem.quantity,
          amount_saved: updatedItem.amount_saved,
          image_url: updatedItem.image_url,
          purchase_links: updatedItem.purchase_links
        })
        .eq('id', updatedItem.id);

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      
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
  }, [toast]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      
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
  }, [toast]);

  const handleAddEntry = useCallback(async (itemId: string, amount: number, quantity: number, description?: string) => {
    try {
      // Adicionar entrada na tabela de entradas
      const { error: entryError } = await supabase
        .from('item_entries')
        .insert([{
          item_id: itemId,
          amount: amount,
          quantity: quantity,
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
        setItems(prev => prev.map(i => 
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
  }, [items, toast]);

  const handleUpdateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ quantity: quantity })
        .eq('id', itemId);

      if (error) throw error;

      // Atualizar estado local
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity: quantity } : i
      ));
      
      toast({
        title: "Quantidade atualizada!",
        description: `Quantidade alterada para ${quantity}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar quantidade",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    items,
    fetchItems,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleAddEntry,
    handleUpdateQuantity
  };
};
