# Seguridad

## Versiones soportadas

| Versión | Soporte |
| --- | --- |
| 0.1.0-alpha.x | ✅ En desarrollo |
| < 0.1.0 | ❌ No soportado |

## Cómo reportar una vulnerabilidad

**No abras un issue público para vulnerabilidades de seguridad.** Usa el
[Private Vulnerability Reporting](https://github.com/AtelierMinuit/TRAMA/security/advisories/new)
de GitHub para reportar de forma privada.

- Confirma el recibo del reporte en un plazo razonable.
- Coordinamos la divulgación responsable y publicamos un advisory GHSA cuando corresponda.

## Qué NO publicar en issues

- Expedientes reales, datos personales, RUT, correos ni nombres reales.
- Cualquier información que identifique a un niño, niña o adolescente (NNA) o familia real.
- Capturas de pantalla con datos de casos reales. Usa **únicamente datos ficticios**.

## Medidas implementadas

- CSP explícita sin `connect-src` remoto.
- Capabilities Tauri mínimas para core, Dialog y SQL; no se habilita shell ni filesystem plugin global.
- Lectura/escritura Rust limitada a rutas absolutas seleccionadas, extensiones esperadas y 50 MiB.
- Escritura por archivo temporal y rename atómico.
- Validación del contenedor `.trama`: límite comprimido 20 MiB, límite descomprimido 50 MiB, rechazo de rutas absolutas, separadores Windows y `..`.
- SQL con migración versionada y consultas parametrizadas.
- Fixtures ficticios reproducibles en todos los tests.
- Auditoría de licencias antes de release (`pnpm license:audit`).

## Límite crítico

**TRAMA no cifra el contenido sensible en reposo.** No se implementó cifrado interno de SQLite ni del
formato `.trama`, ni una clave maestra en Stronghold, para no simular una garantía incompleta. Hasta
implementar y probar criptografía autenticada con una biblioteca Rust mantenida, TRAMA debe
considerarse una herramienta para datos de prueba o entornos ya protegidos por políticas del
dispositivo (p. ej. FileVault).

**No desactives Gatekeeper, SIP, FileVault, CSP ni el firewall para ejecutar TRAMA.**
