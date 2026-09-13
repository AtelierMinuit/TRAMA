# Privacidad

TRAMA 0.1 funciona localmente:

- No solicita cuenta, login, correo ni suscripción.
- No incorpora analytics, publicidad, telemetría, crash reporting cloud ni sincronización propia.
- No contiene requests HTTP de la aplicación.
- Los documentos recientes provienen del almacenamiento local.
- SQLite vive en el directorio de configuración local de la aplicación Tauri.
- Los archivos `.trama` se escriben únicamente después de que el usuario elige una ruta en un diálogo nativo Guardar como.

El almacenamiento local no equivale a cifrado de aplicación. La aplicación no debe afirmar que el contenido de SQLite o `.trama` está cifrado. FileVault, permisos del usuario y otras protecciones del sistema pueden contribuir a la seguridad del dispositivo, pero no fueron convertidos en una garantía de cifrado de datos dentro de TRAMA.

El proyecto no incluye información de NNA, RUT, expedientes ni personas reales. Las plantillas y tests usan nombres ficticios.
