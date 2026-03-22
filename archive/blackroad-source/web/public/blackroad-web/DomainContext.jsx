import { createContext, useContext, useMemo } from 'react';
import { getDomainConfig } from './domains';

const DomainContext = createContext(null);

export function DomainProvider({ children }) {
  const config = useMemo(() => {
    // Dev override: ?domain=lucidia.earth to test any domain locally
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      const override = params.get('domain');
      if (override) return getDomainConfig(override);
    }
    return getDomainConfig(window.location.hostname);
  }, []);

  return <DomainContext.Provider value={config}>{children}</DomainContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDomain() {
  return useContext(DomainContext);
}
