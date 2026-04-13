'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, FileText, Flame, ArrowUpRight } from 'lucide-react';

export default function WarrantsPage() {
  const { theme } = useTheme();
  const { warrantLog } = useData();
  const isPolice = theme === 'police';

  const [query, setQuery] = useState('');
  const [urgencyRange, setUrgencyRange] = useState<[number, number]>([0, 100]);
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const filteredWarrants = useMemo(() => {
    let result = [...warrantLog].filter((w) => {
      const targetIdStr = String(w.targetId || '').toLowerCase();
      const idStr = String(w.id || '').toLowerCase();
      const searchStr = query.toLowerCase();

      const matchesQuery = targetIdStr.includes(searchStr) || idStr.includes(searchStr);
      const matchesUrgency = w.urgency >= urgencyRange[0] && w.urgency <= urgencyRange[1];

      return matchesQuery && matchesUrgency;
    });

    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [warrantLog, query, urgencyRange, sortOrder]);

  return (
    <div className="min-h-screen p-6 pt-24 lg:p-12 lg:pt-28 pb-24 overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-l-4 border-(--accent-primary) pl-6">
          <h1 className="text-2xl font-mono font-bold uppercase tracking-[0.3em] text-(--text-primary) mb-2">
            {isPolice ? 'Transmission Log' : 'Order Manifest'}
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-(--text-muted)">
            {isPolice ? 'Historical arrest warrants and tactical authorizations.' : 'Logged burn orders and system purge commands.'}
          </p>
        </div>

        {/* Tactical Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 border border-(--border-color) bg-(--bg-surface)">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search by ID or Target..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border border-(--border-color) font-mono text-sm text-(--text-primary) outline-none focus:border-(--accent-primary)"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Dual Range Urgency Slider */}
            <div className="flex flex-col gap-3 min-w-[280px]">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                <span className="text-(--text-muted)">Urgency Threshold (%)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={urgencyRange[1] - 1}
                    value={urgencyRange[0]}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(Number(e.target.value), urgencyRange[1] - 1));
                      setUrgencyRange([val, urgencyRange[1]]);
                    }}
                    className="w-12 bg-black/40 border border-(--border-color) p-1 text-(--accent-primary) text-center outline-none focus:border-(--accent-primary)"
                  />
                  <span className="text-(--text-muted)">—</span>
                  <input
                    type="number"
                    min={urgencyRange[0] + 1}
                    max="100"
                    value={urgencyRange[1]}
                    onChange={(e) => {
                      const val = Math.max(urgencyRange[0] + 1, Math.min(Number(e.target.value), 100));
                      setUrgencyRange([urgencyRange[0], val]);
                    }}
                    className="w-12 bg-black/40 border border-(--border-color) p-1 text-(--accent-primary) text-center outline-none focus:border-(--accent-primary)"
                  />
                </div>
              </div>
              
              <div className="relative h-6 flex items-center">
                {/* Track Background */}
                <div className="absolute w-full h-1 bg-black/20 border border-(--border-color)" />
                {/* Active Range Highlight */}
                <div 
                  className="absolute h-1 bg-(--accent-primary)/30"
                  style={{ 
                    left: `${urgencyRange[0]}%`, 
                    width: `${urgencyRange[1] - urgencyRange[0]}%` 
                  }}
                />
                
                {/* Min Slider handled via z-index logic if needed, but standard stacking often works if pointer events are right */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={urgencyRange[0]}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), urgencyRange[1] - 1);
                    setUrgencyRange([val, urgencyRange[1]]);
                  }}
                  style={{ zIndex: urgencyRange[0] > 50 ? 5 : 4 }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:bg-(--accent-primary) [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:bg-(--accent-primary) [&::-moz-range-thumb]:border-none"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={urgencyRange[1]}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), urgencyRange[0] + 1);
                    setUrgencyRange([urgencyRange[0], val]);
                  }}
                  style={{ zIndex: urgencyRange[1] < 50 ? 5 : 4 }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:bg-(--accent-primary) [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:bg-(--accent-primary) [&::-moz-range-thumb]:border-none"
                />
              </div>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="flex items-center gap-2 h-9 px-6 border border-(--border-color) font-mono text-xs text-(--text-primary) hover:bg-(--accent-primary) hover:text-black transition-colors"
            >
              {sortOrder === 'NEWEST' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              {sortOrder === 'NEWEST' ? 'RECENCY: DESC' : 'RECENCY: ASC'}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-(--border-color) bg-(--bg-surface)">
          <table className="w-full text-left font-mono border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-(--border-color) text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
                <th className="p-4">Entry ID</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Intel</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredWarrants.length > 0 ? (
                  filteredWarrants.map((w) => (
                    <motion.tr
                      key={w.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      layout
                      className="border-b border-(--border-color)/50 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 text-sm font-bold text-(--text-primary)">{w.id}</td>
                      <td className="p-4 text-xs text-(--accent-primary)">
                        <span className="flex items-center gap-2">
                          {w.targetId}
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-(--text-muted)">
                        {new Date(w.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] px-2 py-0.5 border ${
                          w.type === 'WARRANT' ? 'border-blue-500 text-blue-500' : 'border-red-500 text-red-500'
                        }`}>
                          {w.type}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                            URGENCY: {w.urgency}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="p-20 text-center text-[10px] uppercase tracking-[0.3em] text-(--text-muted)">
                      No matching transmissions found in local cache.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
