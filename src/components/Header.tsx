
import { Home, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  username?: string;
  userProfile?: {
    name?: string;
    avatar_url?: string;
    role?: string;
  };
  onLogout?: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
}

const Header = ({ username, userProfile, onLogout, onProfileClick, onAdminClick }: HeaderProps) => {
  const displayName = userProfile?.name || "Olá, usuário!";
  const isAdmin = userProfile?.role === 'admin';

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">Lovable Home Organizer</h1>
              <p className="text-white/80 text-xs md:text-sm">Seu controle doméstico inteligente</p>
            </div>
          </div>
          
          {username && (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-white/80">Bem-vindo!</p>
                <p className="font-semibold text-sm">{displayName}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-secondary text-white">
                        {userProfile?.name?.charAt(0).toUpperCase() || username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {onProfileClick && (
                    <DropdownMenuItem onClick={onProfileClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && onAdminClick && (
                    <DropdownMenuItem onClick={onAdminClick}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Dashboard Admin</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onLogout && (
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
