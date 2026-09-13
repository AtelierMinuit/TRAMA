# Seguridad

## Medidas implementadas

- CSP explícita sin `connect-src` remoto.
- Capabilities Tauri mínimas para core, Dialog y SQL; no se habilita shell ni filesystem plugin global.
- Lectura/escritura Rust limitada a rutas absolutas seleccionadas, extensiones esperadas y 50 MiB.
- Escritura por archivo temporal y rename.
- Validación del contenedor `.trama`, límite comprimido de 20 MiB, límite descomprimido de 50 MiB y rechazo de rutas absolutas, separadores Windows y `..`.
- SQL con migración versionada y consultas parametrizadas.
- Fixtures ficticios reproducibles.
- Auditoría de licencias antes de release.

## Límite crítico

No está implementado el cifrado interno de contenido sensible ni una clave maestra almacenada en Stronghold. Stronghold no se añadió para evitar simular una garantía incompleta. Hasta implementar y probar criptografía autenticada con una biblioteca Rust mantenida, TRAMA 0.1 debe considerarse una herramienta para datos de prueba o entornos ya protegidos por políticas del dispositivo.

## Revisión antes de un release sensible

1. Diseñar el flujo de clave y recuperación sin almacenar la clave junto al ciphertext.
2. Usar una biblioteca Rust mantenida para AEAD, con nonce único y verificación de autenticidad.
3. Integrar la clave maestra con el mecanismo seguro del sistema/Stronghold.
4. Probar migración, bloqueo, recuperación, corrupción y borrado de claves.
5. Auditar capabilities, permisos, exportación y logs para no filtrar contenido.

No se debe desactivar Gatekeeper, SIP, FileVault, CSP ni el firewall para ejecutar TRAMA.
