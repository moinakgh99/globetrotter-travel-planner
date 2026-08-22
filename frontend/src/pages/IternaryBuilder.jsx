import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Plus, 
  GripVertical, 
  Utensils, 
  Mountain, 
  Landmark, 
  Car, 
  Bed, 
  Sparkles, 
  Trash2, 
  Calendar, 
  Compass, 
  X, 
  Check, 
  Search,
  AlertCircle
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_STOPS = [
  {
    id: 'stop-1',
    trip_id: 'trip-1',
    city_id: 'city-jaipur',
    cityName: 'Jaipur',
    countryName: 'India',
    stop_order: 1,
    arrival_date: '2026-10-10',
    departure_date: '2026-10-13',
    activities: [
      {
        id: 'act-1',
        trip_stop_id: 'stop-1',
        name: 'Amer Fort Exploration',
        category: 'Sightseeing',
        estimated_cost: 1500,
        scheduled_date: '2026-10-11',
        scheduled_time: '09:00',
        notes: 'Hire a local guide for the history.'
      },
      {
        id: 'act-2',
        trip_stop_id: 'stop-1',
        name: 'Chokhi Dhani Dinner',
        category: 'Food',
        estimated_cost: 2200,
        scheduled_date: '2026-10-11',
        scheduled_time: '19:30',
        notes: 'Traditional Rajasthani thali.'
      },
      {
        id: 'act-3',
        trip_stop_id: 'stop-1',
        name: 'Hot Air Balloon Ride',
        category: 'Adventure',
        estimated_cost: 12000,
        scheduled_date: '2026-10-12',
        scheduled_time: '05:30',
        notes: 'Early morning flight over the Pink City.'
      }
    ]
  },
  {
    id: 'stop-2',
    trip_id: 'trip-1',
    city_id: 'city-goa',
    cityName: 'Goa',
    countryName: 'India',
    stop_order: 2,
    arrival_date: '2026-10-13',
    departure_date: '2026-10-17',
    activities: [
      {
        id: 'act-4',
        trip_stop_id: 'stop-2',
        name: 'Baga Beach Shacks',
        category: 'Food',
        estimated_cost: 3000,
        scheduled_date: '2026-10-14',
        scheduled_time: '13:00',
        notes: 'Seafood and drinks.'
      },
      {
        id: 'act-5',
        trip_stop_id: 'stop-2',
        name: 'Scooter Rental',
        category: 'Transport',
        estimated_cost: 2000,
        scheduled_date: '2026-10-14',
        scheduled_time: '10:00',
        notes: 'Rented for 4 days.'
      }
    ]
  }
];

const MOCK_CITIES = [
  { id: 'city-bkk', name: 'Bangkok', country: 'Thailand' },
  { id: 'city-ktm', name: 'Kathmandu', country: 'Nepal' },
  { id: 'city-dxb', name: 'Dubai', country: 'UAE' },
  { id: 'city-del', name: 'New Delhi', country: 'India' },
  { id: 'city-bom', name: 'Mumbai', country: 'India' },
];

const CATEGORY_COLORS = {
  Food: 'text-orange-500 bg-orange-50 border-orange-200',
  Adventure: 'text-green-600 bg-green-50 border-green-200',
  Sightseeing: 'text-blue-500 bg-blue-50 border-blue-200',
  Transport: 'text-purple-500 bg-purple-50 border-purple-200',
  Stay: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  Other: 'text-slate-500 bg-slate-50 border-slate-200',
};

const CATEGORY_ICONS = {
  Food: Utensils,
  Adventure: Mountain,
  Sightseeing: Landmark,
  Transport: Car,
  Stay: Bed,
  Other: Sparkles,
};

const CATEGORIES = Object.keys(CATEGORY_ICONS);

