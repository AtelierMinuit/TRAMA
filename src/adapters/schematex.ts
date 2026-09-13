import {
  Ecomap,
  Category,
  Connection,
  EnergyFlow,
  RelationshipType,
  SchemaTexCategory,
  StandardRelationshipType,
  isExtendedRelationship,
  isStandardRelationship,
} from "../domain/model";
import {
  layoutEcomap,
  parseEcomap,
  renderEcomap,
} from "schematex/ecomap";

type SchemaTexIndividual = {
  id: string;
  label: string;
  properties?: Record<string, string>;
};

type SchemaTexRelationship = {
  from: string;
  to: string;
  type: string;
  label?: string;
  energyFlow?: "from" | "to" | "mutual";
};

type SchemaTexAst = {
  individuals: SchemaTexIndividual[];
  relationships: SchemaTexRelationship[];
  metadata?: Record<string, string>;
};

export interface SchemaTexProjection {
  dsl: string;
  svg: string;
}

const SECTORS = ["top", "right", "bottom", "left"] as const;

const CATEGORY_FALLBACKS: Record<string, SchemaTexCategory> = {
  family: "family",
  extended_family: "family",
  friends_peers: "friends",
  education: "education",
  work: "work",
  health: "health",
  mental_health: "mental-health",
  substance_treatment: "substance",
  housing: "government",
  food: "community",
  transport: "government",
  finance: "financial",
  government: "government",
  justice: "legal",
  religion: "religion",
  recreation: "recreation",
  community: "community",
  culture: "cultural",
  care: "health",
  organizations: "community",
  other: "other",
};

const RELATIONSHIP_OPERATORS: Record<StandardRelationshipType, string> = {
  strong: "===",
  moderate: "==",
  weak: "- -",
  stressful: "~~~",
  conflictual: "~x~",
  broken: "-/-",
};

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  strong: "Fuerte",
  moderate: "Moderada",
  weak: "Débil",
  stressful: "Estresante",
  conflictual: "Conflictiva",
  broken: "Interrumpida / rota",
  enmeshed: "Enredada / fusionada",
  distant: "Distante",
  ambivalent: "Ambivalente",
  cutoff: "Cortada",
  abusive: "Abusiva / dañina",
  mandated: "Mandatada",
  dependent: "Dependiente",
  estranged: "Alejada",
  coercive: "Coercitiva",
  emerging: "Emergente",
};

const FLOW_LABELS: Record<EnergyFlow, string> = {
  toward_center: "hacia centro",
  away_from_center: "desde centro",
  mutual: "mutuo",
  none: "sin dirección",
};

