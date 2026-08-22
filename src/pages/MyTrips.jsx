import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Calendar, MapPin, Plus, AlertTriangle, Clock } from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTrips() {
      try {
        const response = await api.get('/trips');
        setTrips(response.data);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError(err.response?.data?.error || 'Unable to load your trips. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const calculateDays = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getTripStatus = (start, end) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (today < startDate) {
      return { label: 'Upcoming', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    } else if (today > endDate) {
      return { label: 'Completed', class: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
    } else {
      return { label: 'Active', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              My Trips
            </h1>
            <p className="text-slate-400 mt-2">Manage and view your planned journeys</p>
          </div>
          <Link
            to="/trips/create"
            className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/10 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center space-x-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 mb-8">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Error occurred</p>
              <p className="text-sm text-rose-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-800"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl py-16 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-6">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No trips planned yet</h3>
            <p className="text-slate-400 max-w-md mb-8">
              Start building your travel itinerary, explore destination details, and prepare for your next adventure.
            </p>
            <Link
              to="/trips/create"
              className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        ) : (
          /* Trip List Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const status = getTripStatus(trip.start_date, trip.end_date);
              const daysCount = calculateDays(trip.start_date, trip.end_date);
              return (
                <div
                  key={trip.id}
                  className="group bg-slate-900 border border-slate-800/85 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  {/* Card Cover Photo */}
                  <div className="h-48 relative overflow-hidden bg-slate-800">
                    <img
                      src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>Travel Plan</span>
                      </div>
                      <h3 className="text-xl font-bold text-white line-clamp-1 mb-2 group-hover:text-emerald-300 transition-colors">
                        {trip.name}
                      </h3>
                      {trip.description && (
                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                          {trip.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 border-t border-slate-800 pt-4 text-sm text-slate-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{daysCount} {daysCount === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {trip.is_public ? (
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded">
                              Public
                            </span>
                          ) : (
                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="bg-slate-900 border-t border-slate-850 p-4 flex gap-2">
                    <Link
                      to={`/trips/${trip.id}/itinerary`}
                      className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Build Itinerary
                    </Link>
                    <Link
                      to={`/trips/${trip.id}/view`}
                      className="flex-1 text-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs font-semibold transition-colors border border-emerald-500/20"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
