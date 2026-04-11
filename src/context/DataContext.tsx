'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MOCK_PROFILES, type ProfileData } from '@/lib/profileData';

interface WarrantEntry {
  id: string;
  targetId: string;
  timestamp: string;
  urgency: number;
  justification: string;
  type: 'WARRANT' | 'BURN';
}

interface DataContextType {
  profiles: ProfileData[];
  warrantLog: WarrantEntry[];
  addProfile: (profile: ProfileData) => void;
  deleteProfile: (id: string) => void;
  updateProfileStatus: (id: string, policeStatus: ProfileData['policeStatus'], mafiaStatus: ProfileData['mafiaStatus']) => void;
  addWarrant: (warrant: WarrantEntry) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ProfileData[]>(MOCK_PROFILES);
  const [warrantLog, setWarrantLog] = useState<WarrantEntry[]>([]);

  const addProfile = useCallback((newProfile: ProfileData) => {
    setProfiles((prev) => [newProfile, ...prev]);
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProfileStatus = useCallback((id: string, policeStatus: ProfileData['policeStatus'], mafiaStatus: ProfileData['mafiaStatus']) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, policeStatus, mafiaStatus }
          : p
      )
    );
  }, []);

  const addWarrant = useCallback((entry: WarrantEntry) => {
    setWarrantLog((prev) => [entry, ...prev]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        profiles,
        warrantLog,
        addProfile,
        deleteProfile,
        updateProfileStatus,
        addWarrant,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
