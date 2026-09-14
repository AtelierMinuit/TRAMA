# Recursos de diseño considerados

TRAMA prioriza recursos vectoriales, accesibles y compatibles con AGPL-3.0-only. No incorpora capturas, logos, ilustraciones ni componentes propietarios de Ecomap Creator.

## Selección actual

- [Lucide](https://github.com/lucide-icons/lucide) — ISC. Ya se utiliza mediante `lucide-react` para iconos de navegación, acciones y categorías. Su trazo consistente funciona en claro, oscuro, monocromo y alto contraste.
- [Tabler Icons](https://github.com/tabler/tabler-icons) — MIT. Candidato para ampliar el catálogo si Lucide no cubre una necesidad concreta; no se añade mientras exista cobertura suficiente.
- [Radix Icons](https://github.com/radix-ui/icons) — MIT. Candidato para controles muy compactos y estados de interfaz; no se mezcla con la familia principal sin una decisión visual explícita.
- [Phosphor Icons](https://github.com/phosphor-icons/core) — MIT. Candidato para pesos de trazo alternativos en futuras herramientas de análisis; no se incorpora en 0.1 para evitar duplicación.
- [xyflow/xyflow](https://github.com/xyflow/xyflow) — MIT. Referencia técnica para una futura capa de edición de grafos; no reemplaza SchemaTex en 0.1 porque TRAMA necesita conservar el adaptador DSL y su semántica profesional.
- [Mermaid](https://github.com/mermaid-js/mermaid) — MIT. Referencia para diagramas documentales y exportaciones futuras; no se usa como renderizador del ecomapa.

## Criterios

1. Licencia explícita y compatible con la distribución de TRAMA.
2. SVG accesible, escalable y legible sin depender únicamente del color.
3. Importación local, sin fuentes remotas, telemetría ni requests ocultas.
4. API estable y posibilidad de imports tree-shakable.
5. No introducir un segundo motor de layout mientras SchemaTex sea el renderizador de ecomapas.

La auditoría ejecutable sigue siendo `pnpm license:audit`. Las dependencias efectivamente instaladas y sus expresiones de licencia permanecen en `DEPENDENCIES.md` y `THIRD_PARTY_NOTICES.md`.
