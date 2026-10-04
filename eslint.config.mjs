import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { plugin as shadcn } from "@shadcn/lint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    settings: {
      shadcn: {
        componentImports: ["^@/components/ds(/|$)"],
        note: "Consulta DESIGN.md: solo tokens del sistema, variantes con cva dentro del componente.",
      },
    },
    rules: {
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
  {
    // Los componentes del sistema definen su propio estilo.
    files: ["components/ui/**", "components/ds/**"],
    rules: { "shadcn/no-restyle": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Maqueta HTML de referencia, no es código de la app.
    "docs/**",
  ]),
]);

export default eslintConfig;
