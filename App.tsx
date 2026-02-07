
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ROASInputs, ROASResults, CurrencyCode, CurrencyConfig, LanguageCode, LanguageConfig } from './types';
import { getMarketingAdvice } from './services/geminiService';
import { translations } from './translations';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceDot,
  Label
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  Sparkles, 
  RotateCcw,
  ShoppingBag,
  MousePointerClick,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Play,
  Info,
  Truck,
  AlertTriangle,
  X,
  Coins,
  Settings,
  Check,
  Globe
} from 'lucide-react';

const CURRENCIES: CurrencyConfig[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'Dólar (USD)' },
  { code: 'GBP', symbol: '£', label: 'Libra (GBP)' },
  { code: 'MXN', symbol: '$', label: 'Peso (MXN)' },
  { code: 'CLP', symbol: '$', label: 'Peso (CLP)' },
];

const LANGUAGES: LanguageConfig[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

// Componente Tooltip Avanzado con Portal y Detección de Bordes
const MetricInfo = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, arrowLeft: 50 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const TOOLTIP_WIDTH = 260;

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      let left = rect.left + rect.width / 2;
      let arrowLeft = 50;

      // Ajuste si se sale por la derecha
      if (left + TOOLTIP_WIDTH / 2 > viewportWidth - 16) {
        const overflow = (left + TOOLTIP_WIDTH / 2) - (viewportWidth - 16);
        left -= overflow;
        arrowLeft = 50 + (overflow / TOOLTIP_WIDTH * 100);
      }
      
      // Ajuste si se sale por la izquierda
      if (left - TOOLTIP_WIDTH / 2 < 16) {
        const overflow = 16 - (left - TOOLTIP_WIDTH / 2);
        left += overflow;
        arrowLeft = 50 - (overflow / TOOLTIP_WIDTH * 100);
      }

      setCoords({
        top: rect.top,
        left: left,
        arrowLeft: Math.max(10, Math.min(90, arrowLeft))
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button 
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center rounded-full p-1 ml-1.5 transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/30 ${
          isOpen ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'text-gray-400 hover:text-indigo-500 bg-gray-100 hover:bg-indigo-50'
        }`}
        aria-label="Información"
      >
        <Info className="w-3 h-3" />
      </button>
      
      {isOpen && createPortal(
        <div 
          className="fixed z-[10000] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${coords.top - 10}px`,
            left: `${coords.left}px`,
            transform: 'translate(-50%, -100%)',
            width: `${TOOLTIP_WIDTH}px`
          }}
        >
          <div className="relative p-4 bg-gray-900/95 backdrop-blur-xl text-white text-[12px] font-medium rounded-2xl shadow-2xl border border-white/10 leading-relaxed ring-1 ring-black/5">
            {text}
            {/* Flecha dinámica */}
            <div 
              className="absolute -bottom-1.5 w-3 h-3 bg-gray-900/95 rotate-45 border-r border-b border-white/10"
              style={{ left: `${coords.arrowLeft}%`, transform: 'translateX(-50%) rotate(45deg)' }}
            ></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES[0]);
  const [lang, setLang] = useState<LanguageCode>('es');
  
  const [inputs, setInputs] = useState({
    cogs: '',
    opEx: '',
    conversionRate: '',
    avgOrderValue: '',
    ordersPerDay: '',
    targetProfitPercent: '20'
  });

  const [results, setResults] = useState<ROASResults | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const t = (key: string) => translations[lang][key] || key;

  useEffect(() => {
    const savedCurrency = localStorage.getItem('poasmaster_currency');
    const savedLang = localStorage.getItem('poasmaster_lang') as LanguageCode;
    
    if (savedCurrency) {
      const found = CURRENCIES.find(c => c.code === savedCurrency);
      if (found) setCurrency(found);
    }
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const formatValue = (val: number | string) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return '0';
    return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const formatCurrency = (val: number | string) => {
    return `${formatValue(val)}${currency.symbol}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderInteraction = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleCalculate = () => {
    const cogs = parseFloat(inputs.cogs) || 0;
    const opEx = parseFloat(inputs.opEx) || 0;
    const conversionRate = parseFloat(inputs.conversionRate) || 0;
    const avgOrderValue = parseFloat(inputs.avgOrderValue) || 0;
    const ordersPerDay = parseFloat(inputs.ordersPerDay) || 0;
    const targetProfitPercent = parseFloat(inputs.targetProfitPercent) || 0;

    if (avgOrderValue <= 0) {
      alert(lang === 'es' ? "Por favor, introduce un ticket medio válido." : "Please enter a valid Average Order Value.");
      return;
    }

    const contributionMargin = avgOrderValue - (cogs + opEx);
    const breakEvenROAS = avgOrderValue / (contributionMargin || 0.0001);
    const desiredProfitPerOrder = avgOrderValue * (targetProfitPercent / 100);
    const targetCPA = contributionMargin - desiredProfitPerOrder;
    const isViable = targetCPA > 0;
    const targetROAS = isViable ? (avgOrderValue / targetCPA) : 0;
    const clicksNeeded = 100 / (conversionRate || 0.0001);
    const targetCPC = isViable ? (targetCPA / clicksNeeded) : 0;
    const dailyRevenue = avgOrderValue * ordersPerDay;
    const dailySpend = isViable ? (targetCPA * ordersPerDay) : 0;
    const dailyProfit = dailyRevenue - ((cogs + opEx) * ordersPerDay) - dailySpend;

    setResults({
      contributionMargin,
      breakEvenROAS,
      breakEvenCPA: contributionMargin,
      targetROAS,
      targetCPA,
      targetCPC,
      dailySpend,
      dailyRevenue,
      dailyProfit,
      isViable
    });
    setAiAdvice(null);
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setInputs({
      cogs: '',
      opEx: '',
      conversionRate: '',
      avgOrderValue: '',
      ordersPerDay: '',
      targetProfitPercent: '20'
    });
    setResults(null);
    setAiAdvice(null);
    setLoadingAdvice(false);
  };

  const saveSettings = (newCurrency: CurrencyConfig, newLang: LanguageCode) => {
    setCurrency(newCurrency);
    setLang(newLang);
    localStorage.setItem('poasmaster_currency', newCurrency.code);
    localStorage.setItem('poasmaster_lang', newLang);
    setIsSettingsOpen(false);
  };

  const fetchAiAdvice = async () => {
    if (!results) return;
    setLoadingAdvice(true);
    try {
      const numericInputs: ROASInputs = {
        cogs: parseFloat(inputs.cogs) || 0,
        opEx: parseFloat(inputs.opEx) || 0,
        conversionRate: parseFloat(inputs.conversionRate) || 0,
        avgOrderValue: parseFloat(inputs.avgOrderValue) || 0,
        ordersPerDay: parseFloat(inputs.ordersPerDay) || 0,
        targetProfitPercent: parseFloat(inputs.targetProfitPercent) || 0
      };
      const advice = await getMarketingAdvice(numericInputs, results, currency.symbol, lang);
      setAiAdvice(advice);
    } catch (error) {
      setAiAdvice("⚠️ AI Connection Error.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const breakEvenAnalysis = useMemo(() => {
    if (!results || !results.isViable) return { data: [], bepUnits: 0, bepRevenue: 0, fixedCost: 0 };
    const aov = parseFloat(inputs.avgOrderValue) || 0;
    const varCostPerUnit = (parseFloat(inputs.cogs) || 0) + (parseFloat(inputs.opEx) || 0);
    const fixedCost = results.dailySpend;
    const marginPerUnit = aov - varCostPerUnit;
    const bepUnits = fixedCost / (marginPerUnit || 1);
    const bepRevenue = bepUnits * aov;
    const maxUnits = Math.max(bepUnits * 2, parseFloat(inputs.ordersPerDay) * 1.5, 10);
    const data = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const units = (maxUnits / steps) * i;
      const income = units * aov;
      const totalCost = fixedCost + (units * varCostPerUnit);
      data.push({
        units,
        income,
        cost: totalCost,
        profit: income > totalCost ? income - totalCost : 0,
        loss: totalCost > income ? totalCost - income : 0
      });
    }
    return { data, bepUnits, bepRevenue, fixedCost };
  }, [results, inputs]);

  const renderBreakEvenChart = (isFull: boolean = false, minimalist: boolean = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={breakEvenAnalysis.data} 
        margin={{ 
          top: isFull ? 80 : 20, 
          right: (isFull || !minimalist) ? 60 : 30, 
          left: (isFull || !minimalist) ? 20 : 0, 
          bottom: (isFull || !minimalist) ? 60 : 10 
        }}
      >
        <defs>
          <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="lossArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        {(!minimalist || isFull) && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />}
        
        <XAxis 
          dataKey="units" 
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={(v) => Math.round(v).toString()}
          axisLine={(!minimalist || isFull) ? { stroke: '#1e293b', strokeWidth: 2 } : false}
          tickLine={false}
          tick={(!minimalist || isFull) ? { fontSize: 11, fontWeight: 700, fill: '#64748b' } : false}
          hide={minimalist && !isFull}
        >
          {(!minimalist || isFull) && (
            <Label 
              value={t('units')} 
              offset={-20} 
              position="insideBottom" 
              style={{ fontSize: isFull ? '14px' : '10px', fontStyle: 'italic', fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8', letterSpacing: '0.1em' }} 
            />
          )}
        </XAxis>
        
        <YAxis 
          axisLine={(!minimalist || isFull) ? { stroke: '#1e293b', strokeWidth: 2 } : false}
          tickLine={false}
          tick={(!minimalist || isFull) ? { fontSize: 11, fontWeight: 700, fill: '#64748b' } : false}
          tickFormatter={(v) => `${v}${currency.symbol}`}
          hide={minimalist && !isFull}
        >
          {(!minimalist || isFull) && (
            <Label 
              value={t('finance')} 
              angle={-90} 
              position="insideLeft" 
              style={{ fontSize: isFull ? '14px' : '10px', fontStyle: 'italic', fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8', letterSpacing: '0.1em' }} 
            />
          )}
        </YAxis>

        <RechartsTooltip 
          cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-gray-900/95 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl z-[10000] ring-1 ring-black/5 min-w-[140px]">
                  <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">{Math.round(payload[0].payload.units)} {t('units_abbr')}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-4 items-center">
                      <span className="text-[11px] font-bold text-gray-400">{t('chart_in')}:</span>
                      <span className="text-[11px] font-black">{formatCurrency(payload[0].payload.income.toFixed(0))}</span>
                    </div>
                    <div className="flex justify-between gap-4 items-center">
                      <span className="text-[11px] font-bold text-gray-400">{t('chart_out')}:</span>
                      <span className="text-[11px] font-black">{formatCurrency(payload[0].payload.cost.toFixed(0))}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />

        <Area type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={isFull ? 6 : 4} fill="transparent" isAnimationActive={false} />
        <Area type="monotone" dataKey="cost" stroke="#1e293b" strokeWidth={isFull ? 5 : 3} fill="transparent" isAnimationActive={false} />
        <Area type="monotone" dataKey="loss" stroke="none" fill="url(#lossArea)" baseValue="dataMin" connectNulls />
        <Area type="monotone" dataKey="profit" stroke="none" fill="url(#profitArea)" baseValue="dataMin" connectNulls />

        <ReferenceDot x={breakEvenAnalysis.bepUnits} y={breakEvenAnalysis.bepRevenue} r={isFull ? 10 : 6} fill="#1e293b" stroke="white" strokeWidth={3} />
        <ReferenceLine x={breakEvenAnalysis.bepUnits} stroke="#64748b" strokeDasharray="4 4" />
        <ReferenceLine y={breakEvenAnalysis.bepRevenue} stroke="#64748b" strokeDasharray="4 4" />
        <ReferenceLine y={breakEvenAnalysis.fixedCost} stroke="#94a3b8" strokeDasharray="8 8" 
          label={(!minimalist || isFull) ? { value: t('fixed_cost'), position: 'right', fill: '#94a3b8', fontSize: isFull ? 12 : 10, fontWeight: 800 } : undefined} 
        />

        {isFull && (
          <>
            <ReferenceLine x={breakEvenAnalysis.bepUnits * 0.5} stroke="none" label={{ value: t('loss'), position: 'center', fill: '#f43f5e', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', opacity: 0.6 }} />
            <ReferenceLine x={breakEvenAnalysis.bepUnits * 1.5} stroke="none" label={{ value: t('profit'), position: 'center', fill: '#10b981', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', opacity: 0.6 }} />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      <nav className="sticky top-0 z-[80] bg-white/80 backdrop-blur-lg border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              Poas<span className="text-indigo-600">master</span> <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full ml-1 font-bold uppercase tracking-wider">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-white text-gray-500 hover:text-indigo-600 border border-gray-100 rounded-xl transition-all font-bold text-xs shadow-sm hover:shadow-md active:scale-95"
             >
               <Settings className="w-4 h-4" />
               <span className="hidden sm:inline">{currency.code} | {LANGUAGES.find(l => l.code === lang)?.flag}</span>
             </button>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-300">
             <div className="p-8 pb-4 flex justify-between items-center">
               <h3 className="text-xl font-black text-gray-900">{t('settings')}</h3>
               <button type="button" onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <X className="w-5 h-5 text-gray-400" />
               </button>
             </div>
             
             <div className="px-8 py-4 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Coins className="w-3.5 h-3.5" /> {t('currency')}
                 </label>
                 <div className="grid grid-cols-1 gap-2">
                   {CURRENCIES.map((cur) => (
                     <button key={cur.code} type="button" onClick={() => setCurrency(cur)}
                       className={`flex justify-between items-center px-6 py-4 rounded-2xl transition-all border-2 ${currency.code === cur.code ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                     >
                       <div className="flex flex-col items-start">
                         <span className={`text-sm font-black ${currency.code === cur.code ? 'text-indigo-900' : 'text-gray-900'}`}>{cur.label}</span>
                         <span className="text-[10px] font-bold text-gray-400">{cur.code} ({cur.symbol})</span>
                       </div>
                       {currency.code === cur.code && <Check className="w-5 h-5 text-indigo-600" />}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Globe className="w-3.5 h-3.5" /> {t('language')}
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                   {LANGUAGES.map((l) => (
                     <button key={l.code} type="button" onClick={() => setLang(l.code)}
                       className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 ${lang === l.code ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                     >
                       <span className="text-xl">{l.flag}</span>
                       <span className={`text-xs font-bold ${lang === l.code ? 'text-indigo-900' : 'text-gray-600'}`}>{l.label}</span>
                     </button>
                   ))}
                 </div>
               </div>
             </div>
             
             <div className="p-8 pt-4">
               <button type="button" onClick={() => saveSettings(currency, lang)}
                className="w-full py-4 bg-gray-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-800 transition-colors shadow-lg"
               >
                 {t('save')}
               </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-8 border border-white shadow-xl bg-white/50 relative">
            <button 
              type="button" 
              onClick={handleReset} 
              className="absolute top-8 right-8 text-gray-300 hover:text-rose-500 transition-all p-2.5 bg-gray-50/50 hover:bg-rose-50 rounded-xl z-20 active:scale-90" 
              title={t('reset')}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3 pr-12 relative z-10">
              <div className="p-2 bg-indigo-50 rounded-lg"><LayoutDashboard className="w-4 h-4 text-indigo-500" /></div>
              {t('cost_structure')}
            </h2>
            <div className="space-y-6 relative z-10">
              {[
                { label: t('aov'), name: 'avgOrderValue', icon: Coins, suffix: currency.symbol, tooltip: t('info_aov') },
                { label: t('cogs'), name: 'cogs', icon: ShoppingBag, suffix: currency.symbol, tooltip: t('info_cogs') },
                { label: t('opex'), name: 'opEx', icon: Truck, suffix: currency.symbol, tooltip: t('info_opex') },
                { label: t('conv_rate'), name: 'conversionRate', icon: MousePointerClick, suffix: '%', step: '0.1', tooltip: t('info_conv') },
                { label: t('daily_orders'), name: 'ordersPerDay', icon: Target, suffix: null, tooltip: t('info_orders') }
              ].map((field) => (
                <div key={field.name} className="space-y-2 group">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center group-focus-within:text-indigo-500 transition-colors">
                    <field.icon className="w-3.5 h-3.5 mr-2" /> {field.label} <MetricInfo text={field.tooltip} />
                  </label>
                  <div className="relative">
                    <input type="number" name={field.name} step={field.step || '1'} value={(inputs as any)[field.name]} onChange={handleInputChange} placeholder="0" className="modern-input w-full pl-5 pr-12 py-3.5 rounded-2xl bg-white font-bold text-gray-900 text-lg border-gray-100 transition-all" />
                    {field.suffix && <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-sm">{field.suffix}</span>}
                  </div>
                </div>
              ))}
              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center">{t('target_profit')} <MetricInfo text={t('info_profit')} /></label>
                  <span className="text-indigo-600 font-black text-sm">{inputs.targetProfitPercent}%</span>
                </div>
                <input type="range" name="targetProfitPercent" min="0" max="50" onPointerDown={handleSliderInteraction} value={inputs.targetProfitPercent} onChange={(e) => setInputs(p => ({...p, targetProfitPercent: e.target.value}))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none" />
              </div>
              <button type="button" onClick={handleCalculate} className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-sm transition-all shadow-xl shadow-indigo-200 active:scale-95 group mt-8">
                <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" /> {t('calculate')}
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-10">
          {!results ? (
            <div className="h-full min-h-[500px] glass-card rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-12 bg-white/30 backdrop-blur-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 animate-bounce duration-[2000ms]">
                <Sparkles className="w-10 h-10 text-indigo-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('ready_engine')}</h3>
              <p className="text-gray-400 max-w-sm font-medium leading-relaxed">{t('ready_desc')}</p>
            </div>
          ) : !results.isViable ? (
            <div className="glass-card rounded-[40px] p-12 bg-rose-50 border-rose-100 border-2 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-rose-200"><AlertTriangle className="w-10 h-10 text-white" /></div>
              <h3 className="text-3xl font-black text-rose-900">{t('unviable_title')}</h3>
              <p className="text-rose-600 max-w-lg mx-auto font-medium leading-relaxed">{t('unviable_desc')}</p>
              <div className="pt-4"><button type="button" onClick={handleReset} className="text-rose-700 font-bold uppercase text-xs tracking-widest hover:underline">{t('reset')}</button></div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-3xl p-6 bg-white border-rose-50 border-2">
                  <div className="flex justify-between items-start mb-4"><div className="p-2 bg-rose-50 rounded-lg"><ShieldCheck className="w-5 h-5 text-rose-500" /></div><span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">{t('critical_threshold')}</span></div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">{t('be_roas')} <MetricInfo text={t('be_roas_desc')} /></p>
                  <p className="text-3xl font-black text-gray-900">{results.breakEvenROAS.toFixed(2)}x</p>
                </div>
                <div className="glass-card rounded-3xl p-6 bg-white border-indigo-100 border-2 shadow-2xl shadow-indigo-50 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">{t('healthy_goal')}</div>
                  <div className="flex justify-between items-start mb-4"><div className="p-2 bg-indigo-50 rounded-lg"><Target className="w-5 h-5 text-indigo-500" /></div><span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Profit {inputs.targetProfitPercent}%</span></div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">{t('target_roas')} <MetricInfo text={t('target_roas_desc')} /></p>
                  <p className="text-3xl font-black text-indigo-600">{results.targetROAS.toFixed(2)}x</p>
                </div>
                <div className="glass-card rounded-3xl p-6 bg-gray-900 text-white border-gray-800 shadow-2xl">
                  <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/10 rounded-lg"><Zap className="w-5 h-5 text-amber-400 fill-amber-400" /></div><ArrowUpRight className="text-gray-500 w-5 h-5" /></div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">{t('target_cpa')} <MetricInfo text={t('target_cpa_desc')} /></p>
                  <p className="text-3xl font-black text-white">{formatCurrency(results.targetCPA)}</p>
                </div>
              </div>

              <div className="glass-card rounded-[40px] p-10 bg-white border-gray-100 border-2 overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> {t('bep_analysis')}</h3>
                    <p className="text-lg font-bold text-gray-900 italic">{t('bep_visual')} ({currency.code})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-gray-50 rounded-2xl mr-2">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#10b981]" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('profit')}</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#f43f5e]" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('loss')}</span></div>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] md:h-[450px] w-full relative group">
                  {renderBreakEvenChart(false, isMobile)}
                  {!isMobile && (
                    <div className="absolute bg-white border-2 border-gray-900 px-3 py-1 rounded-full shadow-lg pointer-events-none transition-all duration-700"
                      style={{ left: `${(breakEvenAnalysis.bepUnits / (breakEvenAnalysis.data[breakEvenAnalysis.data.length-1]?.units || 1)) * 100}%`, top: '20%', transform: 'translateX(-50%)' }}
                    ><div className="flex flex-col items-center"><span className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">{t('bep_point')}</span><ArrowUpRight className="w-3 h-3 text-gray-400 rotate-180" /></div></div>
                  )}
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">{t('bep_units')} <MetricInfo text={t('info_bep_units')} /></p>
                     <p className="text-xl font-black text-gray-900">{Math.ceil(breakEvenAnalysis.bepUnits)} {t('units_abbr')}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">{t('bep_revenue')} <MetricInfo text={t('info_bep_revenue')} /></p>
                     <p className="text-xl font-black text-gray-900">{formatCurrency(breakEvenAnalysis.bepRevenue.toFixed(0))}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">{t('fixed_cost')} <MetricInfo text={t('info_fixed_cost')} /></p>
                     <p className="text-xl font-black text-gray-900">{formatCurrency(breakEvenAnalysis.fixedCost.toFixed(0))}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">{t('var_cost_u')} <MetricInfo text={t('info_var_cost')} /></p>
                     <p className="text-xl font-black text-gray-900">{formatCurrency((parseFloat(inputs.cogs) + parseFloat(inputs.opEx)).toFixed(2))}</p>
                   </div>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-8 bg-white space-y-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('bid_limits')}</h3>
                <div className="space-y-6">
                  <div className="group"><p className="text-[10px] font-bold text-gray-300 uppercase mb-1 flex items-center group-hover:text-indigo-400 transition-colors">{t('max_cpc')} <MetricInfo text={t('info_cpc')} /></p><p className="text-xl font-black text-gray-900">{formatCurrency(results.targetCPC.toFixed(2))}</p></div>
                  <div className="group"><p className="text-[10px] font-bold text-gray-300 uppercase mb-1 flex items-center group-hover:text-indigo-400 transition-colors">{t('daily_budget')} <MetricInfo text={t('info_budget')} /></p><p className="text-xl font-black text-gray-900">{formatCurrency(results.dailySpend.toFixed(0))}</p></div>
                  <div className="pt-4 border-t border-gray-50 group"><p className="text-[10px] font-bold text-emerald-400 uppercase mb-1 flex items-center">{t('total_net_profit')} <MetricInfo text={t('info_net')} /></p><p className={`text-2xl font-black ${results.dailyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{results.dailyProfit >= 0 ? '+' : ''}{formatCurrency(results.dailyProfit.toFixed(0))}{t('per_day')}</p></div>
                </div>
              </div>

              <section className="relative rounded-[40px] overflow-hidden bg-gray-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
                <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                  <div className="absolute top-[-40%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]" />
                  <div className="absolute bottom-[-40%] left-[-10%] w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px]" />
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/20 rounded-full w-fit border border-indigo-500/30">
                        <Sparkles className="w-4 h-4 text-indigo-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">{t('strategic_consulting')}</span>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight leading-tight">{t('action_plan')}</h3>
                    </div>
                    {!aiAdvice && (
                      <button type="button" onClick={fetchAiAdvice} disabled={loadingAdvice} className="btn-primary flex items-center justify-center gap-4 px-10 py-5 rounded-[24px] font-black uppercase text-sm shadow-2xl shadow-indigo-900/50 disabled:opacity-50 active:scale-95 transition-all group">
                        {loadingAdvice ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('analyzing')}</> : <>{t('get_roadmap')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                      </button>
                    )}
                  </div>
                  {aiAdvice && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] animate-in zoom-in-95 duration-500">
                      <div className="prose prose-invert max-w-none"><pre className="text-indigo-50 leading-relaxed font-semibold whitespace-pre-wrap break-words font-sans text-base md:text-lg">{aiAdvice}</pre></div>
                      <button type="button" onClick={() => setAiAdvice(null)} className="mt-10 text-[11px] font-black text-indigo-400 hover:text-indigo-200 transition-colors uppercase tracking-[0.2em] flex items-center gap-3">
                        <RotateCcw className="w-4 h-4" /> {t('recalculate_strat')}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-gray-100 py-12 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default"><TrendingUp className="w-5 h-5 text-indigo-600" /><span className="font-black uppercase text-xs tracking-tighter text-gray-900">Poasmaster pro <span className="font-light">v8.2.2</span></span></div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">{t('footer_desc')} ({currency.code} | {lang.toUpperCase()})</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
