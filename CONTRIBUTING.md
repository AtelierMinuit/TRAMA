# Contribuir a TRAMA

Gracias por tu interés. Este documento explica cómo involucrarte.

## Antes de empezar

- TRAMA es **local-first**: ningún código nuevo debe añadir llamadas de red, telemetría, cuentas ni sincronización para datos sensibles.
- Usa **únicamente datos ficticios** en capturas, fixtures y issues. **No** adjuntes expedientes reales, datos personales ni nada que identifique a un NNA o familia real.
- Reporta vulnerabilidades de forma privada (ver [SECURITY.md](SECURITY.md)), no en issues públicos.

## Flujo de trabajo

1. Haz un fork del repositorio.
2. Crea una rama acotada: `git checkout -b fix/mi-correccion`.
3. Haz commits semánticos y pequeños (`fix:`, `feat:`, `docs:`, `refactor:`, `test:`, `ci:`).
4. Sube tu rama y abre un Pull Request contra `main`.

## Verificación local

Antes de abrir un PR, pasa el agregador de checks:

```bash
pnpm check
```

Esto ejecuta `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Para el código Rust:

```bash
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

## Estándares

- **Accesibilidad (a11y)**: componentes accesibles (roles, aria-labels, navegación por teclado, foco visible). El canvas no debe depender solo del color: las relaciones se diferencian también por estilo de línea, dirección y patrón.
- **Privacidad**: respeta la filosofía local-first. Sin red, sin telemetría.
- **Pruebas**: añade o actualiza tests para nuevas funcionalidades y correcciones de bugs (regresión).
- **Capturas**: si cambias la UI, incluye capturas con datos ficticios.
- **Documentación**: actualiza los docs afectados (README, ARCHITECTURE, etc.) para que reflejen el código real.

## Código de conducta

Mantén un comportamiento respetuoso e inclusivo en issues y pull requests.
