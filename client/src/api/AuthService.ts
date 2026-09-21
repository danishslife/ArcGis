import type { AuthResponse, AuthUser } from "../types/auth";
import { clearToken, setToken } from "./authToken";
import { authFetch } from "./authFetch";
import { parseResponse } from "./parseResponse";

const API_URL = import.meta.env.VITE_API_URL;

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  const data = await parseResponse<AuthResponse>(res);
  setToken(data.token);
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse<AuthResponse>(res);
  setToken(data.token);
  return data;
}

export async function getUser(): Promise<AuthUser> {
  const res = await authFetch(`${API_URL}/api/auth/me`);
  const data = await parseResponse<{ user: AuthUser }>(res);
  return data.user;
}

export function logout(): void {
  clearToken();
}
