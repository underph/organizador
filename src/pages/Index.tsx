
import { useState, useEffect } from "react";
import { ShoppingBag, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddItemModal from "@/components/AddItemModal";
import ShoppingList from "@/components/ShoppingList";
import FinancialControl from "@/components/FinancialControl";
import AdminDashboard from "@/components/AdminDashboard";
import ProfileSettings from "@/components/ProfileSettings";
import Auth from "@/components/Auth";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import ItemsHeader from "@/components/dashboard/ItemsHeader";
import EmptyItemsState from "@/components/dashboard/EmptyItemsState";
import ItemsGrid from "@/components/dashboard/ItemsGrid";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";

const Index = () => {
  const { user, session, userProfile, loading, handleLogout, fetchUserProfile } = useAuth();
  const { 
    items, 
    fetchItems, 
    handleAddItem, 
    handleUpdateItem, 
    handleDeleteItem, 
    handleAddEntry, 
    handleUpdateQuantity 
  } = useItems(user);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

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
    return <Auth onAuthSuccess={() => {}} />;
  }

  // Se admin dashboard estiver ativo
  if (showAdminDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header 
          username={user.email || 'Usuário'} 
          userProfile={userProfile}
          onLogout={() => {
            handleLogout();
            setShowAdminDashboard(false);
            setActiveTab("items");
          }}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onAdminClick={() => setShowAdminDashboard(false)}
        />
        <main className="flex-1">
          <AdminDashboard />
        </main>
        <Footer />
      </div>
    );
  }

  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSaved = items.reduce((sum, item) => sum + item.amount_saved, 0);

  const handleAddItemWrapper = async (newItem: any) => {
    await handleAddItem(newItem);
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header 
        username={user.email || 'Usuário'} 
        userProfile={userProfile}
        onLogout={() => {
          handleLogout();
          setShowAdminDashboard(false);
          setActiveTab("items");
        }}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onAdminClick={userProfile?.role === 'admin' ? () => setShowAdminDashboard(true) : undefined}
      />
      
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 md:mb-8">
            <TabsTrigger value="items" className="text-xs sm:text-sm">
              Meus Itens ({items.length})
            </TabsTrigger>
            <TabsTrigger value="shopping" className="text-xs sm:text-sm">
              <ShoppingBag className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Lista de</span> Compras
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Controle</span> Financeiro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6 md:space-y-8">
            <DashboardSummary 
              itemsCount={items.length}
              totalValue={totalValue}
              totalSaved={totalSaved}
            />

            <ItemsHeader 
              itemsCount={items.length}
              onAddItem={() => setIsAddModalOpen(true)}
            />

            {items.length === 0 ? (
              <EmptyItemsState onAddItem={() => setIsAddModalOpen(true)} />
            ) : (
              <ItemsGrid 
                items={items}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onAddEntry={handleAddEntry}
                onUpdateQuantity={handleUpdateQuantity}
              />
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

      {/* Modais */}
      <AddItemModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItemWrapper}
      />

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações de Perfil</DialogTitle>
          </DialogHeader>
          {user && (
            <ProfileSettings 
              user={user} 
              onClose={() => {
                setIsProfileModalOpen(false);
                if (user) fetchUserProfile(user.id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
