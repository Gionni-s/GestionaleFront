// import { loadEnvConfig } from "@next/env"
// const projectDir = process.cwd()
// loadEnvConfig(projectDir)

console.error(
  'Non funziona la lettura da .env, prima di pubblicare su render risolvere'
);
const baseUrl: string =
  process.env.REACT_APP_BASE_URL || 'http://localhost:9000';
// process.env.REACT_APP_BASE_URL || "https://gestionale-latest.onrender.com"

export { baseUrl };
