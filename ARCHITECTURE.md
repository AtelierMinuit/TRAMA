# Arquitectura

## Capas

```text
TRAMA Domain Model
        ↓
SchemaTexAdapter
        ↓
SchemaTex DSL
        ↓
SchemaTex parse/layout/render
        ↓
SVG
```

La UI no usa el DSL como base de datos. `src/domain/` contiene las entidades y reglas semánticas; `src/infrastructure/repository.ts` persiste en SQLite; `src/infrastructure/portable.ts` implementa el contenedor `.trama`; `src/infrastructure/exporter.ts` compone exportaciones; `src/adapters/schematex.ts` proyecta y reconstruye la representación visual.

## Decisiones 0.1

- Tauri 2 es el shell de escritorio. No se usa Electron.
- React 19 + TypeScript estricto es la UI. Los textos pasan por `src/i18n/`.
- Rust registra una migración SQLite, comandos acotados de lectura/escritura y menú nativo.
- SQLite guarda el documento JSON completo para recuperación fiel y tablas normalizadas para entidades importantes, auditoría y consultas futuras.
- Las escrituras de documento SQLite se envuelven en `BEGIN/COMMIT/ROLLBACK`.
- El guardado automático usa debounce de 700 ms y solo muestra `Guardado` después de completar la promesa de persistencia.
- El `.trama` se valida en tamaño, estructura, versión y rutas antes de importar.
- El SVG de SchemaTex es una proyección derivada; los metadatos profesionales viven en SQLite/JSON, no en atributos privados inyectados en el SVG.

## SchemaTex

La versión comprobada es 1.0.14. Se usan los imports tree-shakable `schematex/ecomap`, `schematex/react` y `schematex/export`. La edición interactiva de nodos ecomap figura como `canvasEditable=false` en el registro oficial de capacidades actual. Por eso 0.1 permite editar datos desde listas e inspector y reserva el canvas para navegación, layout y representación; no inventa edición por manipulación de SVG.

Las relaciones estándar se proyectan a operadores documentados. Los perfiles extendidos y los flujos que no tienen operador nativo se anotan visiblemente en la etiqueta y se preservan mediante comentarios de adapter/IDs estables. Esto no introduce datos privados en el SVG.

El mini-genograma embebido sigue siendo una abstracción `CenterRepresentation` deshabilitada en la UI, porque SchemaTex lo mantiene en roadmap.

## Persistencia y plataforma

En Tauri se carga `sqlite:trama.db` en el directorio de configuración de la aplicación mediante el plugin SQL oficial. En el navegador de desarrollo se usa una caída local de `localStorage` para poder revisar la UI sin abrir Tauri; esa caída no sustituye SQLite en la app distribuida.

Los únicos comandos Rust expuestos son `read_file_bytes` y `write_file_bytes`, con rutas absolutas, extensiones permitidas, límites de tamaño y escritura temporal atómica. Los diálogos de apertura/guardado son los del plugin Dialog.

## Extensiones futuras

`AnalysisProvider` existe solo como contrato de dominio sin implementación. Esto permite añadir análisis determinista o IA local en otra fase sin acoplar la versión 0.1 a un proveedor remoto.
