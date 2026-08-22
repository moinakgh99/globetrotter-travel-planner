import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Heart,
  Plus,
  Check,
  Star,
  Clock,
  MapPin,
  ChevronDown,
  Grid3X3,
  List,
  DollarSign,
  Filter,
} from "lucide-react";
import MapBackground from "../../components/MapBackground";

const ACTIVITIES = [
  {
    id: 1,
    name: "Sunset Paragliding over the Vosges",
    location: "Alsace, France",
    category: "Adventure",
    duration: "3h",
    cost: "€180",
    rating: 4.9,
    reviews: 312,
    description:
      "Soar above ancient vineyards and medieval villages as the sun dips behind the Vosges mountains. Tandem flight with certified instructors.",
    difficulty: "Moderate",
    outdoor: true,
    image:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop&auto=format",
    tags: ["Outdoor", "Scenic"],
    coords: "48.1°N 7.2°E",
  },
  {
    id: 2,
    name: "Private Canal Boat through Amsterdam",
    location: "Amsterdam, Netherlands",
    category: "Cultural",
    duration: "2h",
    cost: "€95",
    rating: 4.8,
    reviews: 847,
    description:
      "Navigate the UNESCO-listed canal ring at golden hour aboard a restored wooden sloop. Includes chilled Dutch beer and local cheese.",
    difficulty: "Easy",
    outdoor: true,
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop&auto=format",
    tags: ["Scenic", "Historic"],
    coords: "52.3°N 4.9°E",
  },
  {
    id: 3,
    name: "Atelier de Cuisine — Marché Bastille",
    location: "Paris 11e, France",
    category: "Culinary",
    duration: "4h",
    cost: "€145",
    rating: 4.7,
    reviews: 521,
    description:
      "Shop the Saturday market with a chef, then cook three courses in a Haussmann-era kitchen. Limited to 8 guests.",
    difficulty: "Easy",
    outdoor: false,
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop&auto=format",
    tags: ["Indoor", "Food"],
    coords: "48.85°N 2.37°E",
  },
  {
    id: 4,
    name: "Dawn Kayak — Danish Archipelago",
    location: "South Funen, Denmark",
    category: "Adventure",
    duration: "5h",
    cost: "€120",
    rating: 4.9,
    reviews: 189,
    description:
      "Paddle through mist-covered channels between uninhabited islands at first light. Pack provided; sea kayaking experience helpful.",
    difficulty: "Challenging",
    outdoor: true,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format",
    tags: ["Outdoor", "Nature"],
    coords: "55.0°N 10.5°E",
  },
  {
    id: 5,
    name: "Rijksmuseum After-Hours Tour",
    location: "Amsterdam, Netherlands",
    category: "Cultural",
    duration: "2.5h",
    cost: "€75",
    rating: 4.8,
    reviews: 634,
    description:
      "Exclusive evening access to the Dutch Golden Age collection with an art historian. Rembrandt's Night Watch without the crowds.",
    difficulty: "Easy",
    outdoor: false,
    image:
      "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=600&fit=crop&auto=format",
    tags: ["Indoor", "Art"],
    coords: "52.36°N 4.88°E",
  },
  {
    id: 6,
    name: "Vintage Wine Tasting — Burgundy Caves",
    location: "Beaune, France",
    category: "Culinary",
    duration: "3h",
    cost: "€165",
    rating: 4.6,
    reviews: 278,
    description:
      "Descend into 12th-century cellars beneath the Hôtel-Dieu for a vertically-curated tasting of premier cru Burgundy.",
    difficulty: "Easy",
    outdoor: false,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop&auto=format",
    tags: ["Indoor", "Wine"],
    coords: "47.02°N 4.84°E",
  },
];

const CATEGORIES = [
  "All",
  "Adventure",
  "Cultural",
  "Culinary",
  "Nature",
  "Wellness",
];
const SORT_OPTIONS = [
  "Recommended",
  "Rating",
  "Price: Low",
  "Price: High",
  "Duration",
];

