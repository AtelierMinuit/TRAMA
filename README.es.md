<div align="center">
  <img src="docs/assets/brand/github-banner.png" alt="TRAMA — Ecomapas profesionales para Trabajo Social" width="100%">
</div>

<h1 align="center">TRAMA</h1>

<p align="center">
  <strong>App de escritorio open-source y local-first para ecomapas en Trabajo Social y práctica comunitaria.</strong>
</p>

<p align="center">
  <a href="https://github.com/AtelierMinuit/TRAMA/actions/workflows/frontend-quality.yml"><img src="https://github.com/AtelierMinuit/TRAMA/actions/workflows/frontend-quality.yml/badge.svg" alt="frontend-quality"></a>
  <a href="https://github.com/AtelierMinuit/TRAMA/actions/workflows/rust-quality.yml"><img src="https://github.com/AtelierMinuit/TRAMA/actions/workflows/rust-quality.yml/badge.svg" alt="rust-quality"></a>
  <a href="https://github.com/AtelierMinuit/TRAMA/actions/workflows/release.yml"><img src="https://github.com/AtelierMinuit/TRAMA/actions/workflows/release.yml/badge.svg" alt="release"></a>
  <a href="https://github.com/AtelierMinuit/TRAMA/actions/workflows/codeql.yml"><img src="https://github.com/AtelierMinuit/TRAMA/actions/workflows/codeql.yml/badge.svg" alt="CodeQL"></a>
  <a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL--3.0--only-blue.svg" alt="Licencia: AGPL-3.0-only"></a>
  <img src="https://img.shields.io/badge/Plataforma-macOS%20Apple%20Silicon-333333.svg" alt="macOS">
</p>

<p align="center">
  <a href="#instalación">Instalar</a> ·
  <a href="#desarrollo">Desarrollar</a> ·
  <a href="https://atelierminuit.github.io/TRAMA/">Web</a> ·
  <a href="README.md">English</a>
</p>

---

TRAMA es una aplicación de escritorio para crear, editar y analizar **ecomapas** — los diagramas relacionales usados en Trabajo Social, terapia familiar y práctica comunitaria para mapear la red de sistemas alrededor de una persona o familia. Está diseñada para profesionales que necesitan una herramienta estandarizada y reproducible que respete la confidencialidad de los datos de los casos.

