import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plane, MapPin, Calendar, Clock, Plus, Search,
  Compass, ChevronRight, Loader2, AlertCircle,
  Trash2, Edit3, Share2, CheckCheck, Eye,
  CheckCircle, Zap, BookOpen, MoreVertical, X,
  RefreshCw, Home
} from 'lucide-react';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const getToken = () => localStorage.getItem('token');

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getNights = (start, end) => {
  if (!start || !end) return null;
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
};

/**
 * Determine trip status from dates:
 *   - completed  : end_date is in the past
 *   - ongoing    : today is between start_date and end_date
 *   - planning   : start_date is in the future (no stops/itinerary activity yet)
 */
const computeStatus = (trip) => {
  const now = new Date();
  const start = trip.start_date ? new Date(trip.start_date) : null;
  const end   = trip.end_date   ? new Date(trip.end_date)   : null;

  if (end && end < now)                           return 'completed';
  if (start && end && start <= now && now <= end) return 'ongoing';
  return 'planning';
};

const STATUS_META = {
  completed: {
    label: 'Completed',
    dot:   'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
    icon:  CheckCircle,
    iconColor: 'text-slate-400',
  },
  ongoing: {
    label: 'Ongoing',
    dot:   'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700',
    icon:  Zap,
    iconColor: 'text-orange-500',
  },
  planning: {
    label: 'Planning',
    dot:   'bg-teal-500',
    badge: 'bg-teal-50 text-teal-700',
    icon:  BookOpen,
    iconColor: 'text-teal-500',
  },
};

// ─────────────────────────────────────────────
// TRIP CARD
// ─────────────────────────────────────────────

