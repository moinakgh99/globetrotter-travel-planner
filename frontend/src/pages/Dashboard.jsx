import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus, MapPin, Calendar, ArrowRight, Compass,
  TrendingUp, Wallet, Globe, Clock, ChevronRight,
  Plane, Star, Loader2
} from 'lucide-react';

// ─────────────────────────────────────────────
// MOCK DATA  — replace with API calls later
// GET /api/trips, GET /api/destinations, GET /api/budget
// ─────────────────────────────────────────────

const MOCK_USER = {
  first_name: 'Kaushal',
  name: 'Kaushal Sharma',
};

const MOCK_TRIPS = [
  {
    id: 1,
    name: 'Rajasthan Heritage Trail',
    description: 'Exploring majestic forts, vibrant markets, and desert sunsets.',
    start_date: '2026-10-10',
    end_date: '2026-10-17',
    status: 'upcoming',
    cover_photo_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80',
    destinations: ['Jaipur', 'Jodhpur', 'Udaipur'],
  },
  {
    id: 2,
    name: 'Goa Beach Escape',
    description: 'Sun, sand, and seafood along the Goan coastline.',
    start_date: '2026-12-20',
    end_date: '2026-12-27',
    status: 'planned',
    cover_photo_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    destinations: ['Goa'],
  },
  {
    id: 3,
    name: 'Himalayan Trek',
    description: 'A challenging yet breathtaking high-altitude adventure.',
    start_date: '2026-06-01',
    end_date: '2026-06-08',
    status: 'completed',
    cover_photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    destinations: ['Manali', 'Spiti'],
  },
];

const MOCK_DESTINATIONS = [
  {
    id: 1,
    city: 'Santorini',
    country: 'Greece',
    description: 'Iconic white-washed villages, deep blue caldera views, and stunning sunsets.',
    estimated_budget: '$1,200',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
    tags: ['Beach', 'Romance', 'Culture'],
  },
  {
    id: 2,
    city: 'Kyoto',
    country: 'Japan',
    description: 'Ancient temples, geisha districts, and cherry blossoms in every season.',
    estimated_budget: '$1,500',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
    tags: ['Culture', 'Temples', 'Scenic'],
  },
  {
    id: 3,
    city: 'Bali',
    country: 'Indonesia',
    description: 'Terraced rice fields, spiritual retreats, and world-class surf breaks.',
    estimated_budget: '$800',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    tags: ['Adventure', 'Wellness', 'Beach'],
  },
  {
    id: 4,
    city: 'Patagonia',
    country: 'Argentina',
    description: 'Pristine glaciers, dramatic peaks, and untouched wilderness at the end of the world.',
    estimated_budget: '$2,000',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
    tags: ['Adventure', 'Nature', 'Hiking'],
  },
];

const MOCK_BUDGET = {
  total_planned: 180000,
  total_spent: 72000,
  currency: 'INR',
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  planned:  { label: 'Planned',  bg: 'bg-sky-50',  text: 'text-sky-700',  dot: 'bg-sky-500' },
  completed:{ label: 'Completed',bg: 'bg-slate-100',text: 'text-slate-600',dot: 'bg-slate-400' },
  ongoing:  { label: 'Ongoing',  bg: 'bg-orange-50',text: 'text-orange-700',dot: 'bg-orange-500' },
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Navbar */
function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-teal-600 transition-colors">
            Globe<span className="text-teal-600">Trotter</span>
          </span>
        </button>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Dashboard', to: '/' },
            { label: 'My Trips', to: '/trips' },
            { label: 'Create Trip', to: '/trips/create' },
            { label: 'Budget', to: '/trips/budget' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-xl transition-all focus:outline-none"
            >
              Log out
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all focus:outline-none"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function WelcomeSection({ user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.first_name || user?.name?.split(' ')[0] || 'Traveller';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 md:p-10 text-white shadow-xl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/20 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-teal-200 font-medium mb-1 text-sm">{greeting} ✈️</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {name}!
          </h1>
          <p className="text-teal-100 text-base max-w-lg">
            Your next adventure is waiting. Plan a new trip, explore destinations, or pick up where you left off.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <QuickActionButton to="/trips/create" icon={<Plus className="w-4 h-4" />} label="New Trip" primary />
          <QuickActionButton to="/trips" icon={<Compass className="w-4 h-4" />} label="My Trips" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ to, icon, label, primary }) {
  const navigate = useNavigate();
  const base = "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50";
  const style = primary
    ? `${base} bg-white text-teal-700 hover:bg-teal-50 shadow-md`
    : `${base} bg-white/15 text-white hover:bg-white/25 border border-white/20`;

  return (
    <button onClick={() => navigate(to)} className={style}>
      {icon}
      {label}
    </button>
  );
}

