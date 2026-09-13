# Modelo de datos

Todas las entidades persistentes importantes tienen `id`, `createdAt` y `updatedAt` en el modelo TypeScript. SQLite usa nombres `snake_case` y conserva el documento JSON para una recuperación exacta.

## Entidades

- `Workspace`: espacio local.
- `Ecomap`: documento y versión de esquema/aplicación.
- `Center`: persona o unidad familiar única en 0.1.
- `SystemNode`: sistema del entorno, categoría, prominencia, orden, descripción y notas.
- `Connection`: `sourceNodeId`, `targetNodeId`, `relationshipType` y `energyFlow` como dimensiones distintas, además de etiqueta, notas y procedencia.
- `Category`: catálogo editable previsto, con clave, orden, icono, estilo y acento visual.
- `Note`: contenido polimórfico asociado al documento, centro, sistema o conexión.
- `Snapshot`: estado completo inmutable de trabajo en un instante.
- `Template`: estado ficticio reutilizable.
- `AuditEvent`: evento técnico local sin contenido clínico adicional innecesario.

## Procedencia

Los valores internos son estables en inglés: `documented_fact`, `client_report`, `caregiver_report`, `third_party_report`, `professional_observation`, `professional_inference`, `working_hypothesis` y `unknown`. La UI los traduce como Hecho documentado, Relato de persona atendida, Relato de cuidador/a, Información de tercero, Observación profesional, Inferencia profesional, Hipótesis de trabajo y Sin determinar.

El estado de verificación es independiente: `unverified`, `verified`, `needs_review` o `disputed`.

## Relaciones

El perfil estándar contiene `strong`, `moderate`, `weak`, `stressful`, `conflictual` y `broken`. El perfil extendido contiene `enmeshed`, `distant`, `ambivalent`, `cutoff`, `abusive`, `mandated`, `dependent`, `estranged`, `coercive` y `emerging`. La interfaz siempre rotula ambos grupos.

El flujo energético contiene `toward_center`, `away_from_center`, `mutual` y `none`. Cambiarlo no cambia la relación.

## `.trama`

```text
manifest.json
ecomap.json
snapshots/<uuid>.json
assets/                 # reservado; no se importan rutas absolutas
```

El manifiesto contiene `format`, `formatVersion`, `schemaVersion`, `appVersion`, `createdAt` y `modifiedAt`. El formato actual es ZIP con versión 1.
