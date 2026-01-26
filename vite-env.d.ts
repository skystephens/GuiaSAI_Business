/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_API_KEY: string
  readonly VITE_AIRTABLE_BASE_ID: string
  readonly VITE_API_URL: string
  readonly NODE_ENV: 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
