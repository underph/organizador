
-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alterar tabelas existentes para incluir user_id
ALTER TABLE public.items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.shopping_list ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar tabela para controle financeiro
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tesouro_direto', 'fiis', 'renda_fixa')),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações financeiras do usuário
CREATE TABLE public.financial_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cdi_rate DECIMAL(5,2) DEFAULT 10.75,
  selic_rate DECIMAL(5,2) DEFAULT 10.75,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar bucket para armazenamento de imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- Atualizar políticas RLS para usar auth.uid()
DROP POLICY IF EXISTS "Allow all operations on items" ON public.items;
DROP POLICY IF EXISTS "Allow all operations on item_entries" ON public.item_entries;
DROP POLICY IF EXISTS "Allow all operations on shopping_list" ON public.shopping_list;

-- Políticas para items
CREATE POLICY "Users can view their own items" ON public.items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own items" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON public.items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- Políticas para item_entries
CREATE POLICY "Users can view entries for their items" ON public.item_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.items WHERE items.id = item_entries.item_id AND items.user_id = auth.uid())
);
CREATE POLICY "Users can create entries for their items" ON public.item_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.items WHERE items.id = item_entries.item_id AND items.user_id = auth.uid())
);

-- Políticas para shopping_list
CREATE POLICY "Users can view their own shopping items" ON public.shopping_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own shopping items" ON public.shopping_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping items" ON public.shopping_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping items" ON public.shopping_list FOR DELETE USING (auth.uid() = user_id);

-- Políticas para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- Políticas para financial_settings
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial settings" ON public.financial_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own financial settings" ON public.financial_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial settings" ON public.financial_settings FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para storage
CREATE POLICY "Users can upload their own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data ->> 'name');
  
  INSERT INTO public.financial_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