> **Estado: alfa.** TRAMA es funcional pero pre-1.0. El editor de ecomapas, snapshots, comparación temporal y exportación SVG/PNG/PDF funcionan hoy. Consulta [Limitaciones actuales](#limitaciones-actuales) y [ROADMAP.md](ROADMAP.md).

<div align="center">
  <img src="docs/assets/screenshots/editor.png" alt="Editor de TRAMA" width="720">
  <br>
  <em>Editor con el caso demo ficticio "Familia Rivera"</em>
</div>

---

## Por qué TRAMA

Las herramientas genéricas de diagramación no entienden la semántica de las relaciones humanas. TRAMA ofrece un enfoque estructurado y con base académica para el ecomapeo:

- **Relaciones semánticas.** Tipos de relación estándar y extendidos (fuerte, estresante, conflictiva, enredada, cortada, mandatada, …) renderizados cada uno con un estilo de línea distinto — no solo color — para que el mapa sea legible en escala de grises y para personas con daltonismo.
- **Flujo de energía.** Cada relación puede llevar una dirección de flujo independiente (hacia el centro, desde el centro, mutuo), una dimensión ausente en la mayoría de herramientas genéricas.
- **Snapshots y comparación.** Captura un snapshot con nombre y fecha del caso en cualquier punto y compara dos snapshots para ver exactamente qué cambió entre sesiones.
- **Procedencia.** Cada nodo y conexión puede registrar su tipo de fuente (reporte del usuario, observación profesional, hipótesis de trabajo, …) y estado de verificación — respaldando una práctica basada en evidencia y defendible.
- **Casos portables.** Exporta e importa archivos `.trama` (un contenedor ZIP abierto) para continuar el trabajo en otro dispositivo, sin nube ni cuenta.

## Privacidad — con honestidad

TRAMA es **local-first**: todos los datos del caso se almacenan en tu dispositivo. No hay servidor, ni cuenta, ni telemetría, ni llamadas de red en el código de la aplicación.

- En el build de escritorio Tauri, los datos se guardan en una **base de datos SQLite local** en disco.
- En navegador, los datos se guardan en `localStorage` como respaldo.
- El formato portable `.trama` es un contenedor ZIP sin cifrar. **TRAMA no cifra los datos en reposo por sí mismo.** La protección física en reposo depende del cifrado a nivel de dispositivo (p. ej. FileVault de macOS). TRAMA **no** está cifrado de extremo a extremo, porque no hay red contra la que cifrar.
- Las lecturas y escrituras de archivos están restringidas por las capabilities de Tauri a rutas elegadas mediante diálogos nativos, con validación de ruta absoluta y traversal, allowlist de extensiones y un límite de 50 MiB.

Consulta [PRIVACY.md](PRIVACY.md) para la declaración completa y verificable.

## Instalación

Los binarios precompilados se publican en la página de [Releases](https://github.com/AtelierMinuit/TRAMA/releases) para macOS Apple Silicon.

> Los builds de macOS están **firmados ad-hoc** (no notarizados por un certificado Apple Developer). En el primer arranque puede ser necesario clic derecho → *Abrir* para sortear Gatekeeper, o quitar el atributo de cuarentena manualmente. TRAMA no desactiva Gatekeeper ni SIP ni solicita privilegios elevados.

## Desarrollo

### Requisitos

- [Node.js](https://nodejs.org/) 22 LTS (ver `.nvmrc`)
- [pnpm](https://pnpm.io/) 10
- [Rust](https://www.rust-lang.org/) stable (para el build de escritorio Tauri)
- El build de macOS además necesita Xcode Command Line Tools

### Puesta en marcha

```bash
git clone https://github.com/AtelierMinuit/TRAMA.git
cd TRAMA
pnpm install
```

### Comandos

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor dev de Vite (http://localhost:1420) |
| `pnpm typecheck` | TypeScript sin emisión |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (pruebas unitarias) |
| `pnpm build` | Build frontend → `dist/` |
| `pnpm tauri dev` | App Tauri en desarrollo |
| `pnpm tauri build` | Bundle macOS `.app` / `.dmg` |
| `pnpm license:audit` | Auditoría de licencias de dependencias |
| `pnpm check` | Agregador: typecheck + lint + test + build |

## Capturas

<div align="center">
<table>
  <tr><td align="center"><img src="docs/assets/screenshots/dashboard.png" alt="Dashboard" width="360"><br>Dashboard</td>
  <td align="center"><img src="docs/assets/screenshots/editor.png" alt="Editor" width="360"><br>Editor</td></tr>
  <tr><td align="center"><img src="docs/assets/screenshots/inspector.png" alt="Inspector" width="360"><br>Inspector de relación</td>
  <td align="center"><img src="docs/assets/screenshots/snapshots.png" alt="Snapshots" width="360"><br>Snapshots / versiones</td></tr>
  <tr><td align="center"><img src="docs/assets/screenshots/comparison.png" alt="Comparación" width="360"><br>Comparación temporal</td>
  <td align="center"><img src="docs/assets/screenshots/export.png" alt="Exportación" width="360"><br>Exportación</td></tr>
  <tr><td align="center"><img src="docs/assets/screenshots/settings.png" alt="Ajustes" width="360"><br>Ajustes / privacidad</td>
  <td align="center"><img src="docs/assets/screenshots/dark-mode.png" alt="Modo oscuro" width="360"><br>Modo oscuro</td></tr>
</table>
</div>

Todas las capturas usan **únicamente datos ficticios** (el caso demo "Familia Rivera").

## Arquitectura

TRAMA sigue una estructura por capas que separa la lógica de dominio de la infraestructura y la presentación:

- **Dominio** (`src/domain`): el modelo de ecomapa, tipos de relación/flujo, comparación de snapshots, defaults. Sin UI ni I/O.
- **Infraestructura** (`src/infrastructure`): repositorio SQLite + localStorage, formato portable `.trama`, exportación SVG/PNG/PDF, puente de plataforma (Tauri).
- **Adaptadores** (`src/adapters`): proyección DSL de SchemaTex — la fuente de renderizado canónica y reproducible.
- **Presentación** (`src/screens`, `src/components`, `src/modals`): UI en React; estado orquestado mediante `DocumentContext`.
- **Nativo** (`src-tauri`): shell en Rust — menús nativos, lectura/escritura validada de archivos, migraciones SQLite.

Consulta [ARCHITECTURE.md](ARCHITECTURE.md) y [DATA_MODEL.md](DATA_MODEL.md).

## Formatos

- **`.trama`** — contenedor ZIP abierto con `manifest.json`, `ecomap.json` y `snapshots/*.json`. Versionado, validado al importar (protección path traversal y ZIP bomb, chequeos estructurales y de tipos).
- **SVG** — exportación vectorial con leyenda opcional, consciente del tema.
- **PNG** — exportación raster a 2× escala.
- **PDF** — PDF vectorial vía `svg2pdf`, orientado a A4.

## Roadmap

Consulta [ROADMAP.md](ROADMAP.md). Resumen:

- **0.1.x** — estabilidad, UX, accesibilidad, exportación, formatos.
- **0.2** — mini-genograma central, comparación avanzada, nuevos layouts.
- **0.3** — genograma completo.
- **Futuro** — IA local opcional, análisis asistido, transcripción, integraciones.

## Contribuir

Las contribuciones son bienvenidas. Lee [CONTRIBUTING.md](CONTRIBUTING.md). Los pull requests deben pasar `pnpm check` y, al cambiar UI, incluir capturas con únicamente datos ficticios.

## Seguridad

Reporta vulnerabilidades de forma privada — consulta [SECURITY.md](SECURITY.md). **No** adjuntes expedientes reales, datos personales ni nada que identifique a un NNA o familia real a un issue público.

## Licencia

TRAMA se distribuye bajo **GNU AGPL-3.0-only**. El motor de renderizado SchemaTex también es AGPL-3.0-only. Consulta [LICENSE](LICENSE) y [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) para las licencias de dependencias.

## Limitaciones actuales

- Solo macOS Apple Silicon para binarios precompilados (no hay build publicado de Windows/Linux).
- Los builds están firmados ad-hoc, no notarizados.
- Sin cifrado de datos en reposo más allá del SO (FileVault); la base SQLite no está cifrada.
- Sin multiusuario / sincronización en la nube (por diseño).
- El soporte de genogramas aún no está implementado (planificado para 0.2–0.3).
