
-- Adicionar sistema de roles para usuários admin
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Adicionar coluna de role na tabela profiles
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'user';

-- Adicionar campos para tracking de atividade
ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Criar política para dashboard admin
CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Criar política para admins verem todos os itens (para estatísticas)
CREATE POLICY "Admins can view all items for stats" ON public.items 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Atualizar função handle_new_user para registrar login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, last_login_at)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', now());
  
  INSERT INTO public.financial_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Políticas para storage de avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects 
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
