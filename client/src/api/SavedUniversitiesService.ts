import type { AreaInstitution } from "../useContext/collegesUniversitiesContext";
import { authFetch } from "./authFetch";
import { parseResponse } from "./parseResponse";

const API_URL = import.meta.env.VITE_API_URL;
const ENDPOINT = `${API_URL}/api/saved-universities`;

export type SavedUniversity = {
  _id: string;
  uniId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  website?: string;
  createdAt: string;
};

export async function listSavedUniversities(): Promise<SavedUniversity[]> {
  const res = await authFetch(ENDPOINT);
  const data = await parseResponse<{ savedUniversities: SavedUniversity[] }>(
    res,
  );
  return data.savedUniversities;
}

export async function saveUniversity(
  institution: AreaInstitution,
): Promise<SavedUniversity> {
  const res = await authFetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(institution),
  });
  const data = await parseResponse<{ savedUniversity: SavedUniversity }>(res);
  return data.savedUniversity;
}

export async function unsaveUniversity(uniId: number): Promise<void> {
  const res = await authFetch(`${ENDPOINT}/${uniId}`, { method: "DELETE" });
  await parseResponse<void>(res);
}
