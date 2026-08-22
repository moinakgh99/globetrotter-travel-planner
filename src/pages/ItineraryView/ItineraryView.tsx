import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Edit3,
  Share2,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Check,
  Trash2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plane,
  Train,
  Utensils,
  Bed,
  Coffee,
  Activity,
} from "lucide-react";
import MapBackground from "../../components/MapBackground";

const DAYS = [
  { id: 1, city: "Paris", date: "Mar 12", label: "01" },
  { id: 2, city: "Paris", date: "Mar 13", label: "02" },
  { id: 3, city: "Amsterdam", date: "Mar 14", label: "03" },
  { id: 4, city: "Amsterdam", date: "Mar 15", label: "04" },
  { id: 5, city: "Copenhagen", date: "Mar 16", label: "05" },
  { id: 6, city: "Copenhagen", date: "Mar 17", label: "06" },
];

type EventType =
  | "transportation"
  | "accommodation"
  | "activity"
  | "meal"
  | "free";

interface ItineraryEvent {
  id: number;
  time: string;
  title: string;
  type: EventType;
  location: string;
  duration: string;
  cost: string;
  notes?: string;
  image?: string;
  completed?: boolean;
}

const DAY_CONTENT: Record<
  number,
  {
    morning: ItineraryEvent[];
    afternoon: ItineraryEvent[];
    evening: ItineraryEvent[];
  }
> = {
  1: {
    morning: [
      {
        id: 101,
        time: "09:00",
        title: "Arrival at Charles de Gaulle",
        type: "transportation",
        location: "CDG Terminal 2E",
        duration: "—",
        cost: "€0",
        notes: "Flight AF2219 from LHR",
      },
      {
        id: 102,
        time: "11:30",
        title: "Check-in — Hôtel du Petit Moulin",
        type: "accommodation",
        location: "Paris 3e",
        duration: "—",
        cost: "€210/night",
        image:
          "https://images.unsplash.com/photo-1551882547-ff40c63fe2fa?w=400&h=300&fit=crop&auto=format",
      },
    ],
    afternoon: [
      {
        id: 103,
        time: "14:00",
        title: "Marais District Walk",
        type: "activity",
        location: "Paris 4e",
        duration: "2h",
        cost: "€0",
        description:
          "Self-guided through the Marais — Place des Vosges, Rue de Bretagne, Musée Picasso exterior.",
      },
      {
        id: 104,
        time: "16:30",
        title: "Coffee at Café de la Paix",
        type: "meal",
        location: "Paris 9e",
        duration: "45m",
        cost: "€18",
      },
    ],
    evening: [
      {
        id: 105,
        time: "20:00",
        title: "Dinner — Septime",
        type: "meal",
        location: "Paris 11e",
        duration: "2.5h",
        cost: "€95",
        notes: "Reservation confirmed. 7-course tasting menu.",
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format",
      },
    ],
  },
  2: {
    morning: [
      {
        id: 201,
        time: "08:30",
        title: "Atelier de Cuisine — Marché Bastille",
        type: "activity",
        location: "Paris 11e",
        duration: "4h",
        cost: "€145",
        image:
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop&auto=format",
      },
    ],
    afternoon: [
      {
        id: 202,
        time: "14:00",
        title: "Musée d'Orsay",
        type: "activity",
        location: "Paris 7e",
        duration: "3h",
        cost: "€16",
      },
      {
        id: 203,
        time: "17:30",
        title: "Seine riverside walk",
        type: "free",
        location: "Quai de la Tournelle",
        duration: "1h",
        cost: "€0",
      },
    ],
    evening: [
      {
        id: 204,
        time: "19:30",
        title: "Natural wine bar — Le Verre Volé",
        type: "meal",
        location: "Paris 10e",
        duration: "2h",
        cost: "€55",
      },
    ],
  },
  3: {
    morning: [
      {
        id: 301,
        time: "07:45",
        title: "Thalys — Paris Nord → Amsterdam",
        type: "transportation",
        location: "Paris Gare du Nord",
        duration: "3h20",
        cost: "€89",
        notes: "Booking ref: TH7823-X",
      },
    ],
    afternoon: [
      {
        id: 302,
        time: "12:30",
        title: "Check-in — Conservatorium Hotel",
        type: "accommodation",
        location: "Amsterdam Museum Quarter",
        duration: "—",
        cost: "€280/night",
        image:
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop&auto=format",
      },
      {
        id: 303,
        time: "14:30",
        title: "Private Canal Boat",
        type: "activity",
        location: "Prinsengracht",
        duration: "2h",
        cost: "€95",
        image:
          "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop&auto=format",
      },
    ],
    evening: [
      {
        id: 304,
        time: "19:00",
        title: "Rijksmuseum After-Hours Tour",
        type: "activity",
        location: "Amsterdam",
        duration: "2.5h",
        cost: "€75",
        image:
          "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop&auto=format",
      },
    ],
  },
};

