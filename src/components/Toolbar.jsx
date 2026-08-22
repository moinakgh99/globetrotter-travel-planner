import React from "react";
import { Search, Filter, ArrowUpDown, Layers, X } from "lucide-react";

const Toolbar = ({
  searchQuery = "",
  onSearchChange = () => {},
  selectedRegion = "",
  onRegionChange = () => {},
  selectedCostIndex = "",
  onCostChange = () => {},
  sortBy = "popularity",
  onSortChange = () => {},
  groupBy = "none",
  onGroupChange = () => {},
  regionsList = ["Europe", "Asia", "North America", "South America", "Africa", "Oceania"],
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 h-4 text-slate-400" />
          </div>
          <input
            id="toolbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for cities, activities (e.g. Paragliding)..."
            className="w-full pl-9 pr-9 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Three Controls Row: Group by, Filter, Sort by */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Group By Control */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-200">
            <Layers className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden lg:inline">Group by:</span>
            <select
              id="toolbar-group-by"
              value={groupBy}
              onChange={(e) => onGroupChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0.5 pr-2"
            >
              <option value="none" className="bg-slate-800 text-white">None</option>
              <option value="region" className="bg-slate-800 text-white">Region</option>
            </select>
          </div>

          {/* Filter Control (Region & Cost Index) */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-200">
            <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden lg:inline">Filter:</span>
            
            {/* Region Filter */}
            <select
              id="toolbar-filter-region"
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0.5 pr-1 max-w-[110px] sm:max-w-none truncate"
            >
              <option value="" className="bg-slate-800 text-white">All Regions</option>
              {regionsList.map((reg) => (
                <option key={reg} value={reg} className="bg-slate-800 text-white">
                  {reg}
                </option>
              ))}
            </select>

            <span className="text-slate-600">|</span>

            {/* Cost Index Filter */}
            <select
              id="toolbar-filter-cost"
              value={selectedCostIndex}
              onChange={(e) => onCostChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0.5 pr-1"
            >
              <option value="" className="bg-slate-800 text-white">All Costs</option>
              <option value="1" className="bg-slate-800 text-white">$ (Cheap)</option>
              <option value="2" className="bg-slate-800 text-white">$$ (Moderate)</option>
              <option value="3" className="bg-slate-800 text-white">$$$ (Balanced)</option>
              <option value="4" className="bg-slate-800 text-white">$$$$ (High)</option>
              <option value="5" className="bg-slate-800 text-white">$$$$$ (Luxury)</option>
            </select>
          </div>

          {/* Sort By Control */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-200">
            <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden lg:inline">Sort by:</span>
            <select
              id="toolbar-sort-by"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0.5 pr-1"
            >
              <option value="popularity" className="bg-slate-800 text-white">Popularity</option>
              <option value="name" className="bg-slate-800 text-white">Name (A-Z)</option>
              <option value="cost_asc" className="bg-slate-800 text-white">Cost: Low to High</option>
              <option value="cost_desc" className="bg-slate-800 text-white">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
