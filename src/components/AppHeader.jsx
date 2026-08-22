import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, User, LogOut, ChevronDown, MapPin, Plus } from "lucide-react";
import { getCurrentUser, removeAuthSession } from "../lib/api";

const AppHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    removeAuthSession();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = currentUser?.first_name ? currentUser.first_name.charAt(0).toUpperCase() : (currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : "U");

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: App Logo / Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-400 font-sans">
            GlobeTrotter
          </span>
        </Link>

        {/* Right: Quick actions & Profile / Avatar Menu */}
        <div className="flex items-center gap-4">
          <Link
            to="/trips/create"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </Link>

          {/* User Profile Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="profile-menu-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-800 border border-slate-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              aria-label="User menu"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow">
                {userInitial}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {currentUser && (
                  <div className="px-4 py-3 border-b border-slate-700/70">
                    <p className="text-sm font-semibold text-white truncate">
                      {currentUser.first_name} {currentUser.last_name}
                    </p>
                    <p className="text-xs text-sky-400 truncate">@{currentUser.username}</p>
                    {currentUser.city && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{currentUser.city}, {currentUser.country}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700/60 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    <span>My Profile</span>
                  </Link>
                </div>

                <div className="border-t border-slate-700/70 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
