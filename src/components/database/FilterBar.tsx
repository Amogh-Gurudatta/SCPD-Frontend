'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { Search, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import AddRecordModal from './AddRecordModal';

interface FilterBarProps {
  query: string;
  setQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  threatFilter: string;
  setThreatFilter: (val: string) => void;
  onAddRecord: () => void;
}

export default function FilterBar({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  threatFilter,
  setThreatFilter,
  onAddRecord,
}: FilterBarProps) {
  const { theme } = useTheme();
  const isPolice = theme === 'police';

  return (
    <div
      className="sticky top-0 z-10 w-full p-4 mb-6 transition-colors duration-200"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto items-center">
        {/* Search Input & Add Button */}
        <div className="flex gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isPolice ? 'Search Suspects...' : 'Search Targets...'}
              className="w-full pl-10 pr-4 py-2 text-sm font-mono outline-none transition-colors duration-200"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
            />
          </div>
          
          <button
            onClick={onAddRecord}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all shrink-0 border border-[var(--accent-primary)] text-[var(--accent-primary)] cursor-pointer ${
              isPolice 
                ? 'hover:bg-[#2563eb] hover:text-white hover:border-[#2563eb]' 
                : 'hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626]'
            }`}
          >
            {isPolice ? <UserPlus size={14} /> : <Plus size={14} />}
            <span className="hidden sm:inline">{isPolice ? 'Add Record' : 'Inject Node'}</span>
          </button>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[10px] font-mono uppercase tracking-widest text-nowrap" style={{ color: 'var(--text-muted)' }}>
            {isPolice ? 'Service Status:' : 'Uplink Status:'}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-sm font-mono outline-none cursor-pointer appearance-none transition-colors duration-200"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
          >
            <option value="ALL" className="bg-[#000] text-white">ALL</option>
            {isPolice ? (
              <>
                <option value="ACTIVE" className="bg-[#000] text-white">ACTIVE</option>
                <option value="WANTED" className="bg-[#000] text-white">WANTED</option>
                <option value="CUSTODY" className="bg-[#000] text-white">CUSTODY</option>
              </>
            ) : (
              <>
                <option value="ONLINE" className="bg-[#000] text-white">ONLINE</option>
                <option value="BURNED" className="bg-[#000] text-white">BURNED</option>
                <option value="COMPROMISED" className="bg-[#000] text-white">COMPROMISED</option>
              </>
            )}
          </select>
        </div>

        {/* Threat Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[10px] font-mono uppercase tracking-widest text-nowrap" style={{ color: 'var(--text-muted)' }}>
            {isPolice ? 'Priority:' : 'Hazard Level:'}
          </label>
          <select
            value={threatFilter}
            onChange={(e) => setThreatFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-sm font-mono outline-none cursor-pointer appearance-none transition-colors duration-200"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
          >
            <option value="ALL" className="bg-[#000] text-white">ALL</option>
            <option value="LOW" className="bg-[#000] text-white">LOW</option>
            <option value="MEDIUM" className="bg-[#000] text-white">MEDIUM</option>
            <option value="HIGH" className="bg-[#000] text-white">HIGH</option>
          </select>
        </div>
      </div>
    </div>
  );
}
