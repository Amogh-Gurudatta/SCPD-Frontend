'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_PROFILES } from '@/lib/profileData';
import FilterBar from '@/components/database/FilterBar';
import ProfileCard from '@/components/database/ProfileCard';

export default function DatabasePage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState('ALL');
  
  const { theme } = useTheme();
  const isPolice = theme === 'police';

  const filteredProfiles = useMemo(() => {
    return MOCK_PROFILES.filter((profile) => {
      const name = isPolice ? profile.policeName : profile.mafiaName;
      const status = isPolice ? profile.policeStatus : profile.mafiaStatus;
      const threat = isPolice ? profile.policeThreat : profile.mafiaThreat;

      // Match query
      if (query && !name.toLowerCase().includes(query.toLowerCase())) {
        // Also allow searching by ID
        if (!profile.id.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }

      // Match Status
      if (statusFilter !== 'ALL' && status !== statusFilter) {
        return false;
      }

      // Match Threat
      if (threatFilter !== 'ALL' && threat !== threatFilter) {
        return false;
      }

      return true;
    });
  }, [query, statusFilter, threatFilter, isPolice]);

  return (
    <div className="min-h-screen relative overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
      <FilterBar 
        query={query} 
        setQuery={setQuery} 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        threatFilter={threatFilter}
        setThreatFilter={setThreatFilter}
      />
      
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 opacity-50">
            <p className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              No matches found in active database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