function schemaId(id: string, prefix: "n" | "c"): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${prefix}_${safe}`;
}

function escapeDslString(value: string): string {
  // SchemaTex's ecomap grammar accepts quoted strings but does not define an
  // escape sequence for embedded quotes. Preserve the source in TRAMA and
  // use typographic quotes only in the derived DSL projection.
  return value
    .replace(/\\/g, "∖")
    .replace(/"/g, "“")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function categoryForNode(node: Ecomap["systems"][number], categories: Category[]): SchemaTexCategory {
  const category = categories.find((item) => item.id === node.categoryId);
  return category?.schematexCategory ?? CATEGORY_FALLBACKS[category?.key ?? "other"] ?? "other";
}

function relationshipBase(connection: Connection): StandardRelationshipType {
  if (isStandardRelationship(connection.relationshipType)) {
    return connection.relationshipType;
  }

  // The current SchemaTex ecomap grammar does not expose the extended clinical
  // profile as operators. Keep the extended semantics in TRAMA and render a
  // neutral, explicitly annotated line in the derived SVG.
  return "moderate";
}

function nativeDirectionalOperator(
  base: StandardRelationshipType,
  flow: EnergyFlow,
  leftIsCenter: boolean,
): string {
  if (flow === "none") return RELATIONSHIP_OPERATORS[base];

  // SchemaTex documents directional operators for strong and moderate lines.
  // Other line qualities retain their exact line style and carry flow in the
  // visible edge label instead of a fabricated hybrid operator.
  if (base !== "strong" && base !== "moderate") {
    return RELATIONSHIP_OPERATORS[base];
  }

  if (flow === "mutual") {
    return base === "strong" ? "<=>" : "<->";
  }

  const flowFromLeftToRight = flow === "away_from_center" ? leftIsCenter : !leftIsCenter;
  if (base === "strong") return flowFromLeftToRight ? "===>" : "<===";
  return flowFromLeftToRight ? "==>" : "<==";
}

function connectionLabel(connection: Connection, nativeFlow: boolean): string {
  const labelParts: string[] = [];
  if (connection.label.trim()) labelParts.push(connection.label.trim());
  if (isExtendedRelationship(connection.relationshipType)) {
    labelParts.push(`Extendida: ${RELATIONSHIP_LABELS[connection.relationshipType]}`);
  }
  if (connection.energyFlow !== "none" && !nativeFlow) {
    labelParts.push(`Flujo: ${FLOW_LABELS[connection.energyFlow]}`);
  }
  return labelParts.join(" · ");
}

function nodeDeclaration(
  id: string,
  label: string,
  category: SchemaTexCategory,
  size: Ecomap["systems"][number]["size"],
  sector: (typeof SECTORS)[number],
): string {
  return `${id} [label: "${escapeDslString(label)}", category: ${category}, size: ${size}, sector: ${sector}]`;
}

function centerDeclaration(document: Ecomap): string {
  const id = schemaId(document.center.id, "c");
  return `center: ${id} [label: "${escapeDslString(document.center.label)}"]`;
}

export function toSchemaTexDsl(document: Ecomap, categories: Category[]): string {
  const lines: string[] = [
    `ecomap "${escapeDslString(document.title)}"`,
    `# TRAMA schema ${document.schemaVersion}`,
    `# TRAMA center-id ${document.center.id}`,
    centerDeclaration(document),
  ];

  const orderedSystems = [...document.systems].sort((a, b) => a.orderIndex - b.orderIndex);
  orderedSystems.forEach((node, index) => {
    lines.push(`# TRAMA node-id ${node.id}`);
    lines.push(nodeDeclaration(
      schemaId(node.id, "n"),
      node.label,
      categoryForNode(node, categories),
      node.size,
      SECTORS[index % SECTORS.length],
    ));
  });

  const centerId = schemaId(document.center.id, "c");
  for (const connection of document.connections) {
    const sourceId = connection.sourceNodeId === document.center.id
      ? centerId
      : schemaId(connection.sourceNodeId, "n");
    const targetId = connection.targetNodeId === document.center.id
      ? centerId
      : schemaId(connection.targetNodeId, "n");
    const leftIsCenter = sourceId === centerId;
    const base = relationshipBase(connection);
    const supportsNativeFlow = (base === "strong" || base === "moderate") && connection.energyFlow !== "none";
    const operator = nativeDirectionalOperator(base, connection.energyFlow, leftIsCenter);
    const label = connectionLabel(connection, supportsNativeFlow);
    lines.push(`# TRAMA connection-id ${connection.id} relationship ${connection.relationshipType} flow ${connection.energyFlow}`);
    lines.push(`${sourceId} ${operator} ${targetId}${label ? ` [label: "${escapeDslString(label)}"]` : ""}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderSchemaTex(
  document: Ecomap,
  categories: Category[],
  theme: "light" | "dark" | "monochrome" = "light",
): SchemaTexProjection {
  const dsl = toSchemaTexDsl(document, categories);
  const ast = parseEcomap(dsl);
  const layout = layoutEcomap(ast, {
    nodeSpacingX: 150,
    nodeSpacingY: 110,
    nodeWidth: 190,
    nodeHeight: 84,
  });
  const svg = renderEcomap(layout, {
    fontFamily: "Avenir Next, Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 16,
    theme,
    padding: 56,
    showAge: false,
    showAnnotations: false,
    showEdgeLabels: true,
    legendPosition: "none",
  }, ast);
  return { dsl, svg };
}

function parseTramaComments(dsl: string): Array<{ id: string; relationship?: RelationshipType; flow?: EnergyFlow }> {
  const metadata: Array<{ id: string; relationship?: RelationshipType; flow?: EnergyFlow }> = [];
  for (const line of dsl.split(/\r?\n/)) {
    const match = line.match(/^# TRAMA connection-id\s+(\S+)\s+relationship\s+(\S+)\s+flow\s+(\S+)/);
    if (!match) continue;
    const [, id, relationship, flow] = match;
    metadata.push({
      id,
      relationship: relationship as RelationshipType,
      flow: flow as EnergyFlow,
    });
  }
  return metadata;
}

function asSchemaTexAst(value: unknown): SchemaTexAst {
  if (!value || typeof value !== "object") throw new Error("SchemaTex devolvió un AST inválido.");
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.individuals) || !Array.isArray(record.relationships)) {
    throw new Error("El AST de SchemaTex no contiene individuos y relaciones.");
  }
  return {
    individuals: record.individuals as SchemaTexIndividual[],
    relationships: record.relationships as SchemaTexRelationship[],
    metadata: record.metadata as Record<string, string> | undefined,
  };
}

function relationshipFromSchema(
  schemaType: string,
  previous: RelationshipType | undefined,
): RelationshipType {
  if (previous && isExtendedRelationship(previous)) return previous;
  switch (schemaType) {
    case "strong": return "strong";
    case "moderate": return "moderate";
    case "weak": return "weak";
    case "stressful": return "stressful";
    case "conflictual": return "conflictual";
    case "broken": return "broken";
    case "stressful-strong": return "stressful";
    default: return "moderate";
  }
}

function flowFromSchema(
  relationship: SchemaTexRelationship,
  centerId: string,
): EnergyFlow {
  if (relationship.energyFlow === "mutual") return "mutual";
  if (relationship.energyFlow === "from") return relationship.from === centerId ? "away_from_center" : "toward_center";
  if (relationship.energyFlow === "to") return relationship.to === centerId ? "toward_center" : "away_from_center";
  return "none";
}

export function fromSchemaTexDsl(dsl: string, previous: Ecomap): Ecomap {
  const ast = asSchemaTexAst(parseEcomap(dsl));
  const centerIndividual = ast.individuals.find((item) => item.properties?.center === "true");
  if (!centerIndividual) throw new Error("El DSL no contiene un centro de ecomapa.");

  const systemBySchemaId = new Map<string, Ecomap["systems"][number]>();
  const previousBySchemaId = new Map<string, Ecomap["systems"][number]>();
  previous.systems.forEach((node) => previousBySchemaId.set(schemaId(node.id, "n"), node));
  const now = new Date().toISOString();

  const center = {
    ...previous.center,
    label: centerIndividual.label,
    updatedAt: now,
  };

  const systems = ast.individuals
    .filter((item) => item.id !== centerIndividual.id)
    .map((item, index) => {
      const old = previousBySchemaId.get(item.id);
      const node = old ? {
        ...old,
        label: item.label,
        orderIndex: index,
        updatedAt: now,
      } : {
        id: item.id.replace(/^n_/, ""),
        ecomapId: previous.id,
        label: item.label,
        categoryId: previous.systems[0]?.categoryId ?? "",
        description: "",
        size: (item.properties?.size as Ecomap["systems"][number]["size"] | undefined) ?? "medium",
        notes: "",
        sourceType: "unknown" as const,
        verificationStatus: "unverified" as const,
        orderIndex: index,
        createdAt: now,
        updatedAt: now,
      };
      systemBySchemaId.set(item.id, node);
      return node;
    });

  const previousByEndpoints = new Map<string, Connection>();
  previous.connections.forEach((connection) => {
    previousByEndpoints.set(`${connection.sourceNodeId}|${connection.targetNodeId}`, connection);
    previousByEndpoints.set(`${connection.targetNodeId}|${connection.sourceNodeId}`, connection);
  });
  const commentMetadata = parseTramaComments(dsl);
  const centerId = centerIndividual.id;
  const connections = ast.relationships.map((relationship, index) => {
    const source = relationship.from === centerId
      ? previous.center.id
      : systemBySchemaId.get(relationship.from)?.id ?? relationship.from.replace(/^n_/, "");
    const target = relationship.to === centerId
      ? previous.center.id
      : systemBySchemaId.get(relationship.to)?.id ?? relationship.to.replace(/^n_/, "");
    const old = previousByEndpoints.get(`${source}|${target}`);
    const flow = flowFromSchema(relationship, centerId);
    const comment = commentMetadata[index];
    const relationshipType = comment?.relationship ?? relationshipFromSchema(relationship.type, old?.relationshipType);
    const energyFlow = comment?.flow ?? flow;
    const entity = old ?? {
      id: comment?.id ?? createStableConnectionId(previous.id, source, target, index),
      ecomapId: previous.id,
      sourceNodeId: source,
      targetNodeId: target,
      relationshipType: "moderate" as RelationshipType,
      energyFlow: "none" as EnergyFlow,
      label: "",
      notes: "",
      sourceType: "unknown" as const,
      verificationStatus: "unverified" as const,
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...entity,
      sourceNodeId: source,
      targetNodeId: target,
      relationshipType,
      energyFlow,
      label: stripProjectionAnnotations(relationship.label ?? entity.label, relationshipType, energyFlow),
      updatedAt: now,
    };
  });

  return {
    ...previous,
    center,
    systems,
    connections,
    updatedAt: now,
  };
}

function stripProjectionAnnotations(label: string, relationship: RelationshipType, flow: EnergyFlow): string {
  let result = label;
  const annotations: string[] = [];
  if (isExtendedRelationship(relationship)) annotations.push(`Extendida: ${RELATIONSHIP_LABELS[relationship]}`);
  if (flow !== "none") annotations.push(`Flujo: ${FLOW_LABELS[flow]}`);
  for (const annotation of annotations) {
    result = result === annotation ? "" : result.replace(` · ${annotation}`, "");
  }
  return result.trim();
}

function createStableConnectionId(ecomapId: string, source: string, target: string, index: number): string {
  return `conn-${ecomapId.slice(0, 8)}-${source.slice(0, 8)}-${target.slice(0, 8)}-${index}`;
}
