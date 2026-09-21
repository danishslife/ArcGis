import { abbr } from "us-state-converter";

export type LayerFilters = {
  name?: string | null;
  state?: string[] | null;
  city?: string | null;
  control?: number[] | null;
  highestLevelOffering?: number[] | null;
  beaRegion?: number[] | null;
  instSize?: number[] | null;
  cbsaType?: number | null;
  locale?: number[] | null;
};

export default function buildLayerDefinitionExpression(
  filters: LayerFilters,
): string {
  const clauses: string[] = [];

  const state = buildStateClause("STABBR", filters.state);

  if (state) {
    clauses.push(state);
  }

  const name = buildSearchExpression("INSTNM", filters.name);
  if (name) {
    clauses.push(name);
  }

  const city = buildSearchExpression("CITY", filters.city);

  if (city) {
    clauses.push(city);
  }

  const beaRegion = buildInClause("OBEREG", filters.beaRegion);

  if (beaRegion) {
    clauses.push(beaRegion);
  }

  const instSize = buildInstSizeClause("INSTSIZE", filters.instSize);

  if (instSize) {
    clauses.push(instSize);
  }

  const control = buildInClause("CONTROL", filters.control);
  if (control) clauses.push(control);

  const highestLevelOffering = buildInClause(
    "HLOFFER",
    filters.highestLevelOffering,
  );

  if (highestLevelOffering) {
    clauses.push(highestLevelOffering);
  }

  const cbsaType = buildCbsaTypeClause("CBSATYPE", filters.cbsaType);

  if (cbsaType) {
    clauses.push(cbsaType);
  }

  const locale = buildInClause("LOCALE", filters.locale);

  if (locale) {
    clauses.push(locale);
  }

  return clauses.length > 0 ? clauses.join(" AND ") : "1=1";
}

function buildInClause(
  fieldName: string,
  values: number[] | null | undefined,
): string | null {
  if (!values || values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return `${fieldName} = ${values[0]}`;
  }

  return `${fieldName} IN (${values.join(", ")})`;
}

function buildStateClause(
  fieldName: string,
  values: string[] | null | undefined,
): string | null {
  if (!values || values.length === 0) {
    return null;
  }

  const stateCode: string[] | null | undefined = values.map((state) =>
    `'${abbr(state).replace(/'/g, "''")}'`,
  );

  if (!stateCode || stateCode.length === 0) {
    return null;
  }

  if (stateCode.length === 1) {
    return `${fieldName} = ${stateCode[0]}`;
  }

  return `${fieldName} IN (${stateCode.join(", ")})`;
}

function buildCbsaTypeClause(
  fieldName: string,
  value: number | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return `${fieldName} = ${value}`;
}

function buildInstSizeClause(
  fieldName: string,
  values: number[] | null | undefined,
): string | null {
  const codes = [];

  if (!values || values.length === 0) {
    return null;
  }
  const low = values[0];
  const high = values[1];

  if (low === 1 && high === 5) {
    return null;
  }

  for (let i = low; i <= high; i++) {
    codes.push(i);
  }

  return `${fieldName} IN (${codes.join(", ")})`;
}

function buildSearchExpression(
  fieldName: string,
  searchText: string | null | undefined,
): string | null {
  if (!searchText) {
    return null;
  }
  const cleanText = searchText.trim().replace(/'/g, "''");
  const upperSearch = cleanText.toUpperCase();
  return `UPPER(${fieldName}) LIKE '%${upperSearch}%'`;
}
