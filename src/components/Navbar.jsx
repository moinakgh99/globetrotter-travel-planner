import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Calendar, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-white">
              <Compass className="h-6 w-6 text-emerald-500" />
              <span>
                Globe<span className="text-emerald-500">Trotter</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/" className={linkClass('/')}>
                <span>Dashboard</span>
              </Link>
              <Link to="/trips" className={linkClass('/trips')}>
                <Calendar className="h-4 w-4" />
                <span>My Trips</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-r border-slate-800 pr-4">
              <Link to="/profile" className={linkClass('/profile')}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
