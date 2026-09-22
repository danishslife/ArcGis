/// <reference types="@arcgis/map-components/types/react" />
import { useState } from "react";
import type MapView from "@arcgis/core/views/MapView.js";
import MapViewConstraints from "@arcgis/core/views/2d/MapViewConstraints.js";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";
import usePopupSaveAction from "../hooks/usePopupSaveAction";
import { INITIAL_CENTER, INITIAL_ZOOM, MIN_ZOOM } from "../config/mapConfig";
import { createCollegesLayer } from "../utils/institutionUtils";
import MapSketchTool from "./MapSketchTool";

export default function ArcgisMap() {
  const [view, setView] = useState<MapView | null>(null);
  const { collegesLayerRef, reapplyLayerFilters } = useCollegesUniversities();

  usePopupSaveAction(view);

  const handleReady = (event: Event) => {
    const target = event.target as HTMLArcgisMapElement;
    target.constraints = new MapViewConstraints({ minZoom: MIN_ZOOM });

    const collegesLayer = createCollegesLayer();
    collegesLayerRef.current = collegesLayer;
    target.map?.add(collegesLayer);
    reapplyLayerFilters();

    setView(target.view);
  };

  const handleError = (event: CustomEvent) => {
    console.error("View failed to initialize", event.detail?.error);
  };

  return (
    <div className="map-container">
      <arcgis-map
        basemap="arcgis/streets"
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        onarcgisViewReadyChange={handleReady}
        onarcgisViewReadyError={handleError}
      >
        <arcgis-zoom slot="bottom-left"></arcgis-zoom>
        <MapSketchTool view={view} />
      </arcgis-map>
    </div>
  );
}
