import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { UNKNOWN_CAPABILITIES, fetchCapabilities } from '../lib/api';
import type { ServerCapabilities } from '../types';

interface ServerStatusValue {
  capabilities: ServerCapabilities;
  refresh: () => void;
}

const ServerStatusContext = createContext<ServerStatusValue>({
  capabilities: UNKNOWN_CAPABILITIES,
  refresh: () => undefined,
});

/**
 * One health check for the whole app. Tools use it to advertise server
 * capabilities (for example whether LibreOffice conversions are available)
 * instead of failing at the last moment.
 */
export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<ServerCapabilities>(UNKNOWN_CAPABILITIES);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCapabilities((current) => ({ ...current, checking: true }));
    fetchCapabilities(controller.signal)
      .then((next) => setCapabilities({ ...next, checking: false }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setCapabilities((current) => ({ ...current, checking: false, online: false }));
      });
    return () => controller.abort();
  }, [nonce]);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);
  const value = useMemo(() => ({ capabilities, refresh }), [capabilities, refresh]);

  return <ServerStatusContext.Provider value={value}>{children}</ServerStatusContext.Provider>;
}

export function useServerStatus(): ServerStatusValue {
  return useContext(ServerStatusContext);
}
