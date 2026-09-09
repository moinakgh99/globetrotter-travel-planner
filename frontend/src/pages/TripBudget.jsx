import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Save,
  Info,
  Plus,
  Trash2,
  Edit3,
  X,
  Compass,
  Home,
  Wallet,
  RefreshCw,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// ─────────────────────────────────────────────
// CONFIG & CONSTANTS
// ─────────────────────────────────────────────

const CATEGORY_CONFIG = {
  Food:        { icon: Utensils,  color: 'text-orange-500',  bg: 'bg-orange-50',     hex: '#f97316', bar: 'bg-orange-500' },
  Adventure:   { icon: Mountain,  color: 'text-green-500',   bg: 'bg-green-50',      hex: '#22c55e', bar: 'bg-green-500' },
  Sightseeing: { icon: Landmark,  color: 'text-blue-500',    bg: 'bg-blue-50',       hex: '#3b82f6', bar: 'bg-blue-500' },
  Transport:   { icon: Car,       color: 'text-purple-500',  bg: 'bg-purple-50',     hex: '#a855f7', bar: 'bg-purple-500' },
  Stay:        { icon: Bed,       color: 'text-indigo-500',  bg: 'bg-indigo-50',     hex: '#6366f1', bar: 'bg-indigo-500' },
  Other:       { icon: Sparkles,  color: 'text-slate-500',   bg: 'bg-slate-50',      hex: '#64748b', bar: 'bg-slate-500' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const getToken = () => localStorage.getItem('token');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 focus:outline-none group">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-teal-600 transition-colors">
            Globe<span className="text-teal-600">Trotter</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Dashboard',   to: '/' },
            { label: 'My Trips',    to: '/trips' },
            { label: 'Create Trip', to: '/trips/create' },
          ].map(({ label, to }) => (
            <Link key={to} to={to} className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-slate-200 transition-all focus:outline-none">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="text-sm font-semibold text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-xl transition-all focus:outline-none"
            >
              Log out
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all focus:outline-none">
                Log in
              </button>
              <button onClick={() => navigate('/register')} className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function TripBudget() {
  const { id } = useParams();
  const tripId = id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planned'); // 'planned' | 'actual'

  // Data states
  const [trip, setTrip] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  
  // Planned budget derived from itinerary stops
  const [itineraryBudget, setItineraryBudget] = useState([]);
  
  // Manual overrides for planned budget (stored in localStorage)
  const [plannedOverrides, setPlannedOverrides] = useState({});
  const [isEditingPlanned, setIsEditingPlanned] = useState(false);
  const [plannedEditForm, setPlannedEditForm] = useState({});

  // Expenses stored in localStorage (mocking backend for now)
  const [expenses, setExpenses] = useState([]);

  // Form states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '', category: 'Food', amount: '', date: '', notes: ''
  });

  // Initialization: Fetch Trip and Itinerary Stops
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!tripId) {
          const tripsRes = await fetch(`${API_URL}/api/trips`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          if (tripsRes.ok) {
            const tripsData = await tripsRes.json();
            setAllTrips(tripsData);
          }
          return;
        }

        // Fetch Trip
        const tripRes = await fetch(`${API_URL}/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (tripRes.ok) {
          const tripData = await tripRes.json();
          setTrip(tripData);
        }

        // Fetch Itinerary Stops (to derive planned budget)
        const stopsRes = await fetch(`${API_URL}/api/trips/${tripId}/stops`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        let derivedPlanned = {};
        CATEGORIES.forEach(c => derivedPlanned[c] = 0);
        
        if (stopsRes.ok) {
          const stopsData = await stopsRes.json();
          // Aggregate estimated costs by category
          stopsData.forEach(stop => {
            stop.activities?.forEach(act => {
              const cat = act.category || 'Other';
              if (derivedPlanned[cat] !== undefined) {
                derivedPlanned[cat] += Number(act.estimated_cost) || 0;
              } else {
                derivedPlanned['Other'] += Number(act.estimated_cost) || 0;
              }
            });
          });
        }
        
        // Convert map to array
        const plannedArr = CATEGORIES.map(c => ({
          category: c,
          amount: derivedPlanned[c] || 0
        }));
        
        setItineraryBudget(plannedArr);

        // Load local data (expenses and overrides)
        const localExpenses = localStorage.getItem(`expenses_${tripId}`);
        if (localExpenses) setExpenses(JSON.parse(localExpenses));
        
        const localOverrides = localStorage.getItem(`plannedOverrides_${tripId}`);
        if (localOverrides) setPlannedOverrides(JSON.parse(localOverrides));

      } catch (err) {
        console.error("Failed to load budget data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  // Save expenses to local storage when changed
  useEffect(() => {
    if (!loading && tripId) {
      localStorage.setItem(`expenses_${tripId}`, JSON.stringify(expenses));
    }
  }, [expenses, loading, tripId]);
  
  // Save overrides to local storage when changed
  useEffect(() => {
    if (!loading && tripId) {
      localStorage.setItem(`plannedOverrides_${tripId}`, JSON.stringify(plannedOverrides));
    }
  }, [plannedOverrides, loading, tripId]);


  // ─────────────────────────────────────────────
  // CALCULATIONS
  // ─────────────────────────────────────────────
  
  // Calculate final planned budget (itinerary values OR manual overrides)
  const finalPlannedBudget = useMemo(() => {
    return itineraryBudget.map(item => ({
      category: item.category,
      amount: plannedOverrides[item.category] !== undefined ? plannedOverrides[item.category] : item.amount
    }));
  }, [itineraryBudget, plannedOverrides]);

  const totalPlanned = useMemo(() => finalPlannedBudget.reduce((sum, item) => sum + Number(item.amount), 0), [finalPlannedBudget]);
  const totalSpent = useMemo(() => expenses.reduce((sum, exp) => sum + Number(exp.amount), 0), [expenses]);
  
  const totalBudgetCap = trip?.budget_cap || totalPlanned || 1; // Fallback to 1 to avoid div by zero if completely empty
  const remainingBudget = totalBudgetCap - totalSpent;
  const percentSpent = Math.min(Math.round((totalSpent / totalBudgetCap) * 100) || 0, 100);
  
  const tripDays = useMemo(() => {
    if (!trip || !trip.start_date || !trip.end_date) return 1;
    return Math.max(1, Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)));
  }, [trip]);

  const spentByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => map[c] = 0);
    expenses.forEach(exp => {
      if (map[exp.category] !== undefined) map[exp.category] += Number(exp.amount);
    });
    return map;
  }, [expenses]);


  // ─────────────────────────────────────────────
  // CHART DATA PREP
  // ─────────────────────────────────────────────
  
  const pieChartData = finalPlannedBudget.filter(item => item.amount > 0).map(item => ({
    name: item.category,
    value: item.amount,
    color: CATEGORY_CONFIG[item.category]?.hex || '#94a3b8'
  }));

  const barChartData = CATEGORIES.map(cat => ({
    name: cat,
    Planned: finalPlannedBudget.find(p => p.category === cat)?.amount || 0,
    Actual: spentByCategory[cat] || 0
  })).filter(item => item.Planned > 0 || item.Actual > 0);


  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────

  const handleOpenExpenseForm = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        notes: expense.notes || ''
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        title: '',
        category: 'Food',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.date) return;

    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? { ...exp, ...expenseForm, amount: Number(expenseForm.amount) } : exp));
    } else {
      const newExpense = {
        id: `exp-${Date.now()}`,
        ...expenseForm,
        amount: Number(expenseForm.amount)
      };
      setExpenses(prev => [newExpense, ...prev]);
    }
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };
  
  // Handlers for Editing Planned Budget
  const handleEditPlannedStart = () => {
    const initialForm = {};
    finalPlannedBudget.forEach(item => {
      initialForm[item.category] = item.amount;
    });
    setPlannedEditForm(initialForm);
    setIsEditingPlanned(true);
  };

  const handleEditPlannedSave = () => {
    setPlannedOverrides(plannedEditForm);
    setIsEditingPlanned(false);
  };

  const handleEditPlannedReset = () => {
    if (window.confirm('Reset planned budget to itinerary estimated costs?')) {
      setPlannedOverrides({});
      setIsEditingPlanned(false);
    }
  };


  // ─────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-12 w-64 bg-white rounded-xl" />
          <div className="h-32 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!tripId) {
    const today = new Date().toISOString().split('T')[0];
    const ongoing = allTrips.filter(t => t.start_date <= today && (!t.end_date || t.end_date >= today));
    const planning = allTrips.filter(t => t.start_date > today);
    const completed = allTrips.filter(t => t.end_date && t.end_date < today);

    const renderTrips = (trips, title, colorClass, badgeColor) => {
      if (trips.length === 0) return null;
      return (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`}></span>
            {title} ({trips.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:-translate-y-1 transition-all">
                <div className={`h-28 ${colorClass} flex flex-col justify-end p-5 relative overflow-hidden`}>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                  <Wallet className="w-12 h-12 text-white/30 absolute right-4 top-1/2 -translate-y-1/2" />
                  <h3 className="text-white font-extrabold text-lg leading-tight w-full z-10 truncate">{trip.name}</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2 leading-relaxed">{trip.description || 'No description provided.'}</p>
                  <Link to={`/trips/${trip.id}/budget`} className="w-full text-center bg-slate-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-slate-100 font-semibold py-3 rounded-xl transition-colors focus:ring-2 focus:ring-teal-500">
                    View Budget Breakdown
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 font-sans pb-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
              <Wallet className="w-8 h-8 text-teal-500" />
              Trip Budgets
            </h1>
            <p className="text-slate-500 font-medium">Select a trip below to view or manage its budget breakdown.</p>
          </div>
          
          {allTrips.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center max-w-2xl mx-auto mt-10 shadow-sm">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-5">
                <PiggyBank className="w-10 h-10 text-teal-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl mb-2">No trips found</h3>
              <p className="text-slate-500 mt-2 mb-8">You don't have any trips yet. Create one to start budgeting!</p>
              <Link to="/trips/create" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-sm">
                Create Your First Trip
              </Link>
            </div>
          ) : (
            <>
              {renderTrips(ongoing, "Ongoing Trips", "bg-orange-500", "bg-orange-500")}
              {renderTrips(planning, "Planning Phase", "bg-teal-600", "bg-teal-500")}
              {renderTrips(completed, "Completed Trips", "bg-slate-600", "bg-slate-400")}
            </>
          )}
        </div>
      </div>
    );
  }

  const currency = trip?.currency || 'INR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 font-sans pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/trips" className="text-sm font-medium text-teal-600 hover:underline">My Trips</Link>
              <span className="text-slate-400 text-sm">/</span>
              <span className="text-sm font-medium text-slate-500">{trip?.name}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-teal-500" />
              Trip Budget
            </h1>
            <p className="text-slate-500 mt-2">Manage your planned budget and track actual expenses for {trip?.name}.</p>
          </div>
          
          {/* Main Stats Summary (Always visible) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-6 shrink-0">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Spent</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSpent, currency)}</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
              <p className={`text-xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-teal-600'}`}>
                {formatCurrency(remainingBudget, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 inline-flex shadow-sm border border-slate-100 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('planned')}
            className={`flex-1 sm:w-32 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'planned' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            Planned
          </button>
          <button
            onClick={() => setActiveTab('actual')}
            className={`flex-1 sm:w-32 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'actual' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            Actual
          </button>
        </div>


        {/* ============================================================== */}
        {/* PLANNED TAB */}
        {/* ============================================================== */}
        {activeTab === 'planned' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Summary & Breakdown */}
              <div className="lg:col-span-5 space-y-6">
                {/* Total Planned Card */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50" />
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
                    <PiggyBank className="w-6 h-6 text-teal-500" />
                  </div>
                  <h3 className="text-slate-500 font-medium mb-1 relative z-10">Total Planned Budget</h3>
                  <p className="text-4xl font-extrabold text-slate-900 mb-2 relative z-10">{formatCurrency(totalPlanned, currency)}</p>
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex justify-between relative z-10">
                    <span>Avg Daily:</span>
                    <span className="font-bold">{formatCurrency(totalPlanned / tripDays, currency)}</span>
                  </div>
                </div>

                {/* Edit Form or Display List */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-teal-500" /> 
                      Budget Breakdown
                    </h3>
                    {!isEditingPlanned ? (
                      <button 
                        onClick={handleEditPlannedStart}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                    ) : (
                      <button 
                        onClick={handleEditPlannedSave}
                        className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                    )}
                  </div>
                  
                  {isEditingPlanned ? (
                    <div className="space-y-3">
                      {CATEGORIES.map(cat => {
                        const conf = CATEGORY_CONFIG[cat];
                        return (
                          <div key={cat} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 w-28">
                              <conf.icon className={`w-4 h-4 ${conf.color}`} /> {cat}
                            </span>
                            <div className="relative flex-1">
                               <span className="absolute left-2.5 top-2 text-slate-400 text-sm">₹</span>
                               <input 
                                 type="number"
                                 min="0"
                                 value={plannedEditForm[cat] || ''}
                                 onChange={(e) => setPlannedEditForm({...plannedEditForm, [cat]: Number(e.target.value)})}
                                 className="w-full border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                               />
                            </div>
                          </div>
                        )
                      })}
                      <button onClick={handleEditPlannedReset} className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 underline text-center flex justify-center items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Reset to Itinerary Estimates
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {finalPlannedBudget.sort((a,b)=>b.amount-a.amount).map((item, idx) => {
                        const conf = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Other;
                        const Icon = conf.icon;
                        const pct = Math.round((item.amount / totalPlanned) * 100) || 0;
                        if (item.amount === 0) return null;
                        
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1.5 items-center">
                              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                <Icon className={`w-4 h-4 ${conf.color}`} /> {item.category}
                              </span>
                              <span className="font-bold text-slate-900">{formatCurrency(item.amount, currency)} <span className="text-slate-400 font-normal ml-1">({pct}%)</span></span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${conf.bar} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {totalPlanned === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No budget planned yet. Start editing or add itinerary stops.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Charts */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                 <h3 className="font-bold text-slate-800 mb-6 self-start flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-teal-500" />
                    Budget Distribution
                 </h3>
                 
                 {pieChartData.length > 0 ? (
                   <div className="w-full h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={pieChartData}
                           cx="50%"
                           cy="50%"
                           innerRadius={70}
                           outerRadius={120}
                           paddingAngle={3}
                           dataKey="value"
                         >
                           {pieChartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <RechartsTooltip 
                           formatter={(value) => formatCurrency(value, currency)}
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         />
                         <Legend verticalAlign="bottom" height={36}/>
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 ) : (
                    <div className="text-slate-400 text-sm flex flex-col items-center">
                      <PieChartIcon className="w-12 h-12 mb-3 text-slate-300" />
                      <p>No budget data to chart.</p>
                    </div>
                 )}
              </div>
              
            </div>
            
            <div className="bg-sky-50 rounded-3xl border border-sky-100 p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Planning Phase</h4>
                <p className="text-sm text-slate-600">This budget is initially populated from your AI itinerary estimated costs. You can edit it manually above. Switch to the <strong>Actual</strong> tab to start tracking real expenses.</p>
              </div>
            </div>

          </div>
        )}


        {/* ============================================================== */}
        {/* ACTUAL TAB */}
        {/* ============================================================== */}
        {activeTab === 'actual' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Top Bar Summary */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
               <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                 <div className="flex-1">
                   <h3 className="font-bold text-slate-800 mb-4">Overall Spending Progress</h3>
                   
                   <div className="flex justify-between text-sm font-semibold mb-2">
                     <span className="text-slate-500">Spent: <span className="text-slate-900">{formatCurrency(totalSpent, currency)}</span></span>
                     <span className="text-slate-500">Planned Cap: <span className="text-slate-900">{formatCurrency(totalBudgetCap, currency)}</span></span>
                   </div>
                   
                   <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden relative">
                     <div 
                       className={`h-full rounded-full transition-all duration-500 ${percentSpent > 90 ? 'bg-red-500' : percentSpent > 75 ? 'bg-orange-400' : 'bg-teal-500'}`} 
                       style={{ width: `${Math.min(percentSpent, 100)}%` }} 
                     />
                   </div>
                   
                   {remainingBudget < 0 && (
                     <p className="text-sm text-red-500 font-medium mt-3 flex items-center gap-1.5">
                       <AlertTriangle className="w-4 h-4" /> You are over budget by {formatCurrency(Math.abs(remainingBudget), currency)}
                     </p>
                   )}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 shrink-0">
                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Avg Daily Spent</p>
                      <p className="text-xl font-bold text-slate-800">{formatCurrency(totalSpent / tripDays, currency)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Target Daily</p>
                      <p className="text-xl font-bold text-slate-800">{formatCurrency(totalBudgetCap / tripDays, currency)}</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Expense List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-lg">Expense List</h3>
                  <button 
                    onClick={() => handleOpenExpenseForm()}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <Plus className="w-4 h-4" /> Add Expense
                  </button>
                </div>
                
                {expenses.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <PiggyBank className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-700 mb-1">No expenses yet</h4>
                    <p className="text-sm text-slate-500 max-w-sm mb-4">Start tracking your actual spending by adding your first expense.</p>
                    <button 
                      onClick={() => handleOpenExpenseForm()}
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      + Add your first expense
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                      {expenses.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(exp => {
                        const conf = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.Other;
                        const Icon = conf.icon;
                        
                        return (
                          <li key={exp.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors group flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${conf.bg}`}>
                              <Icon className={`w-6 h-6 ${conf.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-bold text-slate-900 truncate">{exp.title}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(exp.date)} • {exp.category}</p>
                                </div>
                                <span className="font-bold text-slate-900 whitespace-nowrap">
                                  {formatCurrency(exp.amount, currency)}
                                </span>
                              </div>
                              {exp.notes && <p className="text-sm text-slate-500 mt-2 italic">"{exp.notes}"</p>}
                            </div>
                            
                            {/* Actions (visible on hover) */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row gap-1 shrink-0 absolute right-4 sm:relative sm:right-0">
                              <button onClick={() => handleOpenExpenseForm(exp)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Breakdown Sidebar & Bar Chart */}
              <div className="lg:col-span-5 space-y-6">
                 
                 {/* Bar Chart Planned vs Actual */}
                 <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm h-72">
                   <h3 className="font-bold text-slate-800 text-sm mb-4">Planned vs Actual</h3>
                   <ResponsiveContainer width="100%" height="85%">
                     <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`}/>
                       <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                       <Legend wrapperStyle={{ fontSize: '12px' }} />
                       <Bar dataKey="Planned" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="Actual" fill="#0f766e" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>

                 <h3 className="font-bold text-slate-800 text-lg">Category Spending</h3>
                 <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                    {CATEGORIES.map(cat => {
                      const amount = spentByCategory[cat];
                      if (amount === 0) return null;
                      
                      const conf = CATEGORY_CONFIG[cat];
                      const Icon = conf.icon;
                      const pct = Math.round((amount / totalSpent) * 100) || 0;
                      
                      // Compare with planned
                      const plannedAmt = finalPlannedBudget.find(p => p.category === cat)?.amount || 0;
                      const isOver = plannedAmt > 0 && amount > plannedAmt;

                      return (
                        <div key={cat} className="space-y-1.5">
                           <div className="flex justify-between text-sm items-center">
                             <span className="flex items-center gap-1.5 font-medium text-slate-700">
                               <Icon className={`w-4 h-4 ${conf.color}`} /> {cat}
                             </span>
                             <span className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-900'}`}>
                               {formatCurrency(amount, currency)}
                             </span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                             <div className={`h-full ${isOver ? 'bg-red-500' : conf.bar} rounded-full`} style={{ width: `${pct}%` }} />
                           </div>
                           {isOver && (
                             <p className="text-[10px] text-red-500 font-semibold text-right">
                               Over planned {formatCurrency(plannedAmt, currency)}
                             </p>
                           )}
                        </div>
                      )
                    })}
                    
                    {totalSpent === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No spending data yet.</p>
                    )}
                 </div>
              </div>
              
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* EXPENSE MODAL */}
      {/* ============================================================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">What was it for?</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  placeholder="e.g. Dinner, Taxi, Hotel"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition-all"
                  value={expenseForm.title}
                  onChange={e => setExpenseForm({...expenseForm, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Amount ({currency})</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition-all"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition-all"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const conf = CATEGORY_CONFIG[cat];
                    const Icon = conf.icon;
                    const isSel = expenseForm.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setExpenseForm({...expenseForm, category: cat})}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                          isSel ? `${conf.bg} border-${conf.hex.replace('#','')} text-slate-800 shadow-sm ring-1 ring-current` : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                        style={{ borderColor: isSel ? conf.hex : '' }}
                      >
                        <Icon className={`w-5 h-5 ${isSel ? conf.color : 'text-slate-400'}`} />
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="Any extra details..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition-all resize-none"
                  value={expenseForm.notes}
                  onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})}
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
