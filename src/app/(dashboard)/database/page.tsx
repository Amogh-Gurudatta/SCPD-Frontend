'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import FilterBar from '@/components/database/FilterBar';
import ProfileCard from '@/components/database/ProfileCard';
import AddRecordModal from '@/components/database/AddRecordModal';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};



export default function DatabasePage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { theme } = useTheme();
  const { profiles } = useData();
  const isPolice = theme === 'police';

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
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
  }, [profiles, query, statusFilter, threatFilter, isPolice]);

  return (
    <div className="min-h-screen relative overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
      <FilterBar 
        query={query} 
        setQuery={setQuery} 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        threatFilter={threatFilter}
        setThreatFilter={setThreatFilter}
        onAddRecord={() => setIsModalOpen(true)}
      />

      <AddRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredProfiles.map((profile) => (
              <motion.div
                layout
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <ProfileCard profile={profile} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filteredProfiles.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-20"
            >
              <p className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                No matches found in active database.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
