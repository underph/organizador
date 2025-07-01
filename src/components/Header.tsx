
import { useState } from "react";
import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

const Header = ({ username, onLogout }: HeaderProps) => {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Lovable Home Organizer</h1>
              <p className="text-white/80 text-sm">Seu controle doméstico inteligente</p>
            </div>
          </div>
          
          {username && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/80">Bem-vindo de volta!</p>
                <p className="font-semibold">{username}</p>
              </div>
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
              </div>
              {onLogout && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onLogout}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Footer com direitos reservados e frase */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/60">
            <p>© 2024 Lovable Home Organizer. Todos os direitos reservados.</p>
            <p className="italic mt-1 md:mt-0">"O verdadeiro Deus habita dentro de nós"</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
