/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ANALYTICS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
