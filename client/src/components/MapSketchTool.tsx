/// <reference types="@arcgis/map-components/types/react" />
import type Geometry from "@arcgis/core/geometry/Geometry.js";
import type MapView from "@arcgis/core/views/MapView.js";
import "@arcgis/map-components/components/arcgis-sketch";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";
import { queryInstitutionsInArea } from "../utils/institutionUtils";

type MapSketchToolProps = {
  view: MapView | null;
};

export default function MapSketchTool({ view }: MapSketchToolProps) {
  const { collegesLayerRef, setAreaResults, setIsSearching } =
    useCollegesUniversities();

  const searchArea = async (geometry: Geometry) => {
    const layer = collegesLayerRef.current;
    if (!layer) return;

    setIsSearching(true);

    try {
      setAreaResults(await queryInstitutionsInArea(layer, geometry));
    } catch (error) {
      console.error("Area query failed", error);
      setAreaResults({ institutions: [], total: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = (event: CustomEvent) => {
    if (event.detail.state !== "complete") return;

    const geometry = event.detail.graphic?.geometry;
    if (!geometry) return;

    void searchArea(geometry);
  };

  const handleDelete = () => {
    view?.graphics.removeAll();
    setAreaResults(null);
  };

  const handleUpdate = (event: CustomEvent) => {
    if (event.detail.aborted) return;

    const geometry = event.detail.graphics[0]?.geometry;
    if (!geometry) {
      handleDelete();
      return;
    }

    const toolType = event.detail.toolEventInfo?.type;
    const toolDone =
      toolType === "scale-stop" ||
      toolType === "reshape-stop" ||
      toolType === "move-stop";

    if (event.detail.state === "complete" || toolDone) {
      void searchArea(geometry);
    }
  };

  return (
    <arcgis-sketch
      creation-mode="update"
      slot="bottom-right"
      onarcgisCreate={(event) => handleCreate(event)}
      onarcgisUpdate={(event) => handleUpdate(event)}
      onarcgisDelete={handleDelete}
    ></arcgis-sketch>
  );
}
