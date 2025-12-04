import { createContext, useContext, useState, useEffect } from 'react';

const SupermarketContext = createContext();

export function SupermarketProvider({ children }) {
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('guia_mercado_supermarket');
    if (saved) {
      try {
        setSelectedSupermarket(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved supermarket", e);
      }
    }
  }, []);

  const setSupermarket = (supermarket) => {
    setSelectedSupermarket(supermarket);
    if (supermarket) {
      localStorage.setItem('guia_mercado_supermarket', JSON.stringify(supermarket));
    } else {
      localStorage.removeItem('guia_mercado_supermarket');
    }
  };

  return (
    <SupermarketContext.Provider value={{ selectedSupermarket, setSupermarket }}>
      {children}
    </SupermarketContext.Provider>
  );
}

export function useSupermarket() {
  return useContext(SupermarketContext);
}
