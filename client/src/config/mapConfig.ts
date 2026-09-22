export const INITIAL_CENTER: [number, number] = [-98.5795, 39.8283];
export const INITIAL_ZOOM = 3;

export const MIN_ZOOM = INITIAL_ZOOM;

export const COLLEGES_UNIVERSITIES_URL =
  "https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Colleges_and_Universities_View/FeatureServer/0";


export const INSTITUTION_OUT_FIELDS = [
  "UNITID",
  "INSTNM",
  "ADDR",
  "CITY",
  "STABBR",
  "WEBADDR",
] as const;


export const MAX_RECORD_COUNT = 2000;

export const SAVE_ACTION_ID = "toggle-save";

export const INSTITUTION_POPUP_TEMPLATE = {
  title: "{INSTNM}",
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
