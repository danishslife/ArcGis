import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import buildLayerDefinitionExpression, {
  type LayerFilters,
} from "../utils/buildLayerDefinitionExpression";

export type AreaInstitution = {
  uniId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  website?: string;
};

export type AreaResults = {
  institutions: AreaInstitution[];
  // Total matching the drawn shape. Larger than institutions.length when the
  // service's 2000-feature cap kicks in.
  total: number;
};

interface CollegesUniversitiesContextType {
  collegesLayerRef: RefObject<FeatureLayer | null>;
  filters: LayerFilters;
  setFilter: (partial: Partial<LayerFilters>) => void;
  reapplyLayerFilters: () => void;
  areaResults: AreaResults | null;
  setAreaResults: (results: AreaResults | null) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

const CollegesUniversitiesContext = createContext<
  CollegesUniversitiesContextType | undefined
>(undefined);

export function CollegesUniversitiesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const collegesLayerRef = useRef<FeatureLayer | null>(null);
  const filtersRef = useRef<LayerFilters>({});
  const [filters, setFilters] = useState<LayerFilters>({});
  const [areaResults, setAreaResults] = useState<AreaResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const applyToLayer = useCallback((next: LayerFilters) => {
    filtersRef.current = next;
    const layer = collegesLayerRef.current;
    if (layer) {
      layer.definitionExpression = buildLayerDefinitionExpression(next);
    }
  }, []);

  const setFilter = useCallback(
    (partial: Partial<LayerFilters>) => {
      const next = { ...filtersRef.current, ...partial };
      setFilters(next);
      applyToLayer(next);
    },
    [applyToLayer],
  );

  const reapplyLayerFilters = useCallback(() => {
    applyToLayer(filtersRef.current);
  }, [applyToLayer]);

  return (
    <CollegesUniversitiesContext.Provider
      value={{
        collegesLayerRef,
        filters,
        setFilter,
        reapplyLayerFilters,
        areaResults,
        setAreaResults,
        isSearching,
        setIsSearching,
      }}
    >
      {children}
    </CollegesUniversitiesContext.Provider>
  );
}

export function useCollegesUniversities() {
  const context = useContext(CollegesUniversitiesContext);
  if (!context) {
    throw new Error(
      "useCollegesUniversities must be used within CollegesUniversitiesProvider",
    );
  }
  return context;
}
