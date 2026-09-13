import { Connection, EcomapState, SystemNode } from "./model";

export interface EcomapDiff {
  systemsAdded: SystemNode[];
  systemsRemoved: SystemNode[];
  connectionsAdded: Connection[];
  connectionsRemoved: Connection[];
  relationshipChanges: Array<{ id: string; from: string; to: string; before: string; after: string }>;
  flowChanges: Array<{ id: string; from: string; to: string; before: string; after: string }>;
  categoryChanges: Array<{ id: string; label: string; before: string; after: string }>;
}

export function compareStates(a: EcomapState, b: EcomapState): EcomapDiff {
  const aSystems = new Map(a.systems.map((system) => [system.id, system]));
  const bSystems = new Map(b.systems.map((system) => [system.id, system]));
  const aConnections = new Map(a.connections.map((connection) => [connection.id, connection]));
  const bConnections = new Map(b.connections.map((connection) => [connection.id, connection]));
  const systemsAdded = b.systems.filter((system) => !aSystems.has(system.id));
  const systemsRemoved = a.systems.filter((system) => !bSystems.has(system.id));
  const connectionsAdded = b.connections.filter((connection) => !aConnections.has(connection.id));
  const connectionsRemoved = a.connections.filter((connection) => !bConnections.has(connection.id));
  const relationshipChanges: EcomapDiff["relationshipChanges"] = [];
  const flowChanges: EcomapDiff["flowChanges"] = [];
  for (const [id, before] of aConnections) {
    const after = bConnections.get(id);
    if (!after) continue;
    if (before.relationshipType !== after.relationshipType) {
      relationshipChanges.push({ id, from: before.sourceNodeId, to: before.targetNodeId, before: before.relationshipType, after: after.relationshipType });
    }
    if (before.energyFlow !== after.energyFlow) {
      flowChanges.push({ id, from: before.sourceNodeId, to: before.targetNodeId, before: before.energyFlow, after: after.energyFlow });
    }
  }
  const categoryChanges: EcomapDiff["categoryChanges"] = [];
  for (const [id, before] of aSystems) {
    const after = bSystems.get(id);
    if (after && before.categoryId !== after.categoryId) {
      categoryChanges.push({ id, label: after.label, before: before.categoryId, after: after.categoryId });
    }
  }
  return { systemsAdded, systemsRemoved, connectionsAdded, connectionsRemoved, relationshipChanges, flowChanges, categoryChanges };
}
