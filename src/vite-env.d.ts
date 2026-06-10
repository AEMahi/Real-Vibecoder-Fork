/// <reference types="react" />

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | number | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
