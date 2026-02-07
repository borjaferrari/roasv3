
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'MXN' | 'CLP';
export type LanguageCode = 'es' | 'en' | 'fr' | 'de' | 'pt';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export interface LanguageConfig {
  code: LanguageCode;
  label: string;
  flag: string;
}

export interface ROASInputs {
  cogs: number;
  opEx: number;
  conversionRate: number;
  avgOrderValue: number;
  ordersPerDay: number;
  targetProfitPercent: number;
}

export interface ROASResults {
  contributionMargin: number;
  breakEvenROAS: number;
  breakEvenCPA: number;
  targetROAS: number;
  targetCPA: number;
  targetCPC: number;
  dailySpend: number;
  dailyRevenue: number;
  dailyProfit: number;
  isViable: boolean;
}
