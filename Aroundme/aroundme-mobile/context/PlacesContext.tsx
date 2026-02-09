import React, { createContext, useContext, useState, ReactNode } from "react";

type Place = {
  _id?: string;
  id?: string;
  type: string;
  properties: Record<string, any>;
  geometry: { type: string; coordinates: [number, number] };
};

type PlacesContextType = {
  places: Place[];
  setPlaces: (places: Place[]) => void;
};

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);

  return (
    <PlacesContext.Provider value={{ places, setPlaces }}>
      {children}
    </PlacesContext.Provider>
  );
}

// Hook pratique pour utiliser le contexte
export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error("usePlaces doit être utilisé dans un PlacesProvider");
  }
  return context;
}