function TripCard({ trip, onDelete, onShare }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status  = computeStatus(trip);
  const meta    = STATUS_META[status];
  const nights  = getNights(trip.start_date, trip.end_date);
  const StatusIcon = meta.icon;

  const handleShare = () => {
    const url = `${window.location.origin}/trips/${trip.id}/itinerary`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/trips/${trip.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok || res.status === 204) {
        onDelete(trip.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  return (
    <article
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden group flex flex-col relative"
    >
      {/* Cover image */}
      <div className="relative h-44 bg-gradient-to-br from-teal-100 to-sky-100 overflow-hidden shrink-0">
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={`Cover for ${trip.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plane className="w-12 h-12 text-teal-200" />
          </div>
        )}

        {/* Status badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>

        {/* Action menu trigger */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors focus:outline-none"
            aria-label="Trip actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-44 overflow-hidden">
                <button
                  onClick={() => { navigate(`/trips/${trip.id}/itinerary`); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-4 h-4 text-slate-400" /> View Itinerary
                </button>
                <button
                  onClick={() => { navigate(`/trips/${trip.id}/plan`); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-slate-400" /> Edit / Plan
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                  {copied ? 'Copied!' : 'Share Link'}
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Trip
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1 line-clamp-1 pr-2">
          {trip.name}
        </h3>

        {trip.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{trip.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-auto mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(trip.start_date)}
            {trip.end_date && ` → ${formatDate(trip.end_date)}`}
          </span>
          {nights && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {nights} nights
            </span>
          )}
        </div>

        {/* Primary CTAs */}
        <div className="flex gap-2">
          {status === 'planning' && (
            <button
              onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
              className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Continue Planning
            </button>
          )}
          {status === 'ongoing' && (
            <button
              onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
              className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Open Itinerary
            </button>
          )}
          {status === 'completed' && (
            <button
              onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
              className="flex-1 text-sm font-semibold py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors focus:outline-none"
            >
              View Itinerary
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

function EmptyState({ tab }) {
  const navigate = useNavigate();
  const messages = {
    planning:  { title: 'No trips in planning', desc: 'Start a new trip and design your perfect itinerary.', cta: 'Create Trip', action: '/trips/create' },
    ongoing:   { title: 'No active trips',       desc: "You don't have any trips happening right now.", cta: null },
    completed: { title: 'No completed trips',    desc: 'Your completed adventures will appear here.',   cta: null },
  };
  const { title, desc, cta, action } = messages[tab] || messages.planning;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
        <Compass className="w-10 h-10 text-teal-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-xs mb-6">{desc}</p>
      {cta && (
        <button
          onClick={() => navigate(action)}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <Plus className="w-4 h-4" /> {cta}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, count, color }) {
  return (
    <div className={`flex items-center gap-3 pb-4 border-b border-slate-100 mb-6`}>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 leading-none">{label}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{count} trip{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const TABS = [
  { id: 'all',       label: 'All Trips' },
  { id: 'planning',  label: 'Planning' },
  { id: 'ongoing',   label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
];

export default function MyTrip() {
  const navigate = useNavigate();

  const [trips,    setTrips]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState('all');
  const [search,   setSearch]   = useState('');

  // ── Fetch ──────────────────────────────────
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to load trips.');
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // ── Derived data ───────────────────────────
  const withStatus = trips.map(t => ({ ...t, _status: computeStatus(t) }));

  const filtered = withStatus.filter(t => {
    const matchTab    = tab === 'all' || t._status === tab;
    const matchSearch = !search.trim() || t.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const planning  = withStatus.filter(t => t._status === 'planning');
  const ongoing   = withStatus.filter(t => t._status === 'ongoing');
  const completed = withStatus.filter(t => t._status === 'completed');

  const handleDelete = (id) => setTrips(prev => prev.filter(t => t.id !== id));

  // ── Render helpers ─────────────────────────
  const tabCount = (id) => {
    if (id === 'all')       return withStatus.length;
    if (id === 'planning')  return planning.length;
    if (id === 'ongoing')   return ongoing.length;
    if (id === 'completed') return completed.length;
    return 0;
  };

  const renderGrid = (list, tabKey) => {
    if (!list.length) return <EmptyState tab={tabKey} />;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map(trip => (
          <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
        ))}
      </div>
    );
  };

  // ── Loading skeleton ───────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 font-sans">
        <Navbar />
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-56 bg-white rounded-xl" />
            <div className="h-12 bg-white rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-72 bg-white rounded-2xl border border-slate-100 shadow-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 font-sans">
      <Navbar />

      <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Trips</h1>
            <p className="text-slate-500 mt-1">
              {withStatus.length} trips · {ongoing.length} ongoing · {planning.length} in planning
            </p>
          </div>
          <button
            onClick={() => navigate('/trips/create')}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-400 shrink-0"
          >
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
            <button
              onClick={fetchTrips}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Search + Tabs bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400 w-4 h-4" />
            <input
              type="search"
              placeholder="Search trips…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-slate-50 outline-none text-sm text-slate-800 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => {
              const count = tabCount(t.id);
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all focus:outline-none ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: "All" tab shows three sections; individual tabs show flat grid */}
        {tab === 'all' ? (
          <div className="space-y-12">
            {/* Ongoing */}
            <section aria-labelledby="ongoing-heading">
              <SectionHeader icon={Zap} label="Ongoing Trips" count={ongoing.length} color="bg-orange-500" />
              {ongoing.length === 0
                ? <p className="text-sm text-slate-400 italic mb-6">No trips in progress right now.</p>
                : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                    {ongoing.map(trip => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />)}
                  </div>
              }
            </section>

            {/* Planning */}
            <section aria-labelledby="planning-heading">
              <SectionHeader icon={BookOpen} label="Planning" count={planning.length} color="bg-teal-600" />
              {planning.length === 0
                ? <p className="text-sm text-slate-400 italic mb-6">Nothing in the works. <button onClick={() => navigate('/trips/create')} className="text-teal-600 underline">Create a trip</button></p>
                : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                    {planning.map(trip => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />)}
                  </div>
              }
            </section>

            {/* Completed */}
            <section aria-labelledby="completed-heading">
              <SectionHeader icon={CheckCircle} label="Completed" count={completed.length} color="bg-slate-400" />
              {completed.length === 0
                ? <p className="text-sm text-slate-400 italic">No completed trips yet.</p>
                : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {completed.map(trip => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />)}
                  </div>
              }
            </section>
          </div>
        ) : (
          /* Single filtered tab */
          <div>
            {search && filtered.length > 0 && (
              <p className="text-sm text-slate-500 mb-4">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
              </p>
            )}
            {renderGrid(filtered, tab)}
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOCAL NAVBAR (same pattern as Dashboard)
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
            { label: 'Budget',      to: '/trips/budget' },
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
