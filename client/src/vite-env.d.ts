/// <reference types="@arcgis/map-components/types/react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARCGIS_API_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
