import type { ReactElement } from "react";
import esriConfig from "@arcgis/core/config";
import ArcgisMap from "./components/ArcgisMap";
import Navbar from "./components/Navbar";
import SavedUniversities from "./pages/SavedUniversities";
import { CollegesUniversitiesProvider } from "./useContext/collegesUniversitiesContext";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./useContext/authContext";
import { SavedUniversitiesProvider } from "./useContext/savedUniversitiesContext";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;

function MapLayout() {
  return (
    <CollegesUniversitiesProvider>
      <Navbar>
        <ArcgisMap />
        <Outlet />
      </Navbar>
    </CollegesUniversitiesProvider>
  );
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <SavedUniversitiesProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<MapLayout />}>
            <Route path="/" element={null} />
            <Route
              path="/saved"
              element={
                <RequireAuth>
                  <SavedUniversities />
                </RequireAuth>
              }
            />
            <Route path="*" element={null} />
          </Route>
        </Routes>
        </BrowserRouter>
      </SavedUniversitiesProvider>
    </AuthProvider>
  );
}

export default App;