export default function ActivitySearch() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const filtered = ACTIVITIES.filter((a) => {
    const matchesQuery =
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.location.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase());

    const matchesCat =
      selectedCategory === "All" || a.category === selectedCategory;

    const matchesQuickFilter =
      !quickFilter ||
      (quickFilter === "Outdoor" && a.outdoor) ||
      (quickFilter === "Indoor" && !a.outdoor) ||
      (quickFilter === "Under 2h" &&
        parseFloat(a.duration.replace("h", "")) < 2) ||
      (quickFilter === "Under €100" &&
        parseFloat(a.cost.replace("€", "")) < 100) ||
      (quickFilter === "Family" &&
        a.tags.some((tag) => tag.toLowerCase() === "family")) ||
      (quickFilter === "Solo" &&
        a.tags.some((tag) => tag.toLowerCase() === "solo"));

    return matchesQuery && matchesCat && matchesQuickFilter;
  }).sort((a, b) => {
    const priceA = parseFloat(a.cost.replace("€", ""));
    const priceB = parseFloat(b.cost.replace("€", ""));

    const durationA = parseFloat(a.duration.replace("h", ""));
    const durationB = parseFloat(b.duration.replace("h", ""));

    switch (sortBy) {
      case "Rating":
        return b.rating - a.rating;

      case "Price: Low":
        return priceA - priceB;

      case "Price: High":
        return priceB - priceA;

      case "Duration":
        return durationA - durationB;

      case "Recommended":
      default:
        return b.rating - a.rating;
    }
  });

  function handleAdd(id: number) {
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleFav(id: number) {
    setFavIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="relative min-h-screen">
      <MapBackground />

      <div className="relative z-10 pt-14 pb-20 md:pb-8">
        {/* Page header */}
        <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-8">
          <div
            className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="font-mono text-[#c4714a]/70 text-xs tracking-widest uppercase mb-3">
              Discover
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#f5f0e8] font-light leading-tight mb-3">
              Find something
              <br />
              <em>worth doing.</em>
            </h1>
            <p className="text-[#f5f0e8]/50 text-base max-w-md">
              Discover experiences that fit your route, pace and budget.
            </p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex gap-6 lg:gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Search + filters row */}
              <div
                className={`flex flex-col sm:flex-row gap-3 mb-6 transition-all duration-700 delay-75 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                {/* Search */}
                <div className="relative flex-1 group">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f5f0e8]/30 group-focus-within:text-[#c4714a]/70 transition-colors"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search activities, destinations, experiences..."
                    className="w-full pl-10 pr-10 py-3 bg-white/[0.04] border border-white/[0.08] rounded text-[#f5f0e8] placeholder-[#f5f0e8]/25 text-sm focus:outline-none focus:border-[#c4714a]/40 focus:bg-white/[0.06] transition-all"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded text-sm font-medium transition-all ${showFilters ? "border-[#c4714a]/50 text-[#c4714a] bg-[#c4714a]/10" : "border-white/[0.08] text-[#f5f0e8]/60 bg-white/[0.03] hover:border-white/20 hover:text-[#f5f0e8]/80"}`}
                >
                  <SlidersHorizontal size={15} />
                  <span>Filters</span>
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="appearance-none pl-3 pr-8 py-3 bg-white/[0.03] border border-white/[0.08] rounded text-[#f5f0e8]/60 text-sm focus:outline-none focus:border-white/20 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#f5f0e8]/30 pointer-events-none"
                  />
                </div>

                {/* View toggle */}
                <div className="hidden sm:flex items-center border border-white/[0.08] rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-colors ${viewMode === "grid" ? "bg-white/[0.08] text-[#f5f0e8]" : "text-[#f5f0e8]/40 hover:text-[#f5f0e8]/60"}`}
                  >
                    <Grid3X3 size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-colors ${viewMode === "list" ? "bg-white/[0.08] text-[#f5f0e8]" : "text-[#f5f0e8]/40 hover:text-[#f5f0e8]/60"}`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>

              {/* Expandable filter panel */}
              {showFilters && (
                <div className="mb-6 p-4 bg-white/[0.03] border border-white/[0.08] rounded animate-fade-in">
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <p className="text-[#f5f0e8]/40 text-xs font-mono uppercase tracking-wider mb-2">
                        Category
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-xs rounded border transition-all ${selectedCategory === cat ? "border-[#c4714a]/60 text-[#c4714a] bg-[#c4714a]/10" : "border-white/[0.08] text-[#f5f0e8]/50 hover:border-white/20"}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="ml-auto flex items-end">
                      <button
                        onClick={() => {
                          setSelectedCategory("All");
                          setQuery("");
                        }}
                        className="text-xs text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full border transition-all ${selectedCategory === cat ? "border-[#c4714a]/60 text-[#c4714a] bg-[#c4714a]/10" : "border-white/[0.06] text-[#f5f0e8]/40 hover:border-white/15 hover:text-[#f5f0e8]/70"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#f5f0e8]/40 text-sm">
                  <span className="text-[#f5f0e8]/70 font-medium">
                    {filtered.length}
                  </span>{" "}
                  experiences
                  {selectedCategory !== "All" && (
                    <span>
                      {" "}
                      in{" "}
                      <span className="text-[#c4714a]">{selectedCategory}</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Results grid */}
              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <Search
                    size={32}
                    className="text-[#f5f0e8]/20 mx-auto mb-4"
                  />
                  <p className="text-[#f5f0e8]/40 text-sm">
                    No experiences found for "{query}"
                  </p>
                  <button
                    onClick={() => setQuery("")}
                    className="mt-3 text-[#c4714a] text-sm hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                      : "flex flex-col gap-3"
                  }
                >
                  {filtered.map((activity, i) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      index={i}
                      added={addedIds.has(activity.id)}
                      faved={favIds.has(activity.id)}
                      onAdd={() => handleAdd(activity.id)}
                      onFav={() => handleFav(activity.id)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Trip context panel — desktop sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <TripContextPanel
                addedCount={addedIds.size}
                quickFilter={quickFilter}
                setQuickFilter={setQuickFilter}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  index,
  added,
  faved,
  onAdd,
  onFav,
  viewMode,
}: {
  activity: (typeof ACTIVITIES)[0];
  index: number;
  added: boolean;
  faved: boolean;
  onAdd: () => void;
  onFav: () => void;
  viewMode: "grid" | "list";
}) {
  const delay = index * 75;

  if (viewMode === "list") {
    return (
      <div
        className="group flex gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 animate-card-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="img-zoom w-24 h-20 rounded flex-shrink-0 bg-[#112236]">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] text-[#c4714a]/70 uppercase tracking-wider mb-0.5">
                {activity.category}
              </p>
              <h3 className="text-[#f5f0e8] font-medium text-sm leading-snug">
                {activity.name}
              </h3>
            </div>
            <button onClick={onFav} className="flex-shrink-0 mt-0.5">
              <Heart
                size={14}
                className={
                  faved
                    ? "fill-[#c4714a] text-[#c4714a]"
                    : "text-[#f5f0e8]/20 hover:text-[#c4714a]/60"
                }
              />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#f5f0e8]/40">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {activity.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {activity.duration}
            </span>
            <span className="font-medium text-[#f5f0e8]/60">
              {activity.cost}
            </span>
          </div>
        </div>
        <button
          onClick={onAdd}
          className={`flex-shrink-0 self-center flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-all duration-300 ${added ? "bg-[#7a9e7e]/20 text-[#7a9e7e] border border-[#7a9e7e]/30" : "bg-[#c4714a]/10 text-[#c4714a] border border-[#c4714a]/20 hover:bg-[#c4714a]/20"}`}
        >
          {added ? <Check size={12} /> : <Plus size={12} />}
          {added ? "Added" : "Add"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col bg-white/[0.03] border border-white/[0.06] rounded overflow-hidden hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-2xl transition-all duration-400 animate-card-in"
      style={{ animationDelay: `${delay}ms`, transitionDuration: "350ms" }}
    >
      {/* Image */}
      <div className="img-zoom relative h-48 bg-[#112236] flex-shrink-0">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/80 via-transparent to-transparent" />

        {/* Favorite */}
        <button
          onClick={onFav}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
          aria-label="Favorite"
        >
          <Heart
            size={13}
            className={
              faved ? "fill-[#c4714a] text-[#c4714a]" : "text-white/60"
            }
          />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-black/40 backdrop-blur-sm text-[#c4714a]/90 rounded">
            {activity.category}
          </span>
        </div>

        {/* Coordinates — revealed on hover */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-mono text-[9px] text-white/50">
            {activity.coords}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-serif text-[#f5f0e8] text-base font-light leading-snug mb-1.5">
          {activity.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={11} className="text-[#f5f0e8]/30" />
          <span className="text-[#f5f0e8]/40 text-xs">{activity.location}</span>
        </div>

        <p className="text-[#f5f0e8]/40 text-xs leading-relaxed mb-4 line-clamp-2 group-hover:text-[#f5f0e8]/60 transition-colors">
          {activity.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          <span className="flex items-center gap-1 text-[#f5f0e8]/50">
            <Clock size={11} />
            {activity.duration}
          </span>
          <span className="flex items-center gap-1 text-[#f5f0e8]/50">
            <DollarSign size={11} />
            {activity.cost}
          </span>
          <span className="flex items-center gap-1 text-[#f5f0e8]/60 ml-auto">
            <Star size={11} className="fill-[#c4714a] text-[#c4714a]" />
            {activity.rating}
            <span className="text-[#f5f0e8]/30">({activity.reviews})</span>
          </span>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
              activity.difficulty === "Easy"
                ? "border-[#7a9e7e]/30 text-[#7a9e7e]"
                : activity.difficulty === "Moderate"
                  ? "border-[#6b8fa8]/30 text-[#6b8fa8]"
                  : "border-[#c4714a]/30 text-[#c4714a]"
            }`}
          >
            {activity.difficulty}
          </span>
          {activity.outdoor && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-white/[0.08] text-[#f5f0e8]/30">
              Outdoor
            </span>
          )}
        </div>

        {/* Add to trip */}
        <button
          onClick={onAdd}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all duration-300 ${
            added
              ? "bg-[#7a9e7e]/15 text-[#7a9e7e] border border-[#7a9e7e]/25"
              : "bg-white/[0.04] text-[#f5f0e8]/60 border border-white/[0.08] hover:bg-[#c4714a]/15 hover:text-[#c4714a] hover:border-[#c4714a]/30 group-hover:bg-[#c4714a]/10 group-hover:text-[#c4714a] group-hover:border-[#c4714a]/20"
          }`}
        >
          {added ? (
            <>
              <Check size={14} /> Added to Trip
            </>
          ) : (
            <>
              <Plus size={14} /> Add to Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function TripContextPanel({
  addedCount,
  quickFilter,
  setQuickFilter,
}: {
  addedCount: number;
  quickFilter: string | null;
  setQuickFilter: Dispatch<SetStateAction<string | null>>;
}) {
  const totalActivities = 3 + addedCount;
  const budget = 1200;
  const spent = 420 + addedCount * 95;
  const pct = Math.min(Math.round((spent / budget) * 100), 100);

  return (
    <div className="sticky top-20 space-y-3">
      {/* Trip context */}
      <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-serif text-[#f5f0e8] text-lg font-light">
              Paris
            </p>
            <p className="font-mono text-xs text-[#c4714a]/70 mt-0.5">
              Day 03 · 14 March
            </p>
          </div>

          <div className="w-8 h-8 rounded-full border border-[#c4714a]/30 flex items-center justify-center">
            <MapPin size={13} className="text-[#c4714a]" />
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#f5f0e8]/40">
              Activities planned
            </span>
            <span className="font-mono text-sm text-[#f5f0e8]/70">
              {totalActivities}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-[#f5f0e8]/40">Budget remaining</span>
            <span className="font-mono text-sm text-[#7a9e7e]">
              €{budget - spent}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#f5f0e8]/40">Budget used</span>
              <span className="font-mono text-[#f5f0e8]/50">{pct}%</span>
            </div>

            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c4714a] rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Route overview — mini map */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-4">
          Route
        </p>

        <svg viewBox="0 0 200 280" className="w-full opacity-80">
          {/* Route line */}
          <line
            x1="100"
            y1="40"
            x2="100"
            y2="240"
            stroke="#c4714a"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.3"
          />

          {/* City markers */}
          {[
            { y: 40, label: "Paris", active: true },
            { y: 130, label: "Amsterdam", active: false },
            { y: 220, label: "Copenhagen", active: false },
          ].map(({ y, label, active }) => (
            <g key={label}>
              <circle
                cx="100"
                cy={y}
                r={active ? 6 : 4}
                fill={active ? "#c4714a" : "#f5f0e8"}
                opacity={active ? 1 : 0.3}
              />

              {active && (
                <circle
                  cx="100"
                  cy={y}
                  r="10"
                  fill="none"
                  stroke="#c4714a"
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-float"
                />
              )}

              <text
                x="115"
                y={y + 4}
                fill="#f5f0e8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                opacity={active ? 0.8 : 0.35}
              >
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Quick filters */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-3">
          Quick filters
        </p>

        <div className="flex flex-wrap gap-1.5">
          {[
            "Outdoor",
            "Indoor",
            "Family",
            "Solo",
            "Under 2h",
            "Under €100",
          ].map((f) => (
            <button
              key={f}
              onClick={() =>
                setQuickFilter((current) => (current === f ? null : f))
              }
              className={`text-[10px] px-2.5 py-1 border rounded transition-all ${
                quickFilter === f
                  ? "border-[#c4714a]/50 text-[#c4714a] bg-[#c4714a]/10"
                  : "border-white/[0.06] text-[#f5f0e8]/40 hover:border-white/15 hover:text-[#f5f0e8]/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
