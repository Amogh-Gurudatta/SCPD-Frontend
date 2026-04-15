'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react';
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
  latitude: number;
  longitude: number;
  severity: number;
  incident_type: string;
  title?: string;
  description?: string;
  timestamp?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSuspectToFrontend(data: any): ProfileData {
  return {
    id: String(data.id),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSuspectToBackend(data: Partial<ProfileData>): any {
  return {
    ...(data.id !== undefined && { id: data.id }),
    ...(data.policeName !== undefined && { police_name: data.policeName }),
    ...(data.mafiaName !== undefined && { mafia_name: data.mafiaName }),
    ...(data.policeStatus !== undefined && { police_status: data.policeStatus }),
    ...(data.mafiaStatus !== undefined && { mafia_status: data.mafiaStatus }),
    ...(data.policeThreat !== undefined && { police_threat: data.policeThreat }),
    ...(data.mafiaThreat !== undefined && { mafia_threat: data.mafiaThreat }),
    ...(data.policeNotes !== undefined && { police_notes: data.policeNotes }),
    ...(data.mafiaNotes !== undefined && { mafia_notes: data.mafiaNotes }),
  };
}

// FIXED: Properly reads type_warrant from the Django backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWarrantToFrontend(data: any): WarrantEntry {
  return {
    id: String(data.id),
    targetId: data.target_id ? String(data.target_id) : '',
    timestamp: data.timestamp || new Date().toISOString(),
    urgency: data.urgency ?? 0,
    justification: data.justification || '',
    type: data.type_warrant || data.type || 'WARRANT',
  };
}

// FIXED: Properly formats type_warrant for the Django backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWarrantToBackend(data: Partial<WarrantEntry>): any {
  return {
    ...(data.id && { id: data.id }),
    ...(data.targetId && { target_id: data.targetId }),
    ...(data.timestamp && { timestamp: data.timestamp }),
    ...(typeof data.urgency !== 'undefined' && { urgency: data.urgency }),
    ...(data.justification !== undefined && { justification: data.justification }),
    ...(data.type && { type_warrant: data.type }),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIncidentToFrontend(data: any): IncidentData {
  return {
    id: String(data.id),
    latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude) : Number(data.latitude),
    longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude) : Number(data.longitude),
    severity: data.severity ?? 0,
    incident_type: data.incident_type || 'unknown',
    title: data.title || '',
    description: data.description || '',
    timestamp: data.Time || data.timestamp || new Date().toISOString(),
    location: data.Location || '',
    clandestine: data.clandestine ?? false,
    ai_generated: data.ai_generated ?? false,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme } = useTheme(); // Pull in the current UI theme
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [warrantLog, setWarrantLog] = useState<WarrantEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);

  // BUG-3 FIX: Keep a ref to profiles so callbacks always read the latest value
  const profilesRef = useRef(profiles);
  useEffect(() => { profilesRef.current = profiles; }, [profiles]);

  const apiFetch = useCallback(async function fetchApi(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<Response> {
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
            return fetchApi(endpoint, options, true);
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
        setIncidents(Array.isArray(data) ? data.map(mapIncidentToFrontend) : []);
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
        setProfiles((prev: ProfileData[]) => [mapSuspectToFrontend(savedData), ...prev]);
      }
    } catch (e) {
      console.error('addProfile failed', e);
    }
  }, [apiFetch]);

  const deleteProfile = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/criminals/${id}/`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        console.error(`Delete failed: ${res.status}`);
        return;
      }

      setProfiles((prev: ProfileData[]) => prev.filter((p: ProfileData) => String(p.id) !== String(id)));
    } catch (e) {
      console.error('deleteProfile failed', e);
    }
  }, [apiFetch]);

  const updateProfileStatus = useCallback(async (id: string, policeStatus: ProfileData['policeStatus'], mafiaStatus: ProfileData['mafiaStatus']) => {
    try {
      const payload = mapSuspectToBackend({ policeStatus, mafiaStatus });
      const res = await apiFetch(`/criminals/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setProfiles((prev: ProfileData[]) =>
          prev.map((p: ProfileData) =>
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
          setWarrantLog((prev: WarrantEntry[]) => [mapped, ...prev]);
        }

        // TACTICAL CONSEQUENCES (BURN cascade is now enforced server-side)
        if (mapped.type === 'WARRANT') {
          // BUG-3 FIX: Read from ref to avoid stale closure
          const target = profilesRef.current.find((p: ProfileData) => p.id === mapped.targetId);
          if (target) {
            await updateProfileStatus(mapped.targetId, 'CUSTODY', target.mafiaStatus);
          }
        }
      }
    } catch (e) {
      console.error('addWarrant failed', e);
    }
  }, [apiFetch, theme, deleteProfile, updateProfileStatus]);

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