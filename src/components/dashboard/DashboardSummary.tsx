
import React from "react";

interface DashboardSummaryProps {
  itemsCount: number;
  totalValue: number;
  totalSaved: number;
}

const DashboardSummary = ({ itemsCount, totalValue, totalSaved }: DashboardSummaryProps) => {
  const progressPercentage = totalValue > 0 ? (totalSaved / totalValue) * 100 : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total de Itens</p>
            <p className="text-2xl md:text-3xl font-bold text-primary">{itemsCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-2xl md:text-3xl font-bold text-primary">R$ {totalValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Valor Arrecadado</p>
            <p className="text-2xl md:text-3xl font-bold text-secondary">R$ {totalSaved.toLocaleString()}</p>
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
  );
};

export default DashboardSummary;
