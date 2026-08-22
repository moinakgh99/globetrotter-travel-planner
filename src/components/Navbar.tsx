import { Link, useLocation } from "react-router-dom";
import { Globe, Map, Calendar, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/activities", label: "Discover", icon: Search },
  { path: "/trips/europe-slowly/view", label: "Itinerary", icon: Map },
  { path: "/trips/europe-slowly/calendar", label: "Calendar", icon: Calendar },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentItem = NAV_ITEMS.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path.split("/:")[0]),
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="border-b border-white/[0.08] bg-[#0d1b2a]/80 backdrop-blur-md">
          <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Wordmark */}
            <Link to="/activities" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-full border border-[#c4714a]/60 flex items-center justify-center">
                <Globe size={13} className="text-[#c4714a]" />
              </div>
              <span className="font-serif text-[#f5f0e8] text-lg tracking-tight leading-none">
                Globe<span className="text-[#c4714a]">Trotter</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ path, label }) => {
                const active =
                  location.pathname === path ||
                  (path !== "/activities" &&
                    location.pathname.startsWith("/trips"));
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`px-4 py-1.5 text-sm font-medium rounded transition-all duration-200 ${
                      isActive
                        ? "text-[#f5f0e8] bg-white/[0.08]"
                        : "text-[#f5f0e8]/50 hover:text-[#f5f0e8]/80 hover:bg-white/[0.04]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {currentItem && (
                <span className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#c4714a]/70 border border-[#c4714a]/20 px-2.5 py-1 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-[#c4714a] inline-block" />
                  {currentItem.label}
                </span>
              )}
              <button
                className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                aria-label="Profile"
              >
                <User size={14} className="text-[#f5f0e8]/60" />
              </button>
              {/* Mobile menu button */}
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center text-[#f5f0e8]/60 hover:text-[#f5f0e8]"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/[0.08] animate-fade-in">
            <nav className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all ${
                      isActive
                        ? "text-[#f5f0e8] bg-white/[0.08]"
                        : "text-[#f5f0e8]/50 hover:text-[#f5f0e8]/80"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#0d1b2a]/90 backdrop-blur-md">
        <div className="flex">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-[#c4714a]"
                    : "text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
