/// <reference types="@arcgis/map-components/types/react" />
import {
  useCollegesUniversities,
  type AreaInstitution,
} from "../useContext/collegesUniversitiesContext";
import { useSavedUniversities } from "../useContext/savedUniversitiesContext";
import { useEffect, useRef } from "react";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import type ActionButton from "@arcgis/core/support/actions/ActionButton.js";
import type { ResourceHandle } from "@arcgis/core/core/Handles.js";
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

const SAVE_ACTION_ID = "toggle-save";

const INSTITUTION_POPUP_TEMPLATE = {
  title: "{INSTNM}",
  // A clicked feature only carries the fields its popup template asks for.
  // UNITID is never displayed, so without this the save button has no id.
  outFields: [...INSTITUTION_OUT_FIELDS],
  actions: [
    {
      type: "button" as const,
      id: SAVE_ACTION_ID,
      title: "Save university",
      icon: "heart" as const,
    },
  ],
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

// Shared by the sketch results and the popup's save button, so a university
// is saved with the same shape wherever the user found it.
function toAreaInstitution(
  attrs: Record<string, unknown> | null | undefined,
): AreaInstitution | null {
  if (!attrs || attrs.UNITID == null) return null;

  return {
    uniId: Number(attrs.UNITID),
    name: String(attrs.INSTNM ?? "Unknown institution"),
    address: String(attrs.ADDR ?? ""),
    city: String(attrs.CITY ?? ""),
    state: String(attrs.STABBR ?? ""),
    website: normalizeWebsite(attrs.WEBADDR),
  };
}

export default function ArcgisMap() {
  const viewRef = useRef<MapView | null>(null);
  const {
    collegesLayerRef,
    reapplyLayerFilters,
    setAreaResults,
    setIsSearching,
  } = useCollegesUniversities();
  const { saved, isSaved, toggleSave } = useSavedUniversities();


  const savedRef = useRef({ isSaved, toggleSave });
  const saveActionRef = useRef<ActionButton | null>(null);
  const popupHandlesRef = useRef<ResourceHandle[]>([]);

  useEffect(() => {
    savedRef.current = { isSaved, toggleSave };
  }, [isSaved, toggleSave]);


  const syncSaveAction = () => {
    const action = saveActionRef.current;
    if (!action) return;

    const institution = toAreaInstitution(
      viewRef.current?.popup?.selectedFeature?.attributes,
    );
    const alreadySaved =
      institution !== null && savedRef.current.isSaved(institution.uniId);

    action.icon = alreadySaved ? "heart-f" : "heart";
    action.title = alreadySaved ? "Remove from saved" : "Save university";
  };

  // Saving, unsaving, or signing in/out changes the list while a popup is open.
  useEffect(() => {
    syncSaveAction();
  }, [saved]);

  useEffect(() => {
    return () => {
      popupHandlesRef.current.forEach((handle) => handle.remove());
      popupHandlesRef.current = [];
    };
  }, []);

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

    saveActionRef.current =
      (collegesLayer.popupTemplate?.actions?.find(
        (action) => action.id === SAVE_ACTION_ID,
      ) as ActionButton | undefined) ?? null;

    const view = target.view;

    popupHandlesRef.current.forEach((handle) => handle.remove());
    popupHandlesRef.current = [
      // The popup is created lazily on the first map click, so these attach
      // whenever it comes into existence rather than at load time.
      reactiveUtils.on(
        () => view.popup,
        "trigger-action",
        (triggerEvent) => {
          if (triggerEvent.action.id !== SAVE_ACTION_ID) return;

          const institution = toAreaInstitution(
            view.popup?.selectedFeature?.attributes,
          );
          if (institution) {
            savedRef.current.toggleSave(institution);
          }
        },
      ),
      reactiveUtils.watch(
        () => view.popup?.selectedFeature,
        () => syncSaveAction(),
      ),
    ];
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
        .map((feature) =>
          toAreaInstitution(feature.attributes as Record<string, unknown>),
        )
        .filter(
          (institution): institution is AreaInstitution =>
            institution !== null,
        );

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
