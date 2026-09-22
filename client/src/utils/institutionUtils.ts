import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type Geometry from "@arcgis/core/geometry/Geometry.js";
import type {
  AreaInstitution,
  AreaResults,
} from "../useContext/collegesUniversitiesContext";
import {
  COLLEGES_UNIVERSITIES_URL,
  INSTITUTION_OUT_FIELDS,
  INSTITUTION_POPUP_TEMPLATE,
  MAX_RECORD_COUNT,
} from "../config/mapConfig";


function normalizeWebsite(value: unknown): string | undefined {
  const website = value ? String(value).trim() : "";
  if (!website) return undefined;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export function toAreaInstitution(
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

export function createCollegesLayer(): FeatureLayer {
  return new FeatureLayer({
    url: COLLEGES_UNIVERSITIES_URL,
    title: "Colleges and Universities (U.S.)",
    outFields: ["*"],
    definitionExpression: "1=1",
    popupEnabled: true,
    popupTemplate: INSTITUTION_POPUP_TEMPLATE,
  });
}

export async function queryInstitutionsInArea(
  layer: FeatureLayer,
  geometry: Geometry,
): Promise<AreaResults> {

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
      (institution): institution is AreaInstitution => institution !== null,
    );

  return { institutions, total };
}
