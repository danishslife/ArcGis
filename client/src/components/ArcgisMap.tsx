/// <reference types="@arcgis/map-components/types/react" />
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";
import { useRef } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Geometry from "@arcgis/core/geometry/Geometry.js";
import MapView from "@arcgis/core/views/MapView.js";
import MapViewConstraints from "@arcgis/core/views/2d/MapViewConstraints.js";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-sketch";

const INITIAL_CENTER: [number, number] = [-98.5795, 39.8283];
const INITIAL_ZOOM = 3;

const MIN_ZOOM = INITIAL_ZOOM;

const COLLEGES_UNIVERSITIES_URL =
  "https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Colleges_and_Universities_View/FeatureServer/0";

// The six fields the saved-universities API expects.
const INSTITUTION_OUT_FIELDS = [
  "UNITID",
  "INSTNM",
  "ADDR",
  "CITY",
  "STABBR",
  "WEBADDR",
] as const;

// The service returns at most this many features per query.
const MAX_RECORD_COUNT = 2000;

const INSTITUTION_POPUP_TEMPLATE = {
  title: "{INSTNM}",
  content: [
    {
      type: "fields" as const,
      fieldInfos: [
        { fieldName: "ADDR", label: "Address" },
        { fieldName: "CITY", label: "City" },
        { fieldName: "STABBR", label: "State" },
        { fieldName: "WEBADDR", label: "Website" },
        { fieldName: "CBSATYPE", label: "CBSA Type" },
      ],
    },
  ],
};

// Layer values are inconsistent: some include https://, some are bare hosts.
function normalizeWebsite(value: unknown): string | undefined {
  const website = value ? String(value).trim() : "";
  if (!website) return undefined;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export default function ArcgisMap() {
  const viewRef = useRef<MapView | null>(null);
  const {
    collegesLayerRef,
    reapplyLayerFilters,
    setAreaResults,
    setIsSearching,
  } = useCollegesUniversities();

  const readCamera = (event: Event) => {
    const target = event.target as HTMLArcgisMapElement;
    const lon = target.center?.longitude;
    const lat = target.center?.latitude;
    if (lon == null || lat == null) return;
  };

  const handleReady = (event: Event) => {
    readCamera(event);

    const target = event.target as HTMLArcgisMapElement;
    viewRef.current = target.view;
    target.constraints = new MapViewConstraints({ minZoom: MIN_ZOOM });

    const collegesLayer = new FeatureLayer({
      url: COLLEGES_UNIVERSITIES_URL,
      title: "Colleges and Universities (U.S.)",
      outFields: ["*"],
      definitionExpression: "1=1",
      popupEnabled: true,
      popupTemplate: INSTITUTION_POPUP_TEMPLATE,
    });

    collegesLayerRef.current = collegesLayer;
    target.map?.add(collegesLayer);
    reapplyLayerFilters();
  };

  const handleError = (event: CustomEvent) => {
    console.error("View failed to initialize", event.detail?.error);
  };

  // Finishing a new shape emits a create event, then an update event with
  // state "start" (creation-mode="update" selects it straight away). Without
  // this the results only appeared once the shape was moved or resized.
  const handleSketchCreate = (event: CustomEvent) => {
    if (event.detail.state !== "complete") {
      return;
    }

    const geometry = event.detail.graphic?.geometry;
    if (!geometry) {
      return;
    }

    void runInstitutionsInAreaQuery(geometry);
  };

  const handleSketchDelete = () => {
    viewRef.current?.graphics.removeAll();
    setAreaResults(null);
  };

  const handleSketchUpdate = (event: CustomEvent) => {
    // Deleting a shape cancels the update operation, which emits a final
    // "complete" event still carrying the deleted graphic. Re-querying on it
    // would bring the results panel back for a shape that no longer exists.
    if (event.detail.aborted) {
      return;
    }

    const geometry = event.detail.graphics[0]?.geometry;
    if (!geometry) {
      handleSketchDelete();
      return;
    }

    const state = event.detail.state;
    const toolDone =
      event.detail.toolEventInfo?.type === "scale-stop" ||
      event.detail.toolEventInfo?.type === "reshape-stop" ||
      event.detail.toolEventInfo?.type === "move-stop";

    if (state === "complete" || toolDone) {
      void runInstitutionsInAreaQuery(geometry);
    }
  };

  const runInstitutionsInAreaQuery = async (geometry: Geometry) => {
    const layer = collegesLayerRef.current;
    if (!layer) return;

    setIsSearching(true);

    try {
      // The count is asked for separately so a shape holding more than 2000
      // schools can say how many were left out instead of silently truncating.
      const [total, result] = await Promise.all([
        layer.queryFeatureCount({
          geometry,
          spatialRelationship: "intersects",
        }),
        layer.queryFeatures({
          geometry,
          spatialRelationship: "intersects",
          outFields: [...INSTITUTION_OUT_FIELDS],
          returnGeometry: false,
          orderByFields: ["INSTNM"],
          num: MAX_RECORD_COUNT,
        }),
      ]);

      const institutions = result.features
        .map((feature) => feature.attributes as Record<string, unknown>)
        .filter((attrs) => attrs.UNITID != null)
        .map((attrs) => ({
          uniId: Number(attrs.UNITID),
          name: String(attrs.INSTNM ?? "Unknown institution"),
          address: String(attrs.ADDR ?? ""),
          city: String(attrs.CITY ?? ""),
          state: String(attrs.STABBR ?? ""),
          website: normalizeWebsite(attrs.WEBADDR),
        }));

      setAreaResults({ institutions, total });
    } catch (error) {
      console.error("Area query failed", error);
      setAreaResults({ institutions: [], total: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="map-container">
      <arcgis-map
        basemap="arcgis/streets"
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        onarcgisViewReadyChange={handleReady}
        onarcgisViewReadyError={handleError}
        onarcgisViewChange={readCamera}
      >
        <arcgis-zoom slot="bottom-left"></arcgis-zoom>
        <arcgis-sketch
          creation-mode="update"
          slot="bottom-right"
          onarcgisCreate={(event) => handleSketchCreate(event)}
          onarcgisUpdate={(event) => handleSketchUpdate(event)}
          onarcgisDelete={handleSketchDelete}
        ></arcgis-sketch>
      </arcgis-map>
    </div>
  );
}
