export const TRAMA_SCHEMA_VERSION = 1;
export const TRAMA_APP_VERSION = "0.1.0";

export type UUID = string;

export interface EntityTimestamps {
  id: UUID;
  createdAt: string;
  updatedAt: string;
}

export type CenterRepresentation =
  | "single_person"
  | "family_unit"
  | "embedded_genogram";

export type NodeSize = "small" | "medium" | "large";

export type SourceType =
  | "documented_fact"
  | "client_report"
  | "caregiver_report"
  | "third_party_report"
  | "professional_observation"
  | "professional_inference"
  | "working_hypothesis"
  | "unknown";

export type VerificationStatus =
  | "unverified"
  | "verified"
  | "needs_review"
  | "disputed";

export interface Provenance {
  sourceType?: SourceType;
  sourceDate?: string;
  sourceNote?: string;
  verificationStatus?: VerificationStatus;
}

export type StandardRelationshipType =
  | "strong"
  | "moderate"
  | "weak"
  | "stressful"
  | "conflictual"
  | "broken";

export type ExtendedRelationshipType =
  | "enmeshed"
  | "distant"
  | "ambivalent"
  | "cutoff"
  | "abusive"
  | "mandated"
  | "dependent"
  | "estranged"
  | "coercive"
  | "emerging";

export type RelationshipType =
  | StandardRelationshipType
  | ExtendedRelationshipType;

export type EnergyFlow =
  | "toward_center"
  | "away_from_center"
  | "mutual"
  | "none";

export type SchemaTexCategory =
  | "family"
  | "friends"
  | "work"
  | "education"
  | "health"
  | "mental-health"
  | "religion"
  | "recreation"
  | "legal"
  | "government"
  | "financial"
  | "community"
  | "cultural"
  | "substance"
  | "pet"
  | "other";

export interface Workspace extends EntityTimestamps {
  name: string;
  description: string;
}

export interface EcomapState {
  center: Center;
  systems: SystemNode[];
  connections: Connection[];
  notes: Note[];
}

export interface Ecomap extends EntityTimestamps, EcomapState {
  workspaceId: UUID;
  title: string;
  schemaVersion: number;
  appVersion: string;
}

export interface Center extends EntityTimestamps, Provenance {
  ecomapId: UUID;
  label: string;
  representation: CenterRepresentation;
  description: string;
  notes: string;
}

export interface SystemNode extends EntityTimestamps, Provenance {
  ecomapId: UUID;
  label: string;
  categoryId: UUID;
  description: string;
  size: NodeSize;
  notes: string;
  orderIndex: number;
  /** Reserved for a future authored-coordinate mode; SchemaTex ecomaps are currently auto-laid out. */
  position?: { x: number; y: number };
}

export interface Connection extends EntityTimestamps, Provenance {
  ecomapId: UUID;
  sourceNodeId: UUID;
  targetNodeId: UUID;
  relationshipType: RelationshipType;
  energyFlow: EnergyFlow;
  label: string;
  notes: string;
}

export type NoteTargetKind = "ecomap" | "center" | "system" | "connection";

export interface Note extends EntityTimestamps {
  ecomapId: UUID;
  targetKind: NoteTargetKind;
  targetId: UUID;
  content: string;
}

export interface Snapshot extends EntityTimestamps {
  ecomapId: UUID;
  snapshotAt: string;
  name: string;
  reason: string;
  state: EcomapState;
}

export interface Category extends EntityTimestamps {
  workspaceId: UUID;
  key: string;
  label: string;
  schematexCategory: SchemaTexCategory;
  icon: string;
  visualStyle: "solid" | "outline" | "hatched";
  accent: string;
  hidden: boolean;
  orderIndex: number;
}

export interface Template extends EntityTimestamps {
  workspaceId: UUID;
  name: string;
  description: string;
  kind: "built_in" | "custom";
  state: EcomapState;
}

export interface AuditEvent extends EntityTimestamps {
  workspaceId: UUID;
  ecomapId?: UUID;
  eventType: string;
  targetId?: UUID;
  payload: Record<string, unknown>;
}

export interface RepositoryState {
  workspace: Workspace;
  categories: Category[];
  ecomaps: Ecomap[];
  templates: Template[];
  snapshots: Snapshot[];
}

export const STANDARD_RELATIONSHIPS: readonly StandardRelationshipType[] = [
  "strong",
  "moderate",
  "weak",
  "stressful",
  "conflictual",
  "broken",
];

export const EXTENDED_RELATIONSHIPS: readonly ExtendedRelationshipType[] = [
  "enmeshed",
  "distant",
  "ambivalent",
  "cutoff",
  "abusive",
  "mandated",
  "dependent",
  "estranged",
  "coercive",
  "emerging",
];

export const ENERGY_FLOWS: readonly EnergyFlow[] = [
  "toward_center",
  "away_from_center",
  "mutual",
  "none",
];

export function createId(): UUID {
  return globalThis.crypto?.randomUUID?.() ?? `trama-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function timestamps(id: UUID = createId(), now = nowIso()): EntityTimestamps {
  return { id, createdAt: now, updatedAt: now };
}

export function emptyProvenance(): Provenance {
  return {
    sourceType: "unknown",
    verificationStatus: "unverified",
  };
}

export function createEmptyDocument(
  workspaceId: UUID,
  title = "Ecomapa sin título",
  representation: CenterRepresentation = "single_person",
): Ecomap {
  const documentTimes = timestamps();
  const centerTimes = timestamps();
  return {
    ...documentTimes,
    workspaceId,
    title,
    schemaVersion: TRAMA_SCHEMA_VERSION,
    appVersion: TRAMA_APP_VERSION,
    center: {
      ...centerTimes,
      ecomapId: documentTimes.id,
      label: representation === "family_unit" ? "Unidad familiar" : "Persona central",
      representation,
      description: "",
      notes: "",
      ...emptyProvenance(),
    },
    systems: [],
    connections: [],
    notes: [],
  };
}

export function createSystemNode(
  ecomapId: UUID,
  categoryId: UUID,
  label = "Nuevo sistema",
  orderIndex = 0,
): SystemNode {
  const entityTimes = timestamps();
  return {
    ...entityTimes,
    ecomapId,
    label,
    categoryId,
    description: "",
    size: "medium",
    notes: "",
    orderIndex,
    ...emptyProvenance(),
  };
}

export function createConnection(
  ecomapId: UUID,
  sourceNodeId: UUID,
  targetNodeId: UUID,
): Connection {
  const entityTimes = timestamps();
  return {
    ...entityTimes,
    ecomapId,
    sourceNodeId,
    targetNodeId,
    relationshipType: "moderate",
    energyFlow: "none",
    label: "",
    notes: "",
    ...emptyProvenance(),
  };
}

export function cloneState(document: Ecomap): EcomapState {
  return structuredClone({
    center: document.center,
    systems: document.systems,
    connections: document.connections,
    notes: document.notes,
  });
}

export function withUpdatedTimestamp<T extends EntityTimestamps>(entity: T): T {
  return { ...entity, updatedAt: nowIso() };
}

export function isStandardRelationship(
  relationship: RelationshipType,
): relationship is StandardRelationshipType {
  return (STANDARD_RELATIONSHIPS as readonly string[]).includes(relationship);
}

export function isExtendedRelationship(
  relationship: RelationshipType,
): relationship is ExtendedRelationshipType {
  return (EXTENDED_RELATIONSHIPS as readonly string[]).includes(relationship);
}
