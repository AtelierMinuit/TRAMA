# Dependencias y entorno comprobado

## Aplicación

| Componente | Versión fijada/resuelta | Licencia |
| --- | --- | --- |
| Tauri CLI | 2.11.4 | MIT / Apache-2.0 |
| Tauri runtime/crates | 2.x | MIT / Apache-2.0 |
| React / React DOM | 19.3.0 | MIT |
| TypeScript | 6.0.3 | Apache-2.0 |
| Vite | 8.3.0 | MIT |
| SchemaTex | 1.0.14 | AGPL-3.0-only |
| Tauri Plugin Dialog | 2.7.3 | MIT / Apache-2.0 |
| Tauri Plugin SQL | 2.4.1 | MIT / Apache-2.0 |
| fflate | 0.8.3 | MIT |
| jsPDF | 4.2.1 | MIT |
| svg2pdf.js | 2.8.1 | MIT |
| Vitest | 5.0.0 | MIT |

Las versiones reales resueltas quedan en `pnpm-lock.yaml` y pueden variar solo mediante un cambio deliberado del lockfile.

## Máquina de desarrollo

La inspección inicial verificó macOS 26.6.2, `arm64`, Xcode 26.6, Command Line Tools, Node 24.19.0, pnpm 11.24.0, Git 2.55.0 y Homebrew 6.0.22. Rust/Cargo no estaban disponibles globalmente; se instaló un toolchain stable ARM64 local en `.local/`, excluido de Git, sin actualizar herramientas globales.

## Auditoría

```bash
pnpm license:audit
```

La auditoría recorre el árbol real de `pnpm list --depth Infinity`, revisa metadatos de licencia y rechaza licencias no aprobadas o desconocidas. La ejecución de release debe pasar sin findings.
