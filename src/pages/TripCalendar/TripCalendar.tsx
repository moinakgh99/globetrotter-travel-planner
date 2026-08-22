import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plane,
  Train,
  Bed,
  Utensils,
  Activity,
  Coffee,
  AlertTriangle,
  Search,
  Filter,
  List,
  CalendarDays,
  MapPin,
  DollarSign,
} from "lucide-react";
import MapBackground from "../../components/MapBackground";

const MONTH_EVENTS: Record<
  number,
  {
    type: "activity" | "transport" | "hotel" | "meal" | "free";
    label: string;
    city?: string;
    cost?: string;
    warning?: boolean;
  }[]
> = {
  12: [
    { type: "transport", label: "CDG Arrival", city: "Paris" },
    { type: "hotel", label: "Le Petit Moulin" },
  ],
  13: [
    { type: "activity", label: "Cooking Class", city: "Paris", cost: "€145" },
    { type: "meal", label: "Septime" },
  ],
  14: [
    { type: "transport", label: "Thalys to AMS", city: "Amsterdam" },
    { type: "activity", label: "Canal Boat", cost: "€95" },
  ],
  15: [
    { type: "activity", label: "Rijksmuseum", city: "Amsterdam", cost: "€75" },
    { type: "meal", label: "De Kas" },
  ],
  16: [
    { type: "transport", label: "Train to CPH", city: "Copenhagen" },
    { type: "hotel", label: "Nimb Hotel" },
  ],
  17: [
    { type: "activity", label: "Kayak Tour", city: "Copenhagen", cost: "€120" },
  ],
  18: [
    { type: "free", label: "Free morning" },
    { type: "meal", label: "Noma (lunch)", warning: true },
  ],
  19: [{ type: "transport", label: "Flight to STK", city: "Stockholm" }],
  20: [
    { type: "activity", label: "Vasa Museum", city: "Stockholm", cost: "€18" },
  ],
  21: [{ type: "transport", label: "ARN Departure" }],
};

const DESTINATIONS = [
  {
    city: "Paris",
    dates: "Mar 12–13",
    activities: 5,
    spend: "€680",
    transport: "Thalys",
    color: "#c4714a",
  },
  {
    city: "Amsterdam",
    dates: "Mar 14–15",
    activities: 4,
    spend: "€520",
    transport: "Train",
    color: "#6b8fa8",
  },
  {
    city: "Copenhagen",
    dates: "Mar 16–18",
    activities: 3,
    spend: "€440",
    transport: "Flight",
    color: "#7a9e7e",
  },
  {
    city: "Stockholm",
    dates: "Mar 19–21",
    activities: 3,
    spend: "€380",
    transport: "—",
    color: "#b8a060",
  },
];

const EVENT_ICONS = {
  activity: Activity,
  transport: Plane,
  hotel: Bed,
  meal: Utensils,
  free: Coffee,
};

