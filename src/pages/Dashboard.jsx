import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, MapPin, Calendar, Compass, ArrowRight, DollarSign, Star, Sparkles, FolderPlus } from "lucide-react";
import heroImg from "../assets/hero.png";
import AppHeader from "../components/AppHeader";
import Toolbar from "../components/Toolbar";
import api from "../lib/api";

const Dashboard = () => {
  const [topCities, setTopCities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [regionsList, setRegionsList] = useState([]);

  // Toolbar Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCostIndex, setSelectedCostIndex] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [groupBy, setGroupBy] = useState("none");

  const navigate = useNavigate();

  // Fetch top regional selections & regions
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingCities(true);
        const [citiesRes, regionsRes] = await Promise.all([
          api.get("/api/cities?popular=true&limit=5"),
          api.get("/api/cities/regions"),
        ]);
        setTopCities(citiesRes.data || []);
        setRegionsList(regionsRes.data || []);
      } catch (err) {
        console.error("Error loading top cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };

    const fetchTripsData = async () => {
      try {
        setLoadingTrips(true);
        const res = await api.get("/api/trips");
        setTrips(res.data || []);
      } catch (err) {
        console.error("Error loading trips:", err);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchDashboardData();
    fetchTripsData();
  }, []);

  // Filter top regional selections client-side based on toolbar inputs
  const filteredCities = topCities.filter((city) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = city.name.toLowerCase().includes(q);
      const matchCountry = city.country.toLowerCase().includes(q);
      const matchTags = city.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCountry && !matchTags) return false;
    }

    if (selectedRegion && city.region?.toLowerCase() !== selectedRegion.toLowerCase()) {
      return false;
    }

    if (selectedCostIndex && String(city.cost_index) !== String(selectedCostIndex)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "cost_asc") return a.cost_index - b.cost_index;
    if (sortBy === "cost_desc") return b.cost_index - a.cost_index;
    return b.popularity - a.popularity;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Shared Header */}
      <AppHeader />

      {/* Hero Banner Section */}
      <div className="relative w-full h-[340px] sm:h-[400px] lg:h-[450px] bg-slate-900 overflow-hidden">
        <img
          src={heroImg}
          alt="GlobeTrotter Travel Banner"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-City AI Travel Planner</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans leading-tight">
                Explore the World, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-300">
                  Plan Your Next Journey
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Curate itineraries, search top regional destinations, track budgets, and organize multi-city travel seamlessly.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/cities"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse All Cities</span>
                </Link>
                <Link
                  to="/trips/create"
                  className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>Create Itinerary</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Toolbar (Directly under Banner) */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedCostIndex={selectedCostIndex}
        onCostChange={setSelectedCostIndex}
        sortBy={sortBy}
        onSortChange={setSortBy}
        groupBy={groupBy}
        onGroupChange={setGroupBy}
        regionsList={regionsList}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-12">
        {/* Section 1: Top Regional Selections */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-6 h-6 text-sky-400" />
                <span>Top Regional Selections</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Hand-picked trending destinations across global regions
              </p>
            </div>
            <Link
              to="/cities"
              className="text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingCities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4 flex flex-col justify-end">
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <p className="text-slate-400 text-sm">No regional selections match your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredCities.map((city) => (
                <Link
                  key={city.id}
                  to={`/cities?q=${encodeURIComponent(city.name)}`}
                  className="group relative rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-slate-800">
                    <img
                      src={city.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-sky-300 border border-slate-700/60">
                      {city.region || "Global"}
                    </span>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-bold text-amber-400 border border-slate-700/60">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{city.popularity}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-sky-400 transition-colors truncate">
                        {city.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {city.country}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center">
                        Cost: <strong className="text-emerald-400 ml-1">{"$".repeat(city.cost_index || 3)}</strong>
                      </span>
                      <span className="text-sky-400 font-semibold group-hover:underline flex items-center gap-1">
                        Explore
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Previous Trips */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-400" />
                <span>Previous Trips</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Your saved multi-city travel itineraries
              </p>
            </div>

            <Link
              to="/trips"
              className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
            >
              <span>All Trips</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-6" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            /* Empty State when no trips */
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                <FolderPlus className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No trips yet — plan your first one</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
                  Start mapping out your dream destination cities, activities, dates, and budget estimate.
                </p>
              </div>
              <Link
                to="/trips/create"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Trip</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}/view`}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors truncate">
                        {trip.name}
                      </h3>
                      {trip.is_public && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          Public
                        </span>
                      )}
                    </div>
                    {trip.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : "Flexible Dates"}
                      </span>
                    </span>
                    <span className="font-semibold text-sky-400 group-hover:underline flex items-center gap-1">
                      View Itinerary
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Bottom-Right "+ Plan a trip" Button */}
      <Link
        id="floating-plan-trip-btn"
        to="/trips/create"
        className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-2xl shadow-sky-500/40 border border-sky-400/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="w-5 h-5 text-white" />
        <span className="hidden sm:inline font-sans">+ Plan a trip</span>
      </Link>
    </div>
  );
};

export default Dashboard;
