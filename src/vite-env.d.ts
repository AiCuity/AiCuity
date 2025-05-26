
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PRICE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
