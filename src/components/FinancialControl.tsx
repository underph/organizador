
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Investment, FinancialSettings } from "@/types/User";

const FinancialControl = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "" as Investment['type'],
    amount: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestments();
    fetchSettings();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('investments')
        .insert([{
          user_id: user.id,
          name: newInvestment.name,
          type: newInvestment.type,
          amount: newInvestment.amount
        }]);

      if (error) throw error;

      setNewInvestment({ name: "", type: "" as Investment['type'], amount: 0 });
      fetchInvestments();
      
      toast({
        title: "Investimento adicionado!",
        description: "O investimento foi cadastrado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar investimento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSettings = async (field: keyof FinancialSettings, value: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('financial_settings')
        .upsert({
          user_id: user.id,
          [field]: value,
          ...(settings || {})
        });

      if (error) throw error;
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const investmentsByType = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  // Simulação de cotas fixas
  const fixedQuotas = {
    CTPS11: { price: 95.50, monthlyDividend: 0.95, annualYield: 11.9 },
    MXRF11: { price: 9.80, monthlyDividend: 0.08, annualYield: 9.8 }
  };

  const calculateRendimento = (amount: number, rate: number) => {
    return (amount * rate) / 100;
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CDI Atual</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {settings?.cdi_rate || 10.75}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {calculateRendimento(totalInvested, settings?.cdi_rate || 10.75).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Por ano</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="investments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investments">Investimentos</TabsTrigger>
          <TabsTrigger value="fiis">FIIs Simulação</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="investments" className="space-y-6">
          {/* Adicionar Investimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Investimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddInvestment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Investimento</Label>
                    <Input
                      id="name"
                      value={newInvestment.name}
                      onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                      placeholder="Ex: Tesouro Selic 2027"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={newInvestment.type} onValueChange={(value: Investment['type']) => setNewInvestment({...newInvestment, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tesouro_direto">Tesouro Direto</SelectItem>
                        <SelectItem value="fiis">Fundos Imobiliários</SelectItem>
                        <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newInvestment.amount}
                      onChange={(e) => setNewInvestment({...newInvestment, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Adicionar Investimento
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Investimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Meus Investimentos</CardTitle>
              <CardDescription>
                Total de {investments.length} investimentos cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum investimento cadastrado ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div key={investment.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{investment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {investment.type === 'tesouro_direto' && 'Tesouro Direto'}
                          {investment.type === 'fiis' && 'Fundos Imobiliários'}
                          {investment.type === 'renda_fixa' && 'Renda Fixa'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(investmentsByType).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="font-medium">
                      {type === 'tesouro_direto' && 'Tesouro Direto'}
                      {type === 'fiis' && 'Fundos Imobiliários'}
                      {type === 'renda_fixa' && 'Renda Fixa'}
                    </span>
                    <span className="font-bold">
                      R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(fixedQuotas).map(([code, data]) => (
              <Card key={code}>
                <CardHeader>
                  <CardTitle className="text-lg">{code}</CardTitle>
                  <CardDescription>Fundo Imobiliário</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Preço da Cota:</span>
                    <span className="font-bold">R$ {data.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provento Mensal:</span>
                    <span className="font-bold text-green-600">R$ {data.monthlyDividend.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield Anual:</span>
                    <span className="font-bold text-secondary">{data.annualYield}%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Com R$ 1.000: {Math.floor(1000 / data.price)} cotas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Provento mensal: R$ {(Math.floor(1000 / data.price) * data.monthlyDividend).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
              <CardDescription>
                Ajuste as taxas para cálculos de rendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cdi">Taxa CDI (%)</Label>
                  <Input
                    id="cdi"
                    type="number"
                    step="0.01"
                    value={settings?.cdi_rate || 10.75}
                    onChange={(e) => updateSettings('cdi_rate', parseFloat(e.target.value) || 0)}
                    placeholder="10.75"
                  />
                </div>
                <div>
                  <Label htmlFor="selic">Taxa Selic (%)</Label>
                  <Input
                    id="selic"
                    type="number"
                    step="0.01"
                    value={settings?.selic_rate || 10.75}
                    onChange={(e) => updateSettings('selic_rate', parseFloat(e.target.value) || 0)}
                    placeholder="10.75"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialControl;
