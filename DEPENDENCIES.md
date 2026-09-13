# Dependencias y entorno comprobado

## Aplicación

| Componente | Versión fijada/resuelta | Licencia |
| --- | --- | --- |
| Tauri CLI | 2.11.4 | MIT / Apache-2.0 |
| Tauri runtime/crates | 2.x | MIT / Apache-2.0 |
| React / React DOM | 19.3.0 | MIT |
| TypeScript | 6.0.3 | Apache-2.0 |
| Vite | 8.3.0 | MIT |
| ESLint | 9.39.5 | MIT |
| typescript-eslint | 8.70.0 | MIT |
| SchemaTex | 1.0.14 | AGPL-3.0-only |
| Tauri Plugin Dialog | 2.7.3 | MIT / Apache-2.0 |
| Tauri Plugin SQL | 2.4.1 | MIT / Apache-2.0 |
| fflate | 0.8.3 | MIT |
| jsPDF | 4.2.1 | MIT |
| svg2pdf.js | 2.8.1 | MIT |
| Vitest | 5.0.0 | MIT |
| Puppeteer | 25.10.0 | Apache-2.0 (dev/solo capturas) |

Las versiones reales resueltas quedan en `pnpm-lock.yaml` y pueden variar solo mediante un cambio deliberado del lockfile.

## Entorno de desarrollo

- Node.js 22 LTS (ver `.nvmrc`).
- pnpm 10.
- Rust stable.
- macOS build: Xcode Command Line Tools.
- Linux build (CI): `pkg-config`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libglib2.0-dev`, `libsoup-3.0-dev`, `libjavascriptcoregtk-4.1-dev`.

## Auditoría de licencias

```bash
pnpm license:audit
```

La auditoría recorre el árbol real de `pnpm list --depth Infinity`, revisa metadatos de licencia y rechaza licencias no aprobadas o desconocidas. La ejecución de release debe pasar sin findings.