const EVENT_COLORS = {
  activity: "#c4714a",
  transport: "#6b8fa8",
  hotel: "#7a9e7e",
  meal: "#b8a060",
  free: "#666",
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MARCH_2024_START = 5; // March 1, 2024 is a Friday (index 5)
const MARCH_DAYS = 31;

type EventFilter = "all" | "activity" | "transport" | "hotel" | "meal" | "free";

export default function TripCalendar() {
  const [selectedDay, setSelectedDay] = useState<number | null>(12);
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const tripDays = Object.keys(MONTH_EVENTS).map(Number);
  const isTripDay = (day: number) => tripDays.includes(day);
  const selectedEvents = selectedDay ? MONTH_EVENTS[selectedDay] || [] : [];

  const selectedDestination = selectedDay
    ? DESTINATIONS.find((d) => {
        const [start, end] = d.dates.replace("Mar ", "").split("–").map(Number);
        return selectedDay >= start && selectedDay <= end;
      })
    : null;

  // Build calendar grid
  const totalCells = Math.ceil((MARCH_DAYS + MARCH_2024_START) / 7) * 7;
  const cells: (number | null)[] = Array.from(
    { length: totalCells },
    (_, i) => {
      const day = i - MARCH_2024_START + 1;
      return day >= 1 && day <= MARCH_DAYS ? day : null;
    },
  );

  const filterEvents = (events: typeof selectedEvents) =>
    activeFilter === "all"
      ? events
      : events.filter((e) => e.type === activeFilter);

  return (
    <div className="relative min-h-screen">
      <MapBackground />
      <div className="relative z-10 pt-14 pb-20 md:pb-8">
        {/* Header */}
        <div
          className={`border-b border-white/[0.06] bg-[#0d1b2a]/50 backdrop-blur-sm transition-all duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="max-w-screen-xl mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase text-[#c4714a]/70 mb-1">
                  Calendar
                </p>
                <div className="flex items-baseline gap-3">
                  <h1 className="font-serif text-2xl md:text-3xl text-[#f5f0e8] font-light italic">
                    Europe, Slowly.
                  </h1>
                  <span className="font-mono text-xs text-[#f5f0e8]/30">
                    March 2024
                  </span>
                </div>
                <p className="text-[#f5f0e8]/40 text-sm mt-0.5">
                  10 days ·{" "}
                  {selectedDestination
                    ? `Currently in ${selectedDestination.city}`
                    : "Select a day"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f5f0e8]/25"
                  />
                  <input
                    placeholder="Search events..."
                    className="pl-8 pr-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded text-xs text-[#f5f0e8]/70 placeholder-[#f5f0e8]/20 focus:outline-none focus:border-white/20 w-40"
                  />
                </div>
                <div className="flex border border-white/[0.08] rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-3 py-2 text-xs transition-colors ${viewMode === "calendar" ? "bg-white/[0.08] text-[#f5f0e8]" : "text-[#f5f0e8]/40 hover:text-[#f5f0e8]/60"}`}
                  >
                    <CalendarDays size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 text-xs transition-colors ${viewMode === "list" ? "bg-white/[0.08] text-[#f5f0e8]" : "text-[#f5f0e8]/40 hover:text-[#f5f0e8]/60"}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 pt-6">
          <div className="flex gap-6 lg:gap-8">
            {/* Main area */}
            <div className="flex-1 min-w-0">
              {/* Filter pills */}
              <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                {(
                  [
                    "all",
                    "activity",
                    "transport",
                    "hotel",
                    "meal",
                    "free",
                  ] as EventFilter[]
                ).map((f) => {
                  const Icon =
                    f === "all"
                      ? Filter
                      : EVENT_ICONS[f as keyof typeof EVENT_ICONS];
                  const color =
                    f === "all"
                      ? "#f5f0e8"
                      : EVENT_COLORS[f as keyof typeof EVENT_COLORS];
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-all ${
                        activeFilter === f
                          ? "bg-white/[0.08] border-white/20 text-[#f5f0e8]"
                          : "border-white/[0.06] text-[#f5f0e8]/40 hover:border-white/15"
                      }`}
                    >
                      <Icon
                        size={11}
                        style={{
                          color: activeFilter === f ? color : undefined,
                        }}
                      />
                      <span className="capitalize">{f}</span>
                    </button>
                  );
                })}
              </div>

              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button className="w-8 h-8 flex items-center justify-center text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors rounded hover:bg-white/[0.04]">
                  <ChevronLeft size={16} />
                </button>
                <h2 className="font-serif text-lg text-[#f5f0e8] font-light">
                  March 2024
                </h2>
                <button className="w-8 h-8 flex items-center justify-center text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors rounded hover:bg-white/[0.04]">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-white/[0.06]">
                  {DAYS_OF_WEEK.map((d) => (
                    <div
                      key={d}
                      className="py-2.5 text-center font-mono text-[10px] text-[#f5f0e8]/25 tracking-widest uppercase"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7">
                  {cells.map((day, i) => {
                    const isTrip = day !== null && isTripDay(day);
                    const isSelected = day === selectedDay;
                    const dayEvents = day ? MONTH_EVENTS[day] || [] : [];
                    const filteredDayEvents = filterEvents(dayEvents);
                    const hasWarning = dayEvents.some((e) => e.warning);
                    const dest = day
                      ? DESTINATIONS.find((d) => {
                          const [start, end] = d.dates
                            .replace("Mar ", "")
                            .split("–")
                            .map(Number);
                          return day >= start && day <= end;
                        })
                      : null;

                    return (
                      <div
                        key={i}
                        onClick={() =>
                          day &&
                          setSelectedDay(day === selectedDay ? null : day)
                        }
                        className={`min-h-[80px] md:min-h-[100px] border-b border-r border-white/[0.04] p-1.5 md:p-2 relative transition-all duration-200 ${
                          day ? "cursor-pointer" : ""
                        } ${
                          isSelected
                            ? "bg-[#c4714a]/10 border-[#c4714a]/20"
                            : isTrip
                              ? "hover:bg-white/[0.04]"
                              : "opacity-40"
                        }`}
                        style={{
                          borderRight: (i + 1) % 7 === 0 ? "none" : undefined,
                        }}
                      >
                        {day !== null && (
                          <>
                            {/* Day number */}
                            <div className="flex items-start justify-between mb-1">
                              <span
                                className={`font-mono text-xs ${
                                  isSelected
                                    ? "text-[#c4714a] font-medium"
                                    : isTrip
                                      ? "text-[#f5f0e8]/70"
                                      : "text-[#f5f0e8]/25"
                                }`}
                              >
                                {day}
                              </span>
                              {hasWarning && (
                                <AlertTriangle
                                  size={9}
                                  className="text-yellow-500/60 flex-shrink-0"
                                />
                              )}
                            </div>

                            {/* Destination color bar */}
                            {dest && (
                              <div
                                className="absolute top-0 left-0 right-0 h-0.5"
                                style={{
                                  backgroundColor: dest.color,
                                  opacity: 0.5,
                                }}
                              />
                            )}

                            {/* Events */}
                            <div className="space-y-0.5">
                              {filteredDayEvents
                                .slice(0, 2)
                                .map((event, ei) => {
                                  const EIcon = EVENT_ICONS[event.type];
                                  const eColor = EVENT_COLORS[event.type];
                                  return (
                                    <div
                                      key={ei}
                                      className="flex items-center gap-1 rounded px-1 py-0.5"
                                      style={{ backgroundColor: `${eColor}18` }}
                                    >
                                      <EIcon
                                        size={8}
                                        style={{ color: eColor, flexShrink: 0 }}
                                      />
                                      <span
                                        className="text-[9px] truncate leading-none"
                                        style={{ color: eColor }}
                                      >
                                        {event.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              {filteredDayEvents.length > 2 && (
                                <p className="text-[9px] text-[#f5f0e8]/25 px-1">
                                  +{filteredDayEvents.length - 2} more
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected day detail */}
              {selectedDay && selectedEvents.length > 0 && (
                <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[#c4714a]/70 mb-0.5">
                        March {selectedDay}
                      </p>
                      <p className="text-[#f5f0e8]/70 text-sm font-medium">
                        {selectedDestination?.city || "Day activities"}
                      </p>
                    </div>
                    {selectedDestination && (
                      <span
                        className="font-mono text-xs px-2.5 py-1 rounded border"
                        style={{
                          color: selectedDestination.color,
                          borderColor: `${selectedDestination.color}30`,
                          backgroundColor: `${selectedDestination.color}10`,
                        }}
                      >
                        {selectedDestination.city}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {filterEvents(selectedEvents).map((event, i) => {
                      const EIcon = EVENT_ICONS[event.type];
                      const eColor = EVENT_COLORS[event.type];
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded border border-white/[0.05] hover:border-white/[0.10] transition-colors animate-card-in"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${eColor}18` }}
                          >
                            <EIcon size={11} style={{ color: eColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#f5f0e8]/80 text-sm">
                              {event.label}
                            </p>
                            {event.city && (
                              <p className="text-xs text-[#f5f0e8]/30 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} />
                                {event.city}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {event.warning && (
                              <AlertTriangle
                                size={12}
                                className="text-yellow-500/60"
                              />
                            )}
                            {event.cost && (
                              <span className="font-mono text-xs text-[#f5f0e8]/40">
                                {event.cost}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Journey timeline */}
              <div className="mt-6">
                <p className="font-mono text-[10px] tracking-widest uppercase text-[#f5f0e8]/30 mb-4">
                  Journey Timeline
                </p>
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-0 min-w-max">
                    {DESTINATIONS.map((dest, i) => (
                      <div key={dest.city} className="flex items-start">
                        <button
                          onClick={() => {
                            const [start] = dest.dates
                              .replace("Mar ", "")
                              .split("–")
                              .map(Number);
                            setSelectedDay(start);
                          }}
                          className="group flex flex-col p-4 min-w-[160px] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all rounded"
                          style={{
                            borderLeftColor:
                              selectedDay &&
                              (() => {
                                const [s, e] = dest.dates
                                  .replace("Mar ", "")
                                  .split("–")
                                  .map(Number);
                                return selectedDay >= s && selectedDay <= e;
                              })()
                                ? dest.color
                                : undefined,
                            borderLeftWidth: "2px",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: dest.color }}
                            />
                            <span className="font-serif text-[#f5f0e8] text-base font-light">
                              {dest.city}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-[#f5f0e8]/35 mb-2">
                            {dest.dates}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#f5f0e8]/30">
                                Activities
                              </span>
                              <span className="text-[#f5f0e8]/55">
                                {dest.activities}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[#f5f0e8]/30">
                                Est. spend
                              </span>
                              <span className="font-mono text-[#f5f0e8]/55">
                                {dest.spend}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[#f5f0e8]/30">Onward</span>
                              <span className="text-[#f5f0e8]/55">
                                {dest.transport}
                              </span>
                            </div>
                          </div>
                        </button>
                        {i < DESTINATIONS.length - 1 && (
                          <div className="flex items-center px-2 mt-8">
                            <div className="w-8 h-px bg-white/10" />
                            <ChevronRight
                              size={12}
                              className="text-[#f5f0e8]/20"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conflict warning example */}
              <div className="mt-4 flex items-start gap-3 p-3 bg-yellow-500/[0.06] border border-yellow-500/[0.15] rounded">
                <AlertTriangle
                  size={14}
                  className="text-yellow-500/70 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-yellow-500/80 font-medium">
                    Potential conflict on March 18
                  </p>
                  <p className="text-xs text-[#f5f0e8]/30 mt-0.5">
                    Noma lunch booking overlaps with your free morning activity.
                    Consider adjusting the schedule.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <CalendarSidebar
                selectedDay={selectedDay}
                selectedDestination={selectedDestination}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarSidebar({
  selectedDay,
  selectedDestination,
}: {
  selectedDay: number | null;
  selectedDestination: (typeof DESTINATIONS)[0] | null | undefined;
}) {
  return (
    <div className="sticky top-20 space-y-3">
      {/* Selected day summary */}
      <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-3">
          {selectedDay ? `March ${selectedDay}` : "Select a day"}
        </p>
        {selectedDestination ? (
          <div>
            <p className="font-serif text-[#f5f0e8] text-lg font-light">
              {selectedDestination.city}
            </p>
            <p className="font-mono text-xs text-[#f5f0e8]/35 mt-0.5">
              {selectedDestination.dates}
            </p>
            <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#f5f0e8]/35">Activities</span>
                <span className="font-mono text-[#f5f0e8]/60">
                  {selectedDestination.activities}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#f5f0e8]/35">Est. spend</span>
                <span className="font-mono text-[#f5f0e8]/60">
                  {selectedDestination.spend}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#f5f0e8]/35">Next leg</span>
                <span className="font-mono text-[#f5f0e8]/60">
                  {selectedDestination.transport}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#f5f0e8]/30">
            Click a highlighted day to view details.
          </p>
        )}
      </div>

      {/* Trip overview */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-4">
          Trip Overview
        </p>
        <div className="space-y-2.5">
          {[
            { label: "Total duration", value: "10 days" },
            { label: "Destinations", value: "4 cities" },
            { label: "Activities", value: "15 planned" },
            { label: "Est. total", value: "€2,840" },
            { label: "Budget status", value: "On track", ok: true },
          ].map(({ label, value, ok }) => (
            <div
              key={label}
              className="flex justify-between items-center text-xs"
            >
              <span className="text-[#f5f0e8]/35">{label}</span>
              <span
                className={`font-mono ${ok ? "text-[#7a9e7e]" : "text-[#f5f0e8]/60"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-3">
          Legend
        </p>
        <div className="space-y-2">
          {Object.entries(EVENT_ICONS).map(([type, Icon]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <Icon
                size={11}
                style={{
                  color: EVENT_COLORS[type as keyof typeof EVENT_COLORS],
                }}
              />
              <span className="text-[#f5f0e8]/40 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Jump buttons */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded">
        <p className="font-mono text-[9px] tracking-widest uppercase text-[#f5f0e8]/30 mb-3">
          Jump to
        </p>
        <div className="space-y-1.5">
          {DESTINATIONS.map((d) => (
            <button
              key={d.city}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#f5f0e8]/45 hover:text-[#f5f0e8]/75 hover:bg-white/[0.04] transition-all group"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.city}
              <span className="text-[#f5f0e8]/25 ml-auto font-mono">
                {d.dates}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
