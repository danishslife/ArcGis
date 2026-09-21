import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as SavedUniversitiesService from "../api/SavedUniversitiesService";
import type { SavedUniversity } from "../api/SavedUniversitiesService";
import { useAuth } from "./authContext";
import type { AreaInstitution } from "./collegesUniversitiesContext";

type SavedUniversitiesContextType = {
  saved: SavedUniversity[];
  isLoading: boolean;
  error: string | null;
  isSaved: (uniId: number) => boolean;
  isPending: (uniId: number) => boolean;
  // Saves when signed in, otherwise opens the auth dialog and finishes the
  // save once the user is in.
  toggleSave: (institution: AreaInstitution) => void;
  unsave: (uniId: number) => void;
};

// The list is tagged with the user it belongs to, so signing out (or switching
// accounts) shows nothing until that user's own list has loaded.
type SavedState = {
  userId: string | null;
  list: SavedUniversity[];
};

const EMPTY_LIST: SavedUniversity[] = [];

const SavedUniversitiesContext = createContext<
  SavedUniversitiesContextType | undefined
>(undefined);

export function SavedUniversitiesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, openAuthDialog } = useAuth();
  const [savedState, setSavedState] = useState<SavedState>({
    userId: null,
    list: EMPTY_LIST,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  // What a guest clicked before signing in, saved automatically afterwards.
  const pendingSaveRef = useRef<AreaInstitution | null>(null);

  const saved =
    user && savedState.userId === user._id ? savedState.list : EMPTY_LIST;

  const markPending = useCallback((uniId: number, pending: boolean) => {
    setPendingIds((previous) =>
      pending ? [...previous, uniId] : previous.filter((id) => id !== uniId),
    );
  }, []);

  const save = useCallback(
    async (institution: AreaInstitution) => {
      markPending(institution.uniId, true);
      setError(null);

      try {
        const savedUniversity =
          await SavedUniversitiesService.saveUniversity(institution);
        setSavedState((previous) =>
          previous.list.some((item) => item.uniId === savedUniversity.uniId)
            ? previous
            : { ...previous, list: [savedUniversity, ...previous.list] },
        );
      } catch (saveError) {
        setError(
          saveError instanceof Error ? saveError.message : "Could not save",
        );
      } finally {
        markPending(institution.uniId, false);
      }
    },
    [markPending],
  );

  const unsave = useCallback(
    async (uniId: number) => {
      markPending(uniId, true);
      setError(null);

      try {
        await SavedUniversitiesService.unsaveUniversity(uniId);
        setSavedState((previous) => ({
          ...previous,
          list: previous.list.filter((item) => item.uniId !== uniId),
        }));
      } catch (unsaveError) {
        setError(
          unsaveError instanceof Error
            ? unsaveError.message
            : "Could not remove",
        );
      } finally {
        markPending(uniId, false);
      }
    },
    [markPending],
  );

  // Load this user's list when they sign in.
  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    SavedUniversitiesService.listSavedUniversities()
      .then((list) => {
        if (cancelled) return;
        setSavedState({ userId: user._id, list });

        // Finish what the guest clicked before signing in.
        const pendingSave = pendingSaveRef.current;
        pendingSaveRef.current = null;
        if (pendingSave && !list.some((i) => i.uniId === pendingSave.uniId)) {
          void save(pendingSave);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load saved universities",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, save]);

  const isSaved = useCallback(
    (uniId: number) => saved.some((item) => item.uniId === uniId),
    [saved],
  );

  const isPending = useCallback(
    (uniId: number) => pendingIds.includes(uniId),
    [pendingIds],
  );

  const toggleSave = useCallback(
    (institution: AreaInstitution) => {
      if (!user) {
        pendingSaveRef.current = institution;
        openAuthDialog();
        return;
      }

      if (isSaved(institution.uniId)) {
        void unsave(institution.uniId);
      } else {
        void save(institution);
      }
    },
    [user, openAuthDialog, isSaved, save, unsave],
  );

  const value = useMemo(
    () => ({ saved, isLoading, error, isSaved, isPending, toggleSave, unsave }),
    [saved, isLoading, error, isSaved, isPending, toggleSave, unsave],
  );

  return (
    <SavedUniversitiesContext.Provider value={value}>
      {children}
    </SavedUniversitiesContext.Provider>
  );
}

export function useSavedUniversities() {
  const context = useContext(SavedUniversitiesContext);
  if (!context) {
    throw new Error(
      "useSavedUniversities must be used within SavedUniversitiesProvider",
    );
  }
  return context;
}
