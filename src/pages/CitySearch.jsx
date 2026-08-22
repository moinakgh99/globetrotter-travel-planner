import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Compass, Search, Filter, Layers, Plus, Check, MapPin, DollarSign, Star, Tag, ChevronDown, ChevronRight, X, AlertCircle } from "lucide-react";
import AppHeader from "../components/AppHeader";
import Toolbar from "../components/Toolbar";
import api from "../lib/api";

const CitySearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCostIndex, setSelectedCostIndex] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [groupBy, setGroupBy] = useState("none"); // "none" | "region"

  const [cities, setCities] = useState([]);
  const [regionsList, setRegionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded detail panel state
  const [expandedCityId, setExpandedCityId] = useState(null);

  // Add to Trip Modal state
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [newTripName, setNewTripName] = useState("");
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [attachStatus, setAttachStatus] = useState({ loading: false, success: false, error: "" });

  // Debounce search query (~300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSearchParams({ q: searchQuery }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, setSearchParams]);

  // Fetch distinct regions on load
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await api.get("/api/cities/regions");
        setRegionsList(res.data || []);
      } catch (err) {
        console.error("Error fetching regions:", err);
      }
    };
    fetchRegions();
  }, []);

  // Fetch cities based on debounced search, region, cost_index, and sort
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedQuery) params.append("q", debouncedQuery);
        if (selectedRegion) params.append("region", selectedRegion);
        if (selectedCostIndex) params.append("cost_index", selectedCostIndex);
        if (sortBy) params.append("sort", sortBy);

        const res = await api.get(`/api/cities?${params.toString()}`);
        setCities(res.data || []);
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [debouncedQuery, selectedRegion, selectedCostIndex, sortBy]);

  // Fetch user trips when modal is opened
  const openAddToTripModal = async (city) => {
    setSelectedCityForTrip(city);
    setAttachStatus({ loading: false, success: false, error: "" });
    try {
      setLoadingTrips(true);
      const res = await api.get("/api/trips");
      const tripsData = res.data || [];
      setUserTrips(tripsData);
      if (tripsData.length > 0) {
        setSelectedTripId(String(tripsData[0].id));
      }
    } catch (err) {
      console.error("Error loading user trips:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  // Attach city to selected trip using POST /api/trips/:tripId/cities
  const handleAttachCity = async () => {
    if (!selectedCityForTrip) return;

    setAttachStatus({ loading: true, success: false, error: "" });

    try {
      let targetTripId = selectedTripId;

      // If creating a new trip inline first
      if (isCreatingTrip || !targetTripId) {
        if (!newTripName.trim()) {
          setAttachStatus({ loading: false, success: false, error: "Please enter a trip name" });
          return;
        }
        const createRes = await api.post("/api/trips", {
          name: newTripName.trim(),
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        });
        targetTripId = createRes.data.id;
      }

      await api.post(`/api/trips/${targetTripId}/cities`, {
        city_id: selectedCityForTrip.id,
      });

      setAttachStatus({ loading: false, success: true, error: "" });
      setTimeout(() => {
        setSelectedCityForTrip(null);
        setIsCreatingTrip(false);
        setNewTripName("");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to attach city to trip.";
      setAttachStatus({ loading: false, success: false, error: msg });
    }
  };

  // Group cities by region if groupBy === "region"
  const groupedCities = React.useMemo(() => {
    if (groupBy !== "region") return null;
    const map = {};
    cities.forEach((city) => {
      const reg = city.region || "Other Regions";
      if (!map[reg]) map[reg] = [];
      map[reg].push(city);
    });
    return map;
  }, [cities, groupBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Shared Header */}
      <AppHeader />

      {/* Page Title & Search Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-sky-400" />
              <span>Activity & City Search Page</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Search by city name or activity tags (e.g. Paragliding, Surfing, Hiking, Temples)
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
            Showing <strong className="text-sky-400 font-bold">{cities.length}</strong> matching options
          </div>
        </div>
      </div>

      {/* Shared Toolbar */}
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

      {/* Main Results Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4 flex items-center justify-between" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No results match your search</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
                Try searching for keywords like "Paragliding", "Beach", "Hiking", or reset your region and cost filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("");
                setSelectedCostIndex("");
                setSortBy("popularity");
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : groupBy === "region" && groupedCities ? (
          /* Grouped by Region View (Collapsible Accordions) */
          <div className="space-y-8">
            {Object.entries(groupedCities).map(([regName, regCities]) => (
              <div key={regName} className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-400" />
                    <span>{regName}</span>
                    <span className="text-xs text-slate-400 font-normal ml-2">({regCities.length} destinations)</span>
                  </h2>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {regCities.map((city) => (
                    <CityRow
                      key={city.id}
                      city={city}
                      isExpanded={expandedCityId === city.id}
                      onToggleExpand={() => setExpandedCityId(expandedCityId === city.id ? null : city.id)}
                      onAddToTrip={() => openAddToTripModal(city)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Standard Vertical List View */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/80 shadow-xl">
            {cities.map((city) => (
              <CityRow
                key={city.id}
                city={city}
                isExpanded={expandedCityId === city.id}
                onToggleExpand={() => setExpandedCityId(expandedCityId === city.id ? null : city.id)}
                onAddToTrip={() => openAddToTripModal(city)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add to Trip Action Modal */}
      {selectedCityForTrip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-sky-400" />
                  <span>Add to Trip</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Attach <strong className="text-white">{selectedCityForTrip.name}</strong> to an itinerary
                </p>
              </div>
              <button
                onClick={() => setSelectedCityForTrip(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Messages */}
            {attachStatus.error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{attachStatus.error}</span>
              </div>
            )}

            {attachStatus.success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>Successfully added to trip!</span>
              </div>
            )}

            {/* Trip Selector Form */}
            {!attachStatus.success && (
              <div className="space-y-4">
                {loadingTrips ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading your trips...</div>
                ) : userTrips.length === 0 || isCreatingTrip ? (
                  /* Create New Trip inline */
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Create New Trip Name
                    </label>
                    <input
                      type="text"
                      value={newTripName}
                      onChange={(e) => setNewTripName(e.target.value)}
                      placeholder="e.g. Europe Summer Adventure 2026"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {userTrips.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingTrip(false)}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        ← Select existing trip instead
                      </button>
                    )}
                  </div>
                ) : (
                  /* Select Existing Trip */
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Select Target Trip
                    </label>
                    <select
                      id="select-target-trip"
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {userTrips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.start_date ? new Date(t.start_date).toLocaleDateString() : "Draft"})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsCreatingTrip(true)}
                      className="text-xs text-sky-400 hover:underline font-medium block"
                    >
                      + Create a new trip instead
                    </button>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedCityForTrip(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAttachCity}
                    disabled={attachStatus.loading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {attachStatus.loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Confirm Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Row Component for each city item in results list
const CityRow = ({ city, isExpanded, onToggleExpand, onAddToTrip }) => {
  return (
    <div className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Thumbnail + Option Details */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={onToggleExpand}>
          <img
            src={city.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"}
            alt={city.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-800 shrink-0"
          />

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-white hover:text-sky-400 transition-colors">
                {city.name}
              </h3>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-sky-400 uppercase tracking-wider border border-slate-700">
                {city.region}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>{city.country}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                Cost Index: {"$".repeat(city.cost_index || 3)}
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 inline" />
                {city.popularity}
              </span>
            </p>

            {/* Activity Tags Pills */}
            {city.tags && city.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {city.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 text-[11px] border border-slate-700/60 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-sky-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={onAddToTrip}
            className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Trip</span>
          </button>

          <button
            onClick={onToggleExpand}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand Details"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5 text-sky-400" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Detail Panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 pl-2 sm:pl-24 pr-4 space-y-3 animate-in fade-in duration-200">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
              Destination Information & Highlights
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore {city.name}, situated in {city.country} ({city.region}). Renowned for popular activities including {city.tags ? city.tags.join(", ") : "sightseeing and local culture"}. Cost index rating is {city.cost_index}/5 with a popularity rating of {city.popularity}/100.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
