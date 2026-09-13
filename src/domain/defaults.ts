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
  ["family", "Familia", "family", "⌂", "solid", "#FF3B30"], // Red
  ["extended_family", "Familia extensa", "family", "⌁", "outline", "#FF9500"], // Orange
  ["friends_peers", "Amistades / pares", "friends", "◌", "outline", "#34C759"], // Green
  ["education", "Educación", "education", "□", "solid", "#007AFF"], // Blue
  ["work", "Trabajo", "work", "▤", "solid", "#5856D6"], // Indigo
  ["health", "Salud", "health", "＋", "solid", "#FF2D55"], // Pink
  ["mental_health", "Salud mental", "mental-health", "◉", "outline", "#AF52DE"], // Purple
  ["substance_treatment", "Consumo / tratamiento", "substance", "◍", "hatched", "#A2845E"], // Brown
  ["housing", "Vivienda", "government", "⌂", "solid", "#8E8E93"], // Gray
  ["food", "Alimentación", "community", "◒", "outline", "#30B0C7"], // Teal
  ["transport", "Transporte", "government", "⇢", "outline", "#32ADE6"], // Cyan
  ["finance", "Ingresos / finanzas", "financial", "$", "solid", "#00C7BE"], // Mint
  ["government", "Gobierno / servicios públicos", "government", "▦", "solid", "#5856D6"], // Indigo
  ["justice", "Justicia", "legal", "§", "hatched", "#AF52DE"], // Purple
  ["religion", "Religión / espiritualidad", "religion", "✦", "outline", "#FFCC00"], // Yellow
  ["recreation", "Recreación", "recreation", "✳", "outline", "#34C759"], // Green
  ["community", "Comunidad", "community", "✧", "solid", "#007AFF"], // Blue
  ["culture", "Cultura", "cultural", "◈", "outline", "#FF9500"], // Orange
  ["care", "Cuidados", "health", "♡", "solid", "#FF2D55"], // Pink
  ["organizations", "Organizaciones", "community", "▣", "solid", "#32ADE6"], // Cyan
  ["other", "Otro", "other", "•", "outline", "#8E8E93"], // Gray
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