/** Quick Actions Strip */
function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: 'Create New Trip', desc: 'Start planning your next adventure', icon: <Plus className="w-6 h-6" />, to: '/trips/create', color: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100' },
    { label: 'Explore Destinations', desc: 'Discover inspiring places', icon: <Globe className="w-6 h-6" />, to: '/cities', color: 'text-sky-600', bg: 'bg-sky-50 hover:bg-sky-100' },
    { label: 'My Trips', desc: 'View and manage your trips', icon: <Compass className="w-6 h-6" />, to: '/trips', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
    { label: 'Trip Budget', desc: 'Track your travel spending', icon: <Wallet className="w-6 h-6" />, to: '/trips/budget', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
  ];

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className={`flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white ${a.bg} group transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-left focus:outline-none focus:ring-2 focus:ring-teal-400`}
          >
            <span className={`p-2 rounded-lg ${a.bg} ${a.color}`}>{a.icon}</span>
            <div>
              <p className={`font-semibold text-sm ${a.color}`}>{a.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/** TripCard */
function TripCard({ trip }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[trip.status] || STATUS_CONFIG.planned;
  const nights = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden group flex flex-col">
      {/* Cover image */}
      <div className="relative h-44 bg-gradient-to-br from-teal-100 to-sky-100 overflow-hidden">
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={`Cover photo for ${trip.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plane className="w-12 h-12 text-teal-200" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1 line-clamp-1">{trip.name}</h3>

        {trip.destinations?.length > 0 && (
          <p className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            {trip.destinations.join(' → ')}
          </p>
        )}

        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{trip.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(trip.start_date)}
          </span>
          {nights && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {nights} nights
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
            className="flex-1 text-center text-sm font-semibold py-2 rounded-lg border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            View Itinerary
          </button>
          <button
            onClick={() => navigate(`/trips/${trip.id}/plan`)}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all focus:outline-none"
            title="Continue planning"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/** RecentTrips */
function RecentTrips({ trips, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-7 h-7 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <section aria-labelledby="recent-trips-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="recent-trips-heading" className="text-lg font-bold text-slate-800">Your Trips</h2>
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-1 text-sm text-teal-600 font-semibold hover:underline focus:outline-none"
        >
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {trips.length === 0 ? (
        <EmptyTrips />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
        </div>
      )}
    </section>
  );
}

function EmptyTrips() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
        <Plane className="w-8 h-8 text-teal-400" />
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-1">No trips yet</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs">Create your first trip and start building an unforgettable itinerary.</p>
      <button
        onClick={() => navigate('/trips/create')}
        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        <Plus className="w-4 h-4" /> Create Your First Trip
      </button>
    </div>
  );
}

/** DestinationCard */
function DestinationCard({ dest }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden group">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-sky-100 to-teal-100">
        <img
          src={dest.image}
          alt={`${dest.city}, ${dest.country}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Rating chip */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {dest.rating}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{dest.city}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {dest.country}
            </p>
          </div>
          {dest.estimated_budget && (
            <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2 py-1 rounded-lg shrink-0">
              ~{dest.estimated_budget}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-500 mt-2 mb-3 line-clamp-2">{dest.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {dest.tags?.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>

        <button className="w-full text-sm font-semibold text-teal-600 hover:text-teal-700 border-2 border-teal-100 hover:border-teal-300 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-400">
          Explore →
        </button>
      </div>
    </article>
  );
}

/** PopularDestinations */
function PopularDestinations({ destinations }) {
  return (
    <section aria-labelledby="destinations-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="destinations-heading" className="text-lg font-bold text-slate-800">Popular Destinations</h2>
        <button className="flex items-center gap-1 text-sm text-teal-600 font-semibold hover:underline focus:outline-none">
          Explore all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {destinations.map(dest => <DestinationCard key={dest.id} dest={dest} />)}
      </div>
    </section>
  );
}

/** BudgetSummary */
function BudgetSummary({ budget }) {
  const { total_planned, total_spent, currency } = budget;
  const remaining = total_planned - total_spent;
  const pct = Math.min(Math.round((total_spent / total_planned) * 100), 100);
  const isOverBudget = total_spent > total_planned;

  const fmt = (n) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0
  }).format(n);

  const barColor = pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-orange-400' : 'bg-teal-500';

  return (
    <section aria-labelledby="budget-heading">
      <h2 id="budget-heading" className="text-lg font-bold text-slate-800 mb-4">Budget Overview</h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-0.5">Total Budget</p>
            <p className="text-3xl font-extrabold text-slate-900">{fmt(total_planned)}</p>
          </div>
          <div className="flex gap-4 sm:gap-8">
            <div>
              <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" /> Spent
              </p>
              <p className="text-lg font-bold text-orange-500">{fmt(total_spent)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-teal-500" /> Remaining
              </p>
              <p className={`text-lg font-bold ${isOverBudget ? 'text-red-500' : 'text-teal-600'}`}>
                {fmt(remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{pct}% spent</span>
            <span>{100 - pct}% remaining</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct}% of budget spent`}
            />
          </div>
          {isOverBudget && (
            <p className="text-xs text-red-500 font-semibold mt-2">
              ⚠ You've exceeded your planned budget.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** Stat pill for the top summary bar */
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 text-teal-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-teal-600 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API calls:
    // fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    // fetch(`${import.meta.env.VITE_API_URL}/api/destinations`)
    // fetch(`${import.meta.env.VITE_API_URL}/api/budget`)
    const timer = setTimeout(() => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : MOCK_USER);
      setTrips(MOCK_TRIPS);
      setDestinations(MOCK_DESTINATIONS);
      setBudget(MOCK_BUDGET);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const upcomingTrips = trips.filter(t => t.status === 'upcoming' || t.status === 'planned');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 font-sans">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Full-width content — no side margins, padding applied inside */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-10">

        {/* Welcome */}
        {loading ? (
          <div className="h-44 bg-white/60 rounded-2xl animate-pulse" />
        ) : (
          <WelcomeSection user={user} />
        )}

        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Compass className="w-5 h-5" />}
              label="Total Trips"
              value={trips.length}
            />
            <StatCard
              icon={<Plane className="w-5 h-5" />}
              label="Upcoming"
              value={upcomingTrips.length}
              sub={upcomingTrips[0] ? `Next: ${upcomingTrips[0].name}` : ''}
            />
            <StatCard
              icon={<MapPin className="w-5 h-5" />}
              label="Completed"
              value={completedTrips.length}
            />
            <StatCard
              icon={<Wallet className="w-5 h-5" />}
              label="Budget Used"
              value={budget ? `${Math.round((budget.total_spent / budget.total_planned) * 100)}%` : '–'}
              sub="of total planned"
            />
          </div>
        )}

        {/* Quick actions */}
        <QuickActions />

        {/* Recent trips */}
        <RecentTrips trips={trips} loading={loading} />

        {/* Budget summary */}
        {!loading && budget && <BudgetSummary budget={budget} />}

        {/* Popular destinations */}
        {!loading && <PopularDestinations destinations={destinations} />}

      </div>
    </div>
  );
}
