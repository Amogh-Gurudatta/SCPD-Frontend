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
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const filteredWarrants = useMemo(() => {
    let result = [...warrantLog].filter((w) => {
      const matchesQuery = w.targetId.toLowerCase().includes(query.toLowerCase()) || 
                           w.id.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === 'ALL' || w.type === typeFilter;
      return matchesQuery && matchesType;
    });

    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [warrantLog, query, typeFilter, sortOrder]);

  return (
    <div className="min-h-screen p-6 pt-24 lg:p-12 lg:pt-28 pb-24 overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-l-4 border-[var(--accent-primary)] pl-6">
          <h1 className="text-2xl font-mono font-bold uppercase tracking-[0.3em] text-[var(--text-primary)] mb-2">
            {isPolice ? 'Transmission Log' : 'Order Manifest'}
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
            {isPolice ? 'Historical arrest warrants and tactical authorizations.' : 'Logged burn orders and system purge commands.'}
          </p>
        </div>

        {/* Tactical Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by ID or Target..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border border-[var(--border-color)] font-mono text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-transparent border border-[var(--border-color)] font-mono text-xs text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="WARRANT">WARRANTS</option>
              <option value="BURN">BURN ORDERS</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] font-mono text-xs text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-black transition-colors"
            >
              {sortOrder === 'NEWEST' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              {sortOrder}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <table className="w-full text-left font-mono border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-[var(--border-color)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
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
                      className="border-b border-[var(--border-color)]/50 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 text-sm font-bold text-[var(--text-primary)]">{w.id}</td>
                      <td className="p-4 text-xs text-[var(--accent-primary)]">
                        <span className="flex items-center gap-2">
                          {w.targetId}
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-[var(--text-muted)]">
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
                    <td colSpan={5} className="p-20 text-center text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
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
