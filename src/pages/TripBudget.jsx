import React, { useState, useEffect, useMemo } from 'react';
import { 
  Utensils, 
  Mountain, 
  Landmark, 
  Car, 
  Bed, 
  Sparkles, 
  AlertTriangle, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Save,
  Info
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Stay', category: 'Stay', total_cost: 35000 },
  { id: 'cat-2', name: 'Adventure', category: 'Adventure', total_cost: 25000 },
  { id: 'cat-3', name: 'Food', category: 'Food', total_cost: 18000 },
  { id: 'cat-4', name: 'Transport', category: 'Transport', total_cost: 15000 },
  { id: 'cat-5', name: 'Sightseeing', category: 'Sightseeing', total_cost: 9000 },
  { id: 'cat-6', name: 'Other', category: 'Other', total_cost: 5000 },
];

const MOCK_DAYS = [
  { date: 'Dec 10', cost: 10000 },
  { date: 'Dec 11', cost: 8000 },
  { date: 'Dec 12', cost: 0 },
  { date: 'Dec 13', cost: 15000 },
  { date: 'Dec 14', cost: 38000 }, // Spike day
  { date: 'Dec 15', cost: 12000 },
  { date: 'Dec 16', cost: 15000 },
  { date: 'Dec 17', cost: 9000 },
];

const CATEGORY_CONFIG = {
  Food: { icon: Utensils, color: 'text-orange-500', hex: '#f97316', bgHover: 'hover:bg-orange-50', bgBar: 'bg-orange-500' },
  Adventure: { icon: Mountain, color: 'text-green-500', hex: '#22c55e', bgHover: 'hover:bg-green-50', bgBar: 'bg-green-500' },
  Sightseeing: { icon: Landmark, color: 'text-blue-500', hex: '#3b82f6', bgHover: 'hover:bg-blue-50', bgBar: 'bg-blue-500' },
  Transport: { icon: Car, color: 'text-slate-500', hex: '#64748b', bgHover: 'hover:bg-slate-50', bgBar: 'bg-slate-500' },
  Stay: { icon: Bed, color: 'text-purple-500', hex: '#a855f7', bgHover: 'hover:bg-purple-50', bgBar: 'bg-purple-500' },
  Other: { icon: Sparkles, color: 'text-pink-500', hex: '#ec4899', bgHover: 'hover:bg-pink-50', bgBar: 'bg-pink-500' },
};

