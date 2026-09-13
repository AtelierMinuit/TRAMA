import {
  Category,
  CenterRepresentation,
  EcomapState,
  Template,
  StandardRelationshipType,
  createConnection,
  createEmptyDocument,
  createId,
  createSystemNode,
  nowIso,
  timestamps,
} from "./model";

const categorySeed: Array<[
  string,
  string,
  Category["schematexCategory"],
  string,
  Category["visualStyle"],
  string,
]> = [
  ["family", "Familia", "family", "⌂", "solid", "#ad5b4a"],
  ["extended_family", "Familia extensa", "family", "⌁", "outline", "#b77743"],
  ["friends_peers", "Amistades / pares", "friends", "◌", "outline", "#477b78"],
  ["education", "Educación", "education", "□", "solid", "#4f7291"],
  ["work", "Trabajo", "work", "▤", "solid", "#68735b"],
  ["health", "Salud", "health", "＋", "solid", "#ad5b61"],
  ["mental_health", "Salud mental", "mental-health", "◉", "outline", "#75639a"],
  ["substance_treatment", "Consumo / tratamiento", "substance", "◍", "hatched", "#8b6d4f"],
  ["housing", "Vivienda", "government", "⌂", "solid", "#78725f"],
  ["food", "Alimentación", "community", "◒", "outline", "#6f7f4f"],
  ["transport", "Transporte", "government", "⇢", "outline", "#5e7687"],
  ["finance", "Ingresos / finanzas", "financial", "$", "solid", "#667a61"],
  ["government", "Gobierno / servicios públicos", "government", "▦", "solid", "#596d82"],
  ["justice", "Justicia", "legal", "§", "hatched", "#7c606b"],
  ["religion", "Religión / espiritualidad", "religion", "✦", "outline", "#806d53"],
  ["recreation", "Recreación", "recreation", "✳", "outline", "#4e7a72"],
  ["community", "Comunidad", "community", "✧", "solid", "#53775b"],
  ["culture", "Cultura", "cultural", "◈", "outline", "#886070"],
  ["care", "Cuidados", "health", "♡", "solid", "#a35c62"],
  ["organizations", "Organizaciones", "community", "▣", "solid", "#5d7182"],
  ["other", "Otro", "other", "•", "outline", "#747474"],
];

export function createDefaultCategories(workspaceId: string): Category[] {
  const now = nowIso();
  return categorySeed.map(([key, label, schematexCategory, icon, visualStyle, accent], index) => ({
    ...timestamps(createId(), now),
    workspaceId,
    key,
    label,
    schematexCategory,
    icon,
    visualStyle,
    accent,
    hidden: false,
    orderIndex: index,
  }));
}

function templateState(
  workspaceId: string,
  centerLabel: string,
  representation: CenterRepresentation,
  systems: Array<{ label: string; categoryKey: string; relationship: StandardRelationshipType; flow: "toward_center" | "away_from_center" | "mutual" | "none"; note?: string }>,
  categories: Category[],
): EcomapState {
  const document = createEmptyDocument(workspaceId, "Plantilla", representation);
  document.center.label = centerLabel;
  document.systems = systems.map((system, index) => {
    const category = categories.find((item) => item.key === system.categoryKey) ?? categories[0];
    if (!category) throw new Error("No hay categorías disponibles para crear la plantilla.");
    const node = createSystemNode(document.id, category.id, system.label, index);
    node.notes = system.note ?? "";
    return node;
  });
  document.connections = document.systems.map((node, index) => {
    const connection = createConnection(document.id, document.center.id, node.id);
    connection.relationshipType = systems[index].relationship;
    connection.energyFlow = systems[index].flow;
    return connection;
  });
  return {
    center: document.center,
    systems: document.systems,
    connections: document.connections,
    notes: [],
  };
}

export function createBuiltInTemplates(workspaceId: string, categories: Category[]): Template[] {
  const definitions: Array<{
    name: string;
    description: string;
    centerLabel: string;
    representation: CenterRepresentation;
    systems: Parameters<typeof templateState>[3];
  }> = [
    {
      name: "Persona individual",
      description: "Un punto de partida sobrio para mapear apoyos y tensiones personales.",
      centerLabel: "Persona central",
      representation: "single_person",
      systems: [
        { label: "Persona de apoyo", categoryKey: "friends_peers", relationship: "strong", flow: "mutual" },
        { label: "Centro de salud", categoryKey: "health", relationship: "moderate", flow: "toward_center" },
        { label: "Trabajo o estudio", categoryKey: "work", relationship: "weak", flow: "away_from_center" },
      ],
    },
    {
      name: "Familia",
      description: "Unidad familiar con familia extensa, educación y comunidad.",
      centerLabel: "Unidad familiar",
      representation: "family_unit",
      systems: [
        { label: "Familia extensa", categoryKey: "extended_family", relationship: "strong", flow: "mutual" },
        { label: "Escuela", categoryKey: "education", relationship: "moderate", flow: "toward_center" },
        { label: "Comunidad cercana", categoryKey: "community", relationship: "weak", flow: "none" },
      ],
    },
    {
      name: "Adolescente y redes",
      description: "Redes cotidianas ficticias para una lectura ecológica inicial.",
      centerLabel: "Adolescente",
      representation: "single_person",
      systems: [
        { label: "Pares", categoryKey: "friends_peers", relationship: "strong", flow: "mutual" },
        { label: "Liceo", categoryKey: "education", relationship: "stressful", flow: "away_from_center" },
        { label: "Taller comunitario", categoryKey: "recreation", relationship: "moderate", flow: "toward_center" },
      ],
    },
    {
      name: "Persona mayor",
      description: "Sistemas de apoyo, cuidados, salud y transporte.",
      centerLabel: "Persona mayor",
      representation: "single_person",
      systems: [
        { label: "Red de cuidados", categoryKey: "care", relationship: "strong", flow: "toward_center" },
        { label: "Centro de salud", categoryKey: "health", relationship: "moderate", flow: "toward_center" },
        { label: "Transporte local", categoryKey: "transport", relationship: "weak", flow: "away_from_center" },
      ],
    },
    {
      name: "Red comunitaria",
      description: "Mapa de apoyos colectivos y organizaciones del territorio.",
      centerLabel: "Red comunitaria",
      representation: "family_unit",
      systems: [
        { label: "Organización barrial", categoryKey: "organizations", relationship: "strong", flow: "mutual" },
        { label: "Municipio", categoryKey: "government", relationship: "moderate", flow: "toward_center" },
        { label: "Espacio cultural", categoryKey: "culture", relationship: "strong", flow: "mutual" },
      ],
    },
    {
      name: "Ingreso a intervención",
      description: "Base de trabajo para registrar apoyos, servicios y fuentes.",
      centerLabel: "Persona o familia",
      representation: "family_unit",
      systems: [
        { label: "Equipo profesional", categoryKey: "organizations", relationship: "moderate", flow: "toward_center" },
        { label: "Vivienda", categoryKey: "housing", relationship: "stressful", flow: "away_from_center" },
        { label: "Ingresos", categoryKey: "finance", relationship: "weak", flow: "toward_center" },
      ],
    },
  ];

  return definitions.map((definition) => ({
    ...timestamps(),
    workspaceId,
    name: definition.name,
    description: definition.description,
    kind: "built_in",
    state: templateState(
      workspaceId,
      definition.centerLabel,
      definition.representation,
      definition.systems,
      categories,
    ),
  }));
}