const TYPE_CONFIG: Record<
  EventType,
  { icon: typeof Plane; color: string; label: string }
> = {
  transportation: { icon: Plane, color: "#6b8fa8", label: "Transport" },
  accommodation: { icon: Bed, color: "#7a9e7e", label: "Stay" },
  activity: { icon: Activity, color: "#c4714a", label: "Activity" },
  meal: { icon: Utensils, color: "#b8a060", label: "Dining" },
  free: { icon: Coffee, color: "#888", label: "Free time" },
};

export default function ItineraryView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "1";
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([101]));
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    setExpandedIds(new Set());
  }, [selectedDay]);

  const dayContent = DAY_CONTENT[selectedDay] || DAY_CONTENT[1];
  const visibleDayContent = {
    morning: (dayContent.morning || []).filter(
      (event) => !removedIds.has(event.id),
    ),
    afternoon: (dayContent.afternoon || []).filter(
      (event) => !removedIds.has(event.id),
    ),
    evening: (dayContent.evening || []).filter(
      (event) => !removedIds.has(event.id),
    ),
  };
  const allEvents = [
    ...visibleDayContent.morning,
    ...visibleDayContent.afternoon,
    ...visibleDayContent.evening,
  ];
  const totalCost = allEvents.reduce((sum, e) => {
    const n = parseFloat(e.cost.replace("€", "").replace("/night", ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleComplete(id: number) {
    setCompletedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function removeEvent(id: number) {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleShare() {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Europe, Slowly.",
          text: "Check out my Europe trip itinerary.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Itinerary link copied!");
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  }

  return (
    <div className="relative min-h-screen">
      <MapBackground />
      <div className="relative z-10 pt-14 pb-20 md:pb-8">
        {/* Trip header */}
        <div
          className={`border-b border-white/[0.06] bg-[#0d1b2a]/50 backdrop-blur-sm transition-all duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="max-w-screen-xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase text-[#c4714a]/70 mb-2">
                  Your Trip
                </p>
                <h1 className="font-serif text-3xl md:text-5xl text-[#f5f0e8] font-light italic mb-2">
                  Europe, Slowly.
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#f5f0e8]/50">
                  <span>Paris</span>
                  <ChevronRight size={12} />
                  <span>Amsterdam</span>
                  <ChevronRight size={12} />
                  <span>Copenhagen</span>
                </div>
                <p className="font-mono text-xs text-[#f5f0e8]/30 mt-1.5">
                  12 Mar — 21 Mar · 10 days
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded">
                  <p className="text-[10px] font-mono text-[#f5f0e8]/30 uppercase tracking-wider">
                    Est. Total
                  </p>
                  <p className="font-mono text-[#f5f0e8] text-lg">€2,840</p>
                </div>
                <button
                  onClick={() => navigate("/trips/create")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded text-[#f5f0e8]/60 text-sm hover:bg-white/[0.07] transition-colors"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded text-[#f5f0e8]/60 text-sm hover:bg-white/[0.07] transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={() => navigate(`/trips/${tripId}/calendar`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded text-[#f5f0e8]/60 text-sm hover:bg-white/[0.07] transition-colors"
                >
                  <Calendar size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Day selector */}
        <div className="border-b border-white/[0.06] bg-[#0d1b2a]/30 backdrop-blur-sm overflow-x-auto">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex gap-0 min-w-max">
              {DAYS.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`flex flex-col items-start px-5 py-4 border-b-2 transition-all duration-200 min-w-[90px] ${
                    selectedDay === day.id
                      ? "border-[#c4714a] text-[#f5f0e8]"
                      : "border-transparent text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70 hover:border-white/10"
                  }`}
                >
                  <span
                    className={`font-mono text-[9px] tracking-widest uppercase mb-1 ${selectedDay === day.id ? "text-[#c4714a]" : ""}`}
                  >
                    Day {day.label}
                  </span>
                  <span className="text-sm font-medium">{day.city}</span>
                  <span className="font-mono text-[10px] opacity-60 mt-0.5">
                    {day.date}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-screen-xl mx-auto px-6 pt-8">
          <div className="flex gap-8">
            {/* Timeline */}
            <div className="flex-1 min-w-0">
              {(["morning", "afternoon", "evening"] as const).map((period) => {
                const events = visibleDayContent[period] || [];
                if (events.length === 0) return null;
                return (
                  <div key={period} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-[10px] tracking-widest uppercase text-[#f5f0e8]/30">
                        {period}
                      </span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>
                    <div className="relative pl-6">
                      {/* Vertical timeline bar */}
                      <div className="absolute left-0 top-2 bottom-2 w-px bg-white/[0.08]" />

                      <div className="space-y-4">
                        {events.map((event, i) => (
                          <TimelineEntry
                            key={event.id}
                            event={event}
                            index={i}
                            expanded={expandedIds.has(event.id)}
                            completed={completedIds.has(event.id)}
                            onToggleExpand={() => toggleExpand(event.id)}
                            onToggleComplete={() => toggleComplete(event.id)}
                            onRemove={() => removeEvent(event.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side panel — desktop */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <TripSummaryPanel
                selectedDay={selectedDay}
                completedCount={completedIds.size}
                totalCost={totalCost}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({
  event,
  index,
  expanded,
  completed,
  onToggleExpand,
  onToggleComplete,
  onRemove,
}: {
  event: ItineraryEvent;
  index: number;
  expanded: boolean;
  completed: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
  onRemove: () => void;
}) {
  const config = TYPE_CONFIG[event.type];
  const Icon = config.icon;

  return (
    <div
      className={`relative animate-card-in ${completed ? "opacity-50" : ""} transition-opacity duration-300`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Timeline dot */}
      <div
        className="absolute -left-[25px] top-4 w-2 h-2 rounded-full border-2"
        style={{
          borderColor: config.color,
          backgroundColor: completed ? config.color : "#0d1b2a",
        }}
      />

      <div
        className={`group ml-0 p-4 border rounded transition-all duration-300 ${
          expanded
            ? "bg-white/[0.05] border-white/[0.12]"
            : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10] hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: `${config.color}18`,
              border: `1px solid ${config.color}30`,
            }}
          >
            <Icon size={13} style={{ color: config.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] text-[#f5f0e8]/30">
                    {event.time}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: config.color,
                      backgroundColor: `${config.color}15`,
                    }}
                  >
                    {config.label}
                  </span>
                </div>
                <p
                  className={`text-sm font-medium leading-snug ${completed ? "line-through text-[#f5f0e8]/40" : "text-[#f5f0e8]/90"}`}
                >
                  {event.title}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={onToggleExpand}
                  className="w-6 h-6 flex items-center justify-center text-[#f5f0e8]/20 hover:text-[#f5f0e8]/50 transition-colors"
                >
                  {expanded ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsed meta */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#f5f0e8]/35">
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {event.location}
              </span>
              {event.duration !== "—" && (
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {event.duration}
                </span>
              )}
              <span className="flex items-center gap-1 ml-auto font-mono">
                {event.cost}
              </span>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pl-10 animate-fade-in">
            {event.image && (
              <div className="img-zoom h-32 rounded overflow-hidden mb-3 bg-[#112236]">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {event.notes && (
              <p className="text-xs text-[#f5f0e8]/40 mb-3 border-l-2 border-[#c4714a]/20 pl-3">
                {event.notes}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleComplete}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-all ${
                  completed
                    ? "border-[#7a9e7e]/30 text-[#7a9e7e] bg-[#7a9e7e]/10"
                    : "border-white/[0.08] text-[#f5f0e8]/40 hover:border-[#7a9e7e]/30 hover:text-[#7a9e7e]"
                }`}
              >
                <Check size={11} />
                {completed ? "Completed" : "Mark done"}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-white/[0.08] text-[#f5f0e8]/40 hover:border-white/20 hover:text-[#f5f0e8]/60 transition-all">
                <Edit3 size={11} />
                Edit
              </button>
              <button
                onClick={onRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-white/[0.08] text-[#f5f0e8]/40 hover:border-red-500/30 hover:text-red-400 transition-all ml-auto"
              >
                <Trash2 size={11} />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TripSummaryPanel({
  selectedDay,
  completedCount,
  totalCost,
}: {
  selectedDay: number;
  completedCount: number;
  totalCost: number;
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "1";
  const day = DAYS.find((d) => d.id === selectedDay)!;

  return (
    <div className="sticky top-20 space-y-3">
      {/* Trip progress */}
      <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-4">
          Trip Progress
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-center">
            <p className="font-mono text-2xl text-[#f5f0e8]">{selectedDay}</p>
            <p className="text-[10px] text-[#f5f0e8]/30">of 10 days</p>
          </div>
          <div className="flex-1">
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c4714a] rounded-full transition-all duration-700"
                style={{ width: `${(selectedDay / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#f5f0e8]/30 mt-1">
              Day {day.label} · {day.city}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
          {[
            { label: "Activities today", value: completedCount + " done" },
            { label: "Est. day spend", value: `€${totalCost}` },
            { label: "Current city", value: day.city },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-[#f5f0e8]/35">{label}</span>
              <span className="font-mono text-xs text-[#f5f0e8]/65">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Route map */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-4">
          Route
        </p>
        <svg viewBox="0 0 180 260" className="w-full">
          <line
            x1="90"
            y1="30"
            x2="90"
            y2="230"
            stroke="#c4714a"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.2"
          />
          {[
            {
              y: 30,
              label: "Paris",
              days: "Mar 12–13",
              active: selectedDay <= 2,
            },
            {
              y: 120,
              label: "Amsterdam",
              days: "Mar 14–15",
              active: selectedDay >= 3 && selectedDay <= 4,
            },
            {
              y: 210,
              label: "Copenhagen",
              days: "Mar 16–17",
              active: selectedDay >= 5,
            },
          ].map(({ y, label, days, active }) => (
            <g key={label}>
              <circle
                cx="90"
                cy={y}
                r={active ? 6 : 4}
                fill={active ? "#c4714a" : "#f5f0e8"}
                opacity={active ? 1 : 0.25}
              />
              {active && (
                <circle
                  cx="90"
                  cy={y}
                  r="11"
                  fill="none"
                  stroke="#c4714a"
                  strokeWidth="0.8"
                  opacity="0.35"
                />
              )}
              <text
                x="106"
                y={y + 4}
                fill="#f5f0e8"
                fontSize="10"
                fontFamily="JetBrains Mono"
                opacity={active ? 0.85 : 0.3}
              >
                {label}
              </text>
              <text
                x="106"
                y={y + 15}
                fill="#f5f0e8"
                fontSize="8"
                fontFamily="JetBrains Mono"
                opacity={active ? 0.4 : 0.15}
              >
                {days}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Quick actions */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-3">
          Quick actions
        </p>
        <div className="space-y-1.5">
          {["Add Activity", "Edit Trip", "View Calendar", "Export PDF"].map(
            (action) => (
              <button
                key={action}
                onClick={() => {
                  if (action === "Add Activity") {
                    navigate("/activities");
                  }

                  if (action === "Edit Trip") {
                    alert("Edit Trip will be available soon.");
                  }

                  if (action === "View Calendar") {
                    navigate(`/trips/${tripId}/calendar`);
                  }

                  if (action === "Export PDF") {
                    alert("PDF export coming soon.");
                  }
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#f5f0e8]/50 hover:text-[#f5f0e8]/80 hover:bg-white/[0.04] rounded transition-all flex items-center justify-between group"
              >
                {action}

                <ChevronRight
                  size={11}
                  className="opacity-0 group-hover:opacity-60 transition-opacity"
                />
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
