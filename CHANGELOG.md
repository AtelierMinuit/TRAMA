# Changelog

All notable changes to TRAMA are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

Preparación de la release estable `v0.1.0`.

### Added
- ESLint (flat config, typescript-eslint + react-hooks) y scripts `lint`, `typecheck`, `check`.
- `.nvmrc` fijando Node 22 LTS.
- 17 pruebas de regresión de seguridad de datos (corrupción, ZIP bomb, IDs inválidos, doc vacío, ecomapa grande, Unicode, nombres largos, identidad de ida y vuelta) — total 26 tests.
- Workflows de CI separados y legibles: `frontend-quality`, `rust-quality`, `license`, `dependency-review`, `tauri-build-macos`.
- Workflow de release reproducible en tag semántico (checkout de SHA exacto, checks, build Tauri, `.app` zip + `.dmg` + checksums SHA-256).
- CodeQL para JavaScript/TypeScript y Rust.
- Dependabot con agrupación (react/tauri/eslint) en npm, cargo y GitHub Actions.
- Capturas reales de la app (dashboard, editor, inspector, snapshots, comparación, exportación, ajustes, modo oscuro) con datos ficticios.
- Assets de marca: `trama-logo.svg`, `trama-icon.png`, `github-banner.png`.
- Landing page sobria en `docs/` con identidad visual y capturas reales.
- `CHANGELOG.md`.

### Changed
- CI alineado a Node 22 / pnpm 10 con `--frozen-lockfile`, permisos mínimos y caché de Rust.
- README y README.es reescritos con privacidad honesta, features reales, badges funcionales y capturas reales.
- Pages publica desde Actions con la landing nueva.

### Fixed
- Reglas de Hooks en `Editor.tsx`: hooks llamados condicionalmente tras un early return (potencial crash de orden de render).
- Eliminados scripts `patch_*.cjs`, `App_old.css` y `react.svg` (código muerto).
- Imports no usados en App, Editor, Icon, DocumentContext, hooks.
- Enlaces incorrectos en la landing (`github.com/TRAMA/ecomap` → `AtelierMinuit/TRAMA`).
- Badge de React 18 → React 19; badge de CI `ci.yml` → workflows nuevos.
- Referencia a `localhost:5173` → `localhost:1420`.

## [0.1.0-alpha.6] — 2026-09-13

### Added
- Paleta ⌘K, informes clínicos A4/PDF, matriz ecológica Hartman, menú contextual macOS.
- Rediseño contemporáneo: canvas de puntos, estilizado SVG vibrante, badges de categoría Lucide, modo oscuro obsidiana.

## [0.1.0-alpha.1] — 2026-09-13

### Added
- Primera release funcional: centro, sistemas, relaciones estándar/extendidas, flujo de energía, procedencia, SQLite, `.trama`, snapshots, comparación, SVG/PNG/PDF, i18n ES/EN, menú nativo.

[Unreleased]: https://github.com/AtelierMinuit/TRAMA/compare/v0.1.0-alpha.6...HEAD
[0.1.0-alpha.6]: https://github.com/AtelierMinuit/TRAMA/releases/tag/v0.1.0-alpha.6
[0.1.0-alpha.1]: https://github.com/AtelierMinuit/TRAMA/releases/tag/v0.1.0-alpha.1