export default function ItineraryBuilder({ tripId }) {
  // --- STATE ---
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [addingActivityToDay, setAddingActivityToDay] = useState(null); // format: "stopId-date"
  
  // Drag and Drop state
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}/stops`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch itinerary');
        }
        
        const data = await response.json();
        setStops(data);
        if (data.length > 0) {
          setSelectedStopId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching itinerary:", err);
        // Fallback to empty array instead of mock data
        setStops([]);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchItinerary();
    } else {
      setLoading(false);
    }
  }, [tripId]);

  // --- COMPUTED DATA ---
  const selectedStop = useMemo(() => stops.find(s => s.id === selectedStopId), [stops, selectedStopId]);
  
  const totalCost = useMemo(() => {
    return stops.reduce((total, stop) => {
      return total + stop.activities.reduce((sum, act) => sum + (Number(act.estimated_cost) || 0), 0);
    }, 0);
  }, [stops]);

  const totalDays = useMemo(() => {
    if (stops.length === 0) return 0;
    const allDates = stops.flatMap(s => [new Date(s.arrival_date), new Date(s.departure_date)]);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    return Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;
  }, [stops]);

  const tripDateRange = useMemo(() => {
    if (stops.length === 0) return 'No dates set';
    const allDates = stops.flatMap(s => [new Date(s.arrival_date), new Date(s.departure_date)]).sort((a,b) => a-b);
    const start = allDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = allDates[allDates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  }, [stops]);

  const selectedStopDays = useMemo(() => {
    if (!selectedStop) return [];
    const start = new Date(selectedStop.arrival_date);
    const end = new Date(selectedStop.departure_date);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, [selectedStop]);

  // --- HANDLERS ---
  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newStops = [...stops];
    const draggedItem = newStops[draggedItemIndex];
    newStops.splice(draggedItemIndex, 1);
    newStops.splice(index, 0, draggedItem);
    
    // Update order property
    newStops.forEach((stop, i) => {
      stop.stop_order = i + 1;
    });
    
    setStops(newStops);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const removeStop = (stopId) => {
    const updatedStops = stops.filter(s => s.id !== stopId);
    setStops(updatedStops);
    if (selectedStopId === stopId) {
      setSelectedStopId(updatedStops.length > 0 ? updatedStops[0].id : null);
    }
  };

  const updateStopDates = (stopId, type, value) => {
    setStops(prev => prev.map(s => {
      if (s.id !== stopId) return s;
      return { ...s, [type]: value };
    }));
  };

  const addStop = (newStop) => {
    const enrichedStop = {
      ...newStop,
      id: `stop-${Date.now()}`,
      trip_id: tripId || 'new-trip',
      stop_order: stops.length + 1,
      activities: []
    };
    setStops(prev => [...prev, enrichedStop]);
    setSelectedStopId(enrichedStop.id);
    setIsAddingStop(false);
  };

  const removeActivity = (stopId, activityId) => {
    setStops(prev => prev.map(s => {
      if (s.id !== stopId) return s;
      return {
        ...s,
        activities: s.activities.filter(a => a.id !== activityId)
      };
    }));
  };

  const saveActivity = (stopId, activity) => {
    setStops(prev => prev.map(s => {
      if (s.id !== stopId) return s;
      
      const exists = s.activities.find(a => a.id === activity.id);
      let newActivities;
      
      if (exists) {
        newActivities = s.activities.map(a => a.id === activity.id ? activity : a);
      } else {
        newActivities = [...s.activities, { ...activity, id: `act-${Date.now()}` }];
      }
      
      // Sort activities by time
      newActivities.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
      
      return { ...s, activities: newActivities };
    }));
    setAddingActivityToDay(null);
  };

  // --- SUB-COMPONENTS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDateLabel = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse flex flex-col gap-6">
          <div className="h-20 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          <div className="flex gap-6">
            <div className="w-72 hidden lg:block h-[600px] bg-white rounded-2xl shadow-sm border border-slate-100"></div>
            <div className="flex-1 h-[600px] bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 md:pb-8">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">My Incredible Trip</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1 shrink-0"><Calendar className="w-4 h-4" /> <span className="hidden sm:inline">{tripDateRange}</span></span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
                {stops.length} stops &middot; {totalDays} days
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Total</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(totalCost)}</span>
            </div>
            <button 
              onClick={() => setIsAddingStop(true)}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Stop</span>
            </button>
          </div>
        </div>
        {/* Mobile Budget Chip */}
        <div className="md:hidden px-4 pb-3 flex justify-between items-center text-sm border-t border-slate-100 pt-2 mt-2">
           <span className="text-slate-500 flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" /> {tripDateRange}
            </span>
            <span className="font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Total: {formatCurrency(totalCost)}
            </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {stops.length === 0 && !isAddingStop ? (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Compass className="w-12 h-12 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Start building your itinerary</h2>
            <p className="text-slate-500 max-w-md mb-8">Add your first destination to begin planning dates, activities, and budgeting for your journey.</p>
            <button 
              onClick={() => setIsAddingStop(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" /> Add First Stop
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8 items-start">
            
            {/* LEFT RAIL / TOP TABS */}
            <div className={`
              ${isMobile ? 'flex overflow-x-auto pb-4 -mx-4 px-4 snap-x hide-scrollbar' : 'flex flex-col w-full sticky top-[100px]'}
            `}>
              {!isMobile && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Trip Timeline</h3>}
              
              <div className={`${isMobile ? 'flex gap-3' : 'relative pl-3'}`}>
                {/* Vertical connecting line for desktop */}
                {!isMobile && (
                  <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
                )}
                
                {stops.map((stop, index) => {
                  const isActive = stop.id === selectedStopId;
                  const hasActivities = stop.activities.length > 0;
                  const isDragging = index === draggedItemIndex;
                  
                  if (isMobile) {
                    return (
                      <button
                        key={stop.id}
                        onClick={() => setSelectedStopId(stop.id)}
                        className={`
                          snap-start shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 text-left min-w-[200px] max-w-[240px]
                          ${isActive ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-sm ${isActive ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold text-sm truncate ${isActive ? 'text-teal-900' : 'text-slate-700'}`}>{stop.cityName}</div>
                          <div className="text-xs text-slate-500 truncate">{new Date(stop.arrival_date).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <div 
                      key={stop.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedStopId(stop.id)}
                      className={`
                        relative z-10 flex items-stretch group cursor-pointer transition-all duration-200 mb-2 rounded-xl p-2
                        ${isActive ? 'bg-white shadow-sm border border-teal-100' : 'hover:bg-slate-200/50 border border-transparent'}
                        ${isDragging ? 'opacity-50' : 'opacity-100'}
                      `}
                    >
                      <div className="flex items-center justify-center w-8 mr-3 shrink-0 cursor-grab active:cursor-grabbing">
                        <GripVertical className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      </div>
                      
                      <div className={`
                        w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-sm z-10 border-2 transition-colors duration-300 mt-1
                        ${isActive ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20' : hasActivities ? 'bg-white text-teal-600 border-teal-500' : 'bg-white text-slate-400 border-slate-300'}
                      `}>
                        {hasActivities && !isActive ? <Check className="w-4 h-4" /> : index + 1}
                      </div>

                      <div className="ml-4 flex-1 py-1 min-w-0">
                        <h4 className={`font-bold text-base truncate transition-colors ${isActive ? 'text-teal-900' : 'text-slate-700'}`}>
                          {stop.cityName}
                        </h4>
                        <div className="text-xs text-slate-500 font-medium mb-1 truncate">{stop.countryName}</div>
                        <div className="text-xs text-slate-500 flex items-center justify-between gap-1">
                          <span className="truncate">{new Date(stop.arrival_date).toLocaleDateString('en-US', {month:'short', day:'numeric'})} &ndash; {new Date(stop.departure_date).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                          {hasActivities && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 shrink-0">
                              {stop.activities.length} act.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MAIN PANEL */}
            <div className="flex-1 w-full min-w-0">
              
              {/* ADD STOP PANEL */}
              {isAddingStop && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6 mb-6 overflow-hidden relative animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-teal-600" /> Add Destination
                    </h2>
                    <button onClick={() => setIsAddingStop(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <AddStopForm 
                    onSave={addStop} 
                    onCancel={() => setIsAddingStop(false)} 
                    cities={MOCK_CITIES}
                    existingStops={stops}
                  />
                </div>
              )}

              {/* SELECTED STOP DETAIL */}
              {!isAddingStop && selectedStop && (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in duration-300">
                  {/* Stop Header */}
                  <div className="p-5 md:p-8 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <MapPin className="w-48 h-48" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedStop.cityName}</h2>
                          <p className="text-lg text-slate-500 font-medium">{selectedStop.countryName}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this stop and all its activities?')) {
                              removeStop(selectedStop.id);
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors self-start focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" /> <span>Remove Stop</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 md:gap-6">
                        <div className="flex flex-1 sm:flex-none items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
                          <label htmlFor="arrival-date" className="text-xs font-bold text-slate-400 uppercase">Arrive</label>
                          <input 
                            id="arrival-date"
                            type="date" 
                            value={selectedStop.arrival_date}
                            onChange={(e) => updateStopDates(selectedStop.id, 'arrival_date', e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-full sm:w-auto"
                          />
                        </div>
                        <div className="text-slate-300 hidden sm:block">→</div>
                        <div className="flex flex-1 sm:flex-none items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
                          <label htmlFor="depart-date" className="text-xs font-bold text-slate-400 uppercase">Depart</label>
                          <input 
                            id="depart-date"
                            type="date" 
                            value={selectedStop.departure_date}
                            min={selectedStop.arrival_date}
                            onChange={(e) => updateStopDates(selectedStop.id, 'departure_date', e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-full sm:w-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="p-4 md:p-8 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      Itinerary <span className="text-sm font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{selectedStop.activities.length}</span>
                    </h3>

                    <div className="space-y-8">
                      {selectedStopDays.map(dateStr => {
                        const dayActivities = selectedStop.activities.filter(a => a.scheduled_date === dateStr);
                        const isAddingHere = addingActivityToDay === `${selectedStop.id}-${dateStr}`;

                        return (
                          <div key={dateStr} className="relative">
                            {/* Day Header */}
                            <div className="flex items-center gap-4 mb-4 sticky top-16 md:top-20 z-20 bg-slate-50/90 backdrop-blur-sm py-2">
                              <h4 className="font-bold text-slate-800 text-base md:text-lg">{formatDateLabel(dateStr)}</h4>
                              <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            <div className="pl-1 sm:pl-2 md:pl-4 space-y-3">
                              {dayActivities.length === 0 && !isAddingHere && (
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-white/50">
                                  <p className="text-slate-400 text-sm mb-3">No activities planned for this day.</p>
                                  <button 
                                    onClick={() => setAddingActivityToDay(`${selectedStop.id}-${dateStr}`)}
                                    className="text-teal-600 font-medium text-sm hover:text-teal-700 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
                                  >
                                    + Add Activity
                                  </button>
                                </div>
                              )}

                              {dayActivities.map(activity => (
                                <ActivityRow 
                                  key={activity.id} 
                                  activity={activity} 
                                  onDelete={() => removeActivity(selectedStop.id, activity.id)}
                                  formatCurrency={formatCurrency}
                                />
                              ))}

                              {isAddingHere && (
                                <ActivityForm 
                                  dateStr={dateStr}
                                  onSave={(act) => saveActivity(selectedStop.id, act)}
                                  onCancel={() => setAddingActivityToDay(null)}
                                />
                              )}

                              {dayActivities.length > 0 && !isAddingHere && (
                                <div className="pt-2">
                                  <button 
                                    onClick={() => setAddingActivityToDay(`${selectedStop.id}-${dateStr}`)}
                                    className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto justify-center sm:justify-start"
                                  >
                                    <Plus className="w-4 h-4" /> Add to {formatDateLabel(dateStr).split(',')[0]}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS (Internal) ---

function AddStopForm({ onSave, onCancel, cities, existingStops }) {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState('');

  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  // Overlap check
  useEffect(() => {
    if (arrivalDate && existingStops.length > 0) {
      const arr = new Date(arrivalDate);
      const overlaps = existingStops.some(s => {
        const sArr = new Date(s.arrival_date);
        const sDep = new Date(s.departure_date);
        return arr >= sArr && arr <= sDep;
      });
      if (overlaps) {
        setOverlapWarning('Note: Arrival date overlaps with an existing stop.');
      } else {
        setOverlapWarning('');
      }
    }
  }, [arrivalDate, existingStops]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCity || !arrivalDate || !departureDate) return;
    
    onSave({
      city_id: selectedCity.id,
      cityName: selectedCity.name,
      countryName: selectedCity.country,
      arrival_date: arrivalDate,
      departure_date: departureDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <label htmlFor="city-search" className="block text-sm font-medium text-slate-700 mb-1">Search City</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            id="city-search"
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 transition-colors outline-none"
            placeholder="e.g. Paris, Tokyo, Mumbai..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setSelectedCity(null);
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        
        {showDropdown && query && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <li 
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city);
                    setQuery(`${city.name}, ${city.country}`);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer flex justify-between items-center group"
                >
                  <span className="font-medium text-slate-700 group-hover:text-teal-700">{city.name}</span>
                  <span className="text-xs text-slate-400">{city.country}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-slate-500 text-center">No cities found</li>
            )}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="new-arrival-date" className="block text-sm font-medium text-slate-700 mb-1">Arrival Date</label>
          <input
            id="new-arrival-date"
            type="date"
            required
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="new-depart-date" className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
          <input
            id="new-depart-date"
            type="date"
            required
            min={arrivalDate}
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 outline-none transition-colors"
          />
        </div>
      </div>

      {overlapWarning && (
        <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm border border-amber-100">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p>{overlapWarning}</p>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 order-2 sm:order-1"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!selectedCity || !arrivalDate || !departureDate}
          className="px-6 py-2.5 sm:py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 order-1 sm:order-2"
        >
          Add Destination
        </button>
      </div>
    </form>
  );
}

function ActivityRow({ activity, onDelete, formatCurrency }) {
  const Icon = CATEGORY_ICONS[activity.category] || Sparkles;
  const colorClass = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.Other;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-3 p-3 md:p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
      
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass} bg-opacity-50 shrink-0 transition-transform group-hover:scale-105`}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-slate-900 truncate">{activity.name}</h5>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500 flex-wrap">
            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs shrink-0">{activity.scheduled_time}</span>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <span className="truncate">{activity.notes || activity.category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full pl-16 sm:pl-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
        <div className="font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 shrink-0">
          {formatCurrency(activity.estimated_cost)}
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Remove Activity"
            title="Remove Activity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityForm({ dateStr, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sightseeing',
    estimated_cost: '',
    scheduled_time: '09:00',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave({
      ...formData,
      scheduled_date: dateStr,
      estimated_cost: Number(formData.estimated_cost) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-teal-200 p-4 shadow-md relative animate-in zoom-in-95 duration-200 mt-2 focus-within:border-teal-400 transition-colors">
      <div className="absolute -top-3 -right-3">
         <span className="flex h-6 w-6 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-30"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-teal-100 border border-teal-300 items-center justify-center shadow-sm">
            <Sparkles className="h-3 w-3 text-teal-600" />
          </span>
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="activity-name" className="sr-only">Activity Name</label>
          <input
            id="activity-name"
            type="text"
            required
            placeholder="What do you want to do? e.g. Visit Eiffel Tower"
            className="w-full text-lg font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 bg-transparent"
            value={formData.name}
            autoFocus
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            const isSelected = formData.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({...formData, category: cat})}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1
                  ${isSelected ? CATEGORY_COLORS[cat] + ' shadow-sm ring-1 ring-current' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="activity-time" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</label>
            <input
              id="activity-time"
              type="time"
              required
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="activity-cost" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cost (Est.)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-slate-400 text-sm font-medium">₹</span>
              <input
                id="activity-cost"
                type="number"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                placeholder="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
              />
            </div>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <label htmlFor="activity-notes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes (Optional)</label>
            <input
              id="activity-notes"
              type="text"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none placeholder:text-slate-300 transition-shadow"
              placeholder="e.g. Book tickets online"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 sm:py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!formData.name.trim()}
            className="px-5 py-2 sm:py-1.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 order-1 sm:order-2"
          >
            Save Activity
          </button>
        </div>
      </div>
    </form>
  );
}
