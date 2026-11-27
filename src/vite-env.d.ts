/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

/** Version del front (package.json), inyectada por Vite. */
declare const __APP_VERSION__: string;
