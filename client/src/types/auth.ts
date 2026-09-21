export type AuthUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export interface ApiErrorResponse {
  message: string;
}
