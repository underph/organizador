
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: 'tesouro_direto' | 'fiis' | 'renda_fixa';
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialSettings {
  id: string;
  user_id: string;
  cdi_rate: number;
  selic_rate: number;
  created_at: string;
  updated_at: string;
}
