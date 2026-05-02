import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getClients } from '../lib/api';
import { getToken } from '../lib/auth';

const ClientContext = createContext(null);

const STORAGE_KEY = 'selectedClientId';

function getStoredClientId() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (_) { return null; }
}

function setStoredClientId(id) {
  if (id == null) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
}

export function ClientProvider({ children }) {
  const isLoggedIn = Boolean(getToken());
  const qc = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const [selectedClientId, setSelectedClientIdState] = useState(() => getStoredClientId());

  // Auto-select default client once clients load
  useEffect(() => {
    if (!clients.length) return;
    const stored = getStoredClientId();
    const stillValid = stored && clients.some((c) => c.id === stored);
    if (!stillValid) {
      const def = clients.find((c) => c.isDefault) || clients[0];
      setSelectedClientIdState(def.id);
      setStoredClientId(def.id);
    }
  }, [clients]);

  function setSelectedClientId(id) {
    setSelectedClientIdState(id);
    setStoredClientId(id);
    // Invalidate all data queries so they refetch for the new client
    qc.invalidateQueries({ queryKey: ['sessions'] });
    qc.invalidateQueries({ queryKey: ['payments'] });
    qc.invalidateQueries({ queryKey: ['summary'] });
    qc.invalidateQueries({ queryKey: ['monthly'] });
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;

  return (
    <ClientContext.Provider value={{ clients, selectedClient, selectedClientId, setSelectedClientId, isLoading }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClient must be used inside ClientProvider');
  return ctx;
}
