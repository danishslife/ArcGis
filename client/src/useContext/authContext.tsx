import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as AuthService from "../api/AuthService";
import { getToken } from "../api/authToken";
import type { AuthUser } from "../types/auth";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => void;
  // The dialog lives in the app bar but anything can ask for it, so a guest
  // clicking "save" on a university can be prompted to sign in.
  isAuthDialogOpen: boolean;
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Only a stored token needs verifying, and while it is being checked guarded
  // routes must wait instead of bouncing a signed-in user out. With no token
  // there is nothing to load, so this starts false and avoids an extra render.
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    let cancelled = false;

    AuthService.getUser()
      .then((loadedUser) => {
        if (!cancelled) setUser(loadedUser);
      })
      .catch(() => {
        // parseResponse already cleared the dead token.
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedIn } = await AuthService.login(email, password);
    setUser(loggedIn);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ) => {
      const { user: registered } = await AuthService.register(
        email,
        password,
        firstName,
        lastName,
      );
      setUser(registered);
    },
    [],
  );

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  const openAuthDialog = useCallback(() => setIsAuthDialogOpen(true), []);
  const closeAuthDialog = useCallback(() => setIsAuthDialogOpen(false), []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthDialogOpen,
      openAuthDialog,
      closeAuthDialog,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthDialogOpen,
      openAuthDialog,
      closeAuthDialog,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
