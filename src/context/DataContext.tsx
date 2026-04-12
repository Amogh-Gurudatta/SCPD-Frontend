'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ProfileData } from '@/lib/profileData';
import { useTheme } from '@/context/ThemeContext';

export interface WarrantEntry {
  id: string;
  targetId: string;
  timestamp: string;
  urgency: number;
  justification: string;
  type: 'WARRANT' | 'BURN';
}

export interface IncidentData {
  id: string;
  title?: string;
  description?: string;
  timestamp?: string;
  [key: string]: any;
}

interface DataContextType {
  profiles: ProfileData[];
  warrantLog: WarrantEntry[];
  incidents: IncidentData[];
  addProfile: (profile: ProfileData) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  updateProfileStatus: (id: string, policeStatus: ProfileData['policeStatus'], mafiaStatus: ProfileData['mafiaStatus']) => Promise<void>;
  addWarrant: (warrant: WarrantEntry) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function mapSuspectToFrontend(data: any): ProfileData {
  return {
    id: data.id,
    policeName: data.police_name || '',
    mafiaName: data.mafia_name || '',
    policeStatus: data.police_status || 'ACTIVE',
    mafiaStatus: data.mafia_status || 'ONLINE',
    policeThreat: data.police_threat || 'LOW',
    mafiaThreat: data.mafia_threat || 'LOW',
    policeNotes: data.police_notes || '',
    mafiaNotes: data.mafia_notes || '',
  };
}

function mapSuspectToBackend(data: Partial<ProfileData>): any {
  return {
    ...(data.id && { id: data.id }),
    ...(data.policeName && { police_name: data.policeName }),
    ...(data.mafiaName && { mafia_name: data.mafiaName }),
    ...(data.policeStatus && { police_status: data.policeStatus }),
    ...(data.mafiaStatus && { mafia_status: data.mafiaStatus }),
    ...(data.policeThreat && { police_threat: data.policeThreat }),
    ...(data.mafiaThreat && { mafia_threat: data.mafiaThreat }),
    ...(data.policeNotes && { police_notes: data.policeNotes }),
    ...(data.mafiaNotes && { mafia_notes: data.mafiaNotes }),
  };
}

// FIXED: Properly reads type_warrant from the Django backend
function mapWarrantToFrontend(data: any): WarrantEntry {
  return {
    id: data.id,
    targetId: data.target_id || '',
    timestamp: data.timestamp || new Date().toISOString(),
    urgency: data.urgency || 0,
    justification: data.justification || '',
    type: data.type_warrant || data.type || 'WARRANT',
  };
}

// FIXED: Properly formats type_warrant for the Django backend
function mapWarrantToBackend(data: Partial<WarrantEntry>): any {
  return {
    ...(data.id && { id: data.id }),
    ...(data.targetId && { target_id: data.targetId }),
    ...(data.timestamp && { timestamp: data.timestamp }),
    ...(typeof data.urgency !== 'undefined' && { urgency: data.urgency }),
    ...(data.justification && { justification: data.justification }),
    ...(data.type && { type_warrant: data.type }),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme } = useTheme(); // Pull in the current UI theme
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [warrantLog, setWarrantLog] = useState<WarrantEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);

  const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}, isRetry = false): Promise<Response> => {
    const token = localStorage.getItem('access');
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${apiUrl}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
      if (isRetry) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        router.replace('/');
        throw new Error('Unauthorized');
      }

      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const refreshRes = await fetch(`${apiUrl}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('access', data.access);
            return apiFetch(endpoint, options, true);
          }
        } catch (error) {
          console.error('Token refresh execution failed:', error);
        }
      }

      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      router.replace('/');
      throw new Error('Unauthorized');
    }

    return response;
  }, [router]);

  const refreshData = useCallback(async () => {
    try {
      const [criminalsRes, warrantsRes, incidentsRes] = await Promise.all([
        apiFetch('/criminals/').catch(() => null),
        apiFetch('/warrants/').catch(() => null),
        apiFetch('/incidents/').catch(() => null),
      ]);

      if (criminalsRes?.ok) {
        const data = await criminalsRes.json();
        setProfiles(Array.isArray(data) ? data.map(mapSuspectToFrontend) : []);
      }

      if (warrantsRes?.ok) {
        const data = await warrantsRes.json();
        if (Array.isArray(data)) {
          let mapped = data.map(mapWarrantToFrontend);

          // STRICT FRONTEND SANDBOXING: Enforce UI visual separation 
          // regardless of the user's permanent backend group state.
          if (theme === 'police') {
            mapped = mapped.filter(w => w.type === 'WARRANT');
          } else if (theme === 'mafia') {
            mapped = mapped.filter(w => w.type === 'BURN');
          }

          // Sort chronologically (newest first)
          setWarrantLog(mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } else {
          setWarrantLog([]);
        }
      }

      if (incidentsRes?.ok) {
        const data = await incidentsRes.json();
        setIncidents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Data refresh cycle failed:', error);
    }
  }, [apiFetch, theme]); // Re-run data filter when theme swaps

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('access');

    if (hasToken) {
      refreshData();
      const intervalId = setInterval(refreshData, 5000);
      return () => clearInterval(intervalId);
    }
  }, [refreshData]);

  const addProfile = useCallback(async (newProfile: ProfileData) => {
    try {
      const payload = mapSuspectToBackend(newProfile);
      const res = await apiFetch('/criminals/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 201) {
        const savedData = await res.json();
        setProfiles((prev) => [mapSuspectToFrontend(savedData), ...prev]);
      }
    } catch (e) {
      console.error('addProfile failed', e);
    }
  }, [apiFetch]);

  const deleteProfile = useCallback(async (id: string) => {
    const res = await apiFetch(`/criminals/${id}/`, {
      method: 'DELETE',
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Delete failed: ${res.status}`);
    }

    setProfiles((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }, [apiFetch]);

  const updateProfileStatus = useCallback(async (id: string, policeStatus: ProfileData['policeStatus'], mafiaStatus: ProfileData['mafiaStatus']) => {
    try {
      const payload = mapSuspectToBackend({ policeStatus, mafiaStatus });
      const res = await apiFetch(`/criminals/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, policeStatus, mafiaStatus }
              : p
          )
        );
      }
    } catch (e) {
      console.error('updateProfileStatus failed', e);
    }
  }, [apiFetch]);

  const addWarrant = useCallback(async (entry: WarrantEntry) => {
    try {
      const payload = mapWarrantToBackend(entry);
      const res = await apiFetch('/warrants/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 201) {
        const savedData = await res.json();
        const mapped = mapWarrantToFrontend(savedData);

        // Only insert into UI immediately if it belongs in this theme
        if ((theme === 'police' && mapped.type === 'WARRANT') ||
          (theme === 'mafia' && mapped.type === 'BURN')) {
          setWarrantLog((prev) => [mapped, ...prev]);
        }

        // TACTICAL CONSEQUENCES
        if (mapped.type === 'BURN') {
          await deleteProfile(mapped.targetId);
        } else if (mapped.type === 'WARRANT') {
          const target = profiles.find(p => p.id === mapped.targetId);
          if (target) {
            await updateProfileStatus(mapped.targetId, 'CUSTODY', target.mafiaStatus);
          }
        }
      }
    } catch (e) {
      console.error('addWarrant failed', e);
    }
  }, [apiFetch, theme, deleteProfile, updateProfileStatus, profiles]);

  return (
    <DataContext.Provider
      value={{
        profiles,
        warrantLog,
        incidents,
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