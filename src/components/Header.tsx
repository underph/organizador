
import { useState } from "react";
import { Home } from "lucide-react";

const Header = () => {
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
          
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white/80">Bem-vindo de volta!</p>
              <p className="font-semibold">Usuário</p>
            </div>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
