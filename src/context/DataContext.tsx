'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ProfileData } from '@/lib/profileData';

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
  [key: string]: any; // Fallback for unknown incident fields
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

// Helpers to map between Django snake_case JSON and frontend camelCase shapes
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

function mapWarrantToFrontend(data: any): WarrantEntry {
  return {
    id: String(data.id),
    targetId: data.target_id ? String(data.target_id) : '',
    timestamp: data.timestamp || new Date().toISOString(),
    urgency: data.urgency || 0,
    justification: data.justification || '',
    type: data.type_warrant || 'WARRANT',
  };
}

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
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [warrantLog, setWarrantLog] = useState<WarrantEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);

  // Internal API Fetch helper that attaches JWT and handles 401s + Token Refresh
  const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}, isRetry = false): Promise<Response> => {
    const token = localStorage.getItem('access');
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${apiUrl}${endpoint}`, { ...options, headers });

    // Handle 401 (Unauthorized) errors
    if (response.status === 401) {
      // If we already tried refreshing once and still got a 401, give up
      if (isRetry) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        router.replace('/');
        throw new Error('Unauthorized');
      }

      // Attempt to refresh the token
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
            // Store the new access token
            localStorage.setItem('access', data.access);
            
            // Retry the original request with isRetry set to true
            return apiFetch(endpoint, options, true);
          }
        } catch (error) {
          console.error('Token refresh execution failed:', error);
        }
      }

      // If no refresh token or refresh failed, purge session
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      router.replace('/');
      throw new Error('Unauthorized');
    }

    return response;
  }, [router]);

  // Centralized data refresh logic
  const refreshData = useCallback(async () => {
    try {
      // Parallel fetching
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
        setWarrantLog(Array.isArray(data) ? data.map(mapWarrantToFrontend).reverse() : []);
      }

      if (incidentsRes?.ok) {
        const data = await incidentsRes.json();
        setIncidents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Data refresh cycle failed:', error);
    }
  }, [apiFetch]);

  // Establish initial load and polling heart-rate
  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('access');
    
    if (hasToken) {
      // Initial trigger
      refreshData();

      // Aggressive 5s polling for tactical demo responsiveness
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
    try {
      const res = await apiFetch(`/criminals/${id}/`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
      }
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
        setWarrantLog((prev) => [mapWarrantToFrontend(savedData), ...prev]);

        // Action consequences
        if (entry.type === 'BURN') {
          await deleteProfile(entry.targetId);
        } else if (entry.type === 'WARRANT') {
          const target = profiles.find((p) => p.id === entry.targetId);
          if (target) {
            await updateProfileStatus(entry.targetId, 'CUSTODY', target.mafiaStatus);
          }
        }
      }
    } catch (e) {
      console.error('addWarrant failed', e);
    }
  }, [apiFetch, deleteProfile, updateProfileStatus, profiles]);

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
