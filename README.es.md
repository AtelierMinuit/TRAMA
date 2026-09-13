# TRAMA · documentación en español

TRAMA convierte un ecomapa en datos estructurados: persona o familia central, sistemas del entorno, calidad del vínculo, dirección del flujo, procedencia y cambios temporales. Todo se almacena localmente; no hay cuentas, nube, analítica, telemetría ni servidor propio.

## Recorrido rápido

1. Abre TRAMA y elige **Nuevo ecomapa** o una plantilla ficticia.
2. Define el centro como persona o unidad familiar.
3. Añade sistemas desde la columna izquierda.
4. Selecciona **Conectar** y define origen, destino, relación y flujo por separado.
5. Selecciona elementos para editar nombre, categoría, prominencia, procedencia y notas en el inspector.
6. Usa **Guardar**, **Historial** y **Exportar**. `⌘S` guarda; `⌘⇧S` crea un archivo `.trama`.

Los archivos `.trama` son ZIP abiertos con `manifest.json`, `ecomap.json` y snapshots JSON. Se validan antes de ser incorporados y se rechazan entradas con path traversal, tamaños excesivos o versiones incompatibles.

## Aviso profesional

Las etiquetas de procedencia distinguen hechos documentados, relatos, observación, inferencia e hipótesis. Una inferencia nunca debe leerse como hecho por defecto. El perfil de relaciones extendidas se muestra separado del conjunto estándar.

## Cifrado

La base local no afirma cifrado de aplicación. FileVault y la seguridad del sistema pueden proteger el dispositivo, pero no reemplazan una estrategia de cifrado de contenido con clave protegida por el sistema. Esa capacidad queda bloqueante antes de recomendar datos personales reales.

Consulta `ARCHITECTURE.md`, `DATA_MODEL.md`, `PRIVACY.md` y `SECURITY.md` para el detalle técnico.