export default function TripBudget({ tripId = 'trip-1', budgetCap, currency = 'INR' }) {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [days, setDays] = useState([]);
  const [localBudgetCap, setLocalBudgetCap] = useState('');
  const [activeBudgetCap, setActiveBudgetCap] = useState(budgetCap || null);
  const [animate, setAnimate] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setCategories([...MOCK_CATEGORIES].sort((a, b) => b.total_cost - a.total_cost));
      setDays([...MOCK_DAYS]);
      if (budgetCap) {
        setLocalBudgetCap(budgetCap.toString());
      } else {
        setLocalBudgetCap('100000');
        setActiveBudgetCap(100000);
      }
      setLoading(false);
      
      // Trigger animation slightly after mount
      setTimeout(() => setAnimate(true), 100);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [tripId, budgetCap]);

  // --- DERIVED CALCULATIONS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
  };

  const totalCost = useMemo(() => categories.reduce((sum, cat) => sum + cat.total_cost, 0), [categories]);
  const dailyAverage = useMemo(() => totalCost / (days.length || 1), [totalCost, days]);
  
  // Budget Health
  const isOverBudget = activeBudgetCap !== null && totalCost > activeBudgetCap;
  const budgetRemaining = activeBudgetCap !== null ? activeBudgetCap - totalCost : null;
  const budgetSpentPct = activeBudgetCap !== null ? Math.min((totalCost / activeBudgetCap) * 100, 100) : 0;
  const actualBudgetSpentPct = activeBudgetCap !== null ? (totalCost / activeBudgetCap) * 100 : 0;

  // Progress bar color transition based on usage
  const getProgressBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-teal-500';
  };

  // Spike Days Detection (1.5x daily average)
  const spikeThreshold = dailyAverage * 1.5;
  const spikeDays = useMemo(() => days.filter(d => d.cost > spikeThreshold), [days, spikeThreshold]);

  // Donut Chart logic
  const R = 60;
  const CIRCUMFERENCE = 2 * Math.PI * R; // ~376.99
  let currentDonutOffset = 0;
  
  const donutData = categories.map(cat => {
    const pct = totalCost > 0 ? cat.total_cost / totalCost : 0;
    const arcLength = pct * CIRCUMFERENCE;
    const offset = currentDonutOffset;
    currentDonutOffset += arcLength;
    return {
      ...cat,
      pct,
      arcLength,
      offset
    };
  });

  // Daily Chart Max
  const maxDayCost = useMemo(() => Math.max(...days.map(d => d.cost), dailyAverage * 1.2), [days, dailyAverage]);

  // --- HANDLERS ---
  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = Number(localBudgetCap);
    if (!isNaN(val) && val > 0) {
      setActiveBudgetCap(val);
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto animate-pulse flex flex-col gap-6">
          <div className="h-20 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          <div className="h-48 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="h-96 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
            <div className="h-96 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (totalCost === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md w-full">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <PiggyBank className="w-12 h-12 text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No expenses yet</h2>
          <p className="text-slate-500 mb-8">Add activities with estimated costs in your itinerary to see the breakdown here.</p>
          <a href={`/trips/${tripId}/itinerary`} className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm w-full">
            Go to Itinerary Builder
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 md:pb-8">
      
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">Trip Budget & Cost Breakdown</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1 shrink-0"><Calendar className="w-4 h-4" /> Dec 10 - Dec 17</span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
                  {days.length} days &middot; 2 stops
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <a href={`/trips/${tripId}/itinerary`} className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors">
                Back to Itinerary
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* HERO TOTAL SECTION */}
        <section className="mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-teal-50 to-orange-50 rounded-3xl p-6 md:p-10 shadow-sm border border-teal-100 relative overflow-hidden">
            
            {/* Decorative background circle */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Trip Cost</h2>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                    {formatCurrency(totalCost)}
                  </span>
                  <span className="text-lg md:text-xl font-medium text-slate-500">
                    &approx; {formatCurrency(dailyAverage)}/day
                  </span>
                </div>
              </div>
              
              {activeBudgetCap !== null && (
                <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm border border-white/50 text-center self-start md:self-end md:min-w-[180px]">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Budget Health</div>
                  {isOverBudget ? (
                    <div className="flex items-center gap-1.5 text-red-600 font-bold justify-center">
                      <TrendingUp className="w-5 h-5" /> {formatCurrency(Math.abs(budgetRemaining))} Over
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold justify-center">
                      <TrendingDown className="w-5 h-5" /> {formatCurrency(budgetRemaining)} Left
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {activeBudgetCap !== null && (
              <div className="mt-6 md:mt-8 max-w-3xl">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                  <span>Spent: {formatCurrency(totalCost)}</span>
                  <span>Cap: {formatCurrency(activeBudgetCap)}</span>
                </div>
                <div className="h-3 w-full bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(actualBudgetSpentPct)}`}
                    style={{ width: animate ? `${budgetSpentPct}%` : '0%' }}
                  ></div>
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 
                    You have exceeded your budget by {formatCurrency(Math.abs(budgetRemaining))}.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* TWO COLUMN GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN */}
          <div className="w-full space-y-6 lg:space-y-8 order-2 lg:order-1">
            
            {/* CATEGORY BREAKDOWN LIST */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Cost by Category</h3>
              
              <div className="space-y-4">
                {categories.map((cat, index) => {
                  const conf = CATEGORY_CONFIG[cat.category] || CATEGORY_CONFIG.Other;
                  const Icon = conf.icon;
                  const pct = totalCost > 0 ? Math.round((cat.total_cost / totalCost) * 100) : 0;
                  
                  return (
                    <div key={cat.id} className={`group relative p-3 -mx-3 rounded-xl transition-colors ${conf.bgHover}`}>
                      <div className="flex items-center justify-between mb-2 z-10 relative">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 ${conf.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Hover Percentage */}
                          <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {pct}%
                          </span>
                          <span className="font-bold text-slate-700">{formatCurrency(cat.total_cost)}</span>
                        </div>
                      </div>
                      
                      {/* Proportional Bar */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative z-0 ml-13">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out delay-${index * 100} ${conf.bgBar}`}
                          style={{ width: animate ? `${pct}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PER-DAY BAR CHART */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Daily Spend</h3>
              
              {/* Spike Days Warning */}
              {spikeDays.length > 0 && (
                <div className="mb-6 flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  <div className="text-sm font-medium">
                    <p className="mb-1">High spend days detected!</p>
                    <p className="text-amber-700 opacity-90">
                      {spikeDays.map(d => `${d.date} (${(d.cost / dailyAverage).toFixed(1)}x avg)`).join(', ')}. 
                      Consider spreading expensive activities out.
                    </p>
                  </div>
                </div>
              )}

              <div className="relative pt-8 pb-4">
                {/* Y-axis guiding lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pt-8 pb-10">
                  <div className="border-b border-slate-100 w-full flex-1"></div>
                  <div className="border-b border-slate-100 w-full flex-1"></div>
                  <div className="border-b border-slate-100 w-full flex-1"></div>
                  <div className="border-b border-slate-200 w-full"></div>
                </div>

                {/* Bars Container */}
                <div className="relative z-10 flex items-end justify-between h-48 md:h-64 gap-2 md:gap-4 lg:gap-6 w-full overflow-x-auto hide-scrollbar snap-x">
                  {days.map((day, idx) => {
                    const heightPct = maxDayCost > 0 ? (day.cost / maxDayCost) * 100 : 0;
                    const isZero = day.cost === 0;
                    const isSpike = day.cost > spikeThreshold;
                    
                    let barColor = 'bg-teal-500 hover:bg-teal-400';
                    if (isZero) barColor = 'bg-amber-400 hover:bg-amber-300';
                    else if (isSpike) barColor = 'bg-orange-500 hover:bg-orange-400';

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full snap-center min-w-[40px] group relative">
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {formatCurrency(day.cost)}
                          {/* Triangle pointer */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>

                        {/* Bar */}
                        <div className="w-full flex justify-center items-end h-full group-hover:scale-y-105 origin-bottom transition-transform duration-200">
                          <div 
                            className={`w-full max-w-[48px] rounded-t-lg transition-all duration-1000 ease-out shadow-sm ${barColor}`}
                            style={{ 
                              height: animate ? `${Math.max(heightPct, isZero ? 2 : 4)}%` : '0%',
                              opacity: isZero && !animate ? 0 : 1
                            }}
                          >
                            {isZero && animate && (
                              <div className="h-full w-full flex items-center justify-center opacity-70">
                                <span className="text-[10px] font-bold text-white transform -rotate-90 block">REST</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* X-axis Label */}
                        <div className={`mt-3 text-xs font-semibold whitespace-nowrap ${isZero ? 'text-amber-600' : 'text-slate-500'}`}>
                          {day.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full space-y-6 lg:space-y-8 order-1 lg:order-2">
            
            {/* DONUT CHART CARD */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8 flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-900 mb-6 self-start w-full">Distribution</h3>
              
              {/* SVG Donut */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-8 group">
                <svg width="100%" height="100%" viewBox="0 0 140 140" className="transform -rotate-90 drop-shadow-sm">
                  {/* Background Track */}
                  <circle cx="70" cy="70" r={R} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                  
                  {/* Segments */}
                  {donutData.map((slice, idx) => {
                    const conf = CATEGORY_CONFIG[slice.category] || CATEGORY_CONFIG.Other;
                    return (
                      <circle 
                        key={slice.id}
                        cx="70" 
                        cy="70" 
                        r={R} 
                        fill="transparent" 
                        stroke={conf.hex} 
                        strokeWidth="16" 
                        strokeDasharray={`${slice.arcLength} ${CIRCUMFERENCE}`} 
                        strokeDashoffset={animate ? -slice.offset : CIRCUMFERENCE}
                        className="transition-all duration-1000 ease-out origin-center hover:stroke-[20px] cursor-pointer outline-none"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <title>{slice.name}: {formatCurrency(slice.total_cost)} ({(slice.pct * 100).toFixed(0)}%)</title>
                      </circle>
                    );
                  })}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total</span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 px-2 truncate w-full text-center">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
                {categories.map(cat => {
                  const conf = CATEGORY_CONFIG[cat.category] || CATEGORY_CONFIG.Other;
                  return (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: conf.hex }}></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-700 truncate">{cat.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">{formatCurrency(cat.total_cost)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* BUDGET CAP CARD */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <PiggyBank className="w-24 h-24" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">Set a Budget</h3>
              <p className="text-sm text-slate-500 mb-6 relative z-10">Define a cap to track your spending limits automatically.</p>
              
              <form onSubmit={handleSaveBudget} className="relative z-10">
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="e.g. 50000"
                    aria-label="Trip budget limit"
                    value={localBudgetCap}
                    onChange={(e) => setLocalBudgetCap(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 font-bold transition-shadow bg-slate-50 focus:bg-white"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  <Save className="w-4 h-4" /> Save Budget Limit
                </button>
              </form>
              
              {isOverBudget && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-sm text-red-600 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You are over budget! Try reducing your <span className="font-bold">{categories[0].name}</span> costs.</p>
                </div>
              )}
              {!isOverBudget && activeBudgetCap !== null && (
                 <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-sm text-slate-500">
                 <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
                 <p>You have <span className="font-bold text-teal-600">{formatCurrency(budgetRemaining)}</span> buffer remaining.</p>
               </div>
              )}
            </section>
          </div>
        </div>

      </main>
    </div>
  );
}
