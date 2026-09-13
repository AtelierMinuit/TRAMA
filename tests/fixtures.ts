import {
  Category,
  Connection,
  Ecomap,
  createConnection,
  createEmptyDocument,
  createSystemNode,
  nowIso,
} from "../src/domain/model";

export function createFictitiousFixture(): { document: Ecomap; categories: Category[] } {
  const workspaceId = "workspace-fixture";
  const categories: Category[] = [
    {
      id: "category-education",
      workspaceId,
      key: "education",
      label: "Educación",
      schematexCategory: "education",
      icon: "□",
      visualStyle: "solid",
      accent: "#4f7291",
      hidden: false,
      orderIndex: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "category-health",
      workspaceId,
      key: "health",
      label: "Salud",
      schematexCategory: "health",
      icon: "+",
      visualStyle: "outline",
      accent: "#ad5b61",
      hidden: false,
      orderIndex: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "category-community",
      workspaceId,
      key: "community",
      label: "Comunidad",
      schematexCategory: "community",
      icon: "✧",
      visualStyle: "hatched",
      accent: "#53775b",
      hidden: false,
      orderIndex: 2,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];
  const document = createEmptyDocument(workspaceId, "Fixture ficticio", "single_person");
  document.id = "ecomap-fixture";
  document.center.id = "center-fixture";
  document.center.ecomapId = document.id;
  document.center.label = "Persona ficticia";
  document.systems = [
    createSystemNode(document.id, categories[0].id, "Escuela ficticia", 0),
    createSystemNode(document.id, categories[1].id, "Centro de salud ficticio", 1),
    createSystemNode(document.id, categories[2].id, "Plaza comunitaria ficticia", 2),
  ];
  document.systems[0].id = "system-education";
  document.systems[1].id = "system-health";
  document.systems[2].id = "system-community";
  const connections: Connection[] = [
    createConnection(document.id, document.center.id, document.systems[0].id),
    createConnection(document.id, document.center.id, document.systems[1].id),
    createConnection(document.id, document.center.id, document.systems[2].id),
  ];
  connections[0].id = "connection-education";
  connections[0].relationshipType = "strong";
  connections[0].energyFlow = "mutual";
  connections[0].label = "Apoyo estable";
  connections[1].id = "connection-health";
  connections[1].relationshipType = "stressful";
  connections[1].energyFlow = "toward_center";
  connections[1].sourceType = "professional_observation";
  connections[2].id = "connection-community";
  connections[2].relationshipType = "emerging";
  connections[2].energyFlow = "away_from_center";
  connections[2].label = "Participación";
  document.connections = connections;
  document.center.sourceType = "client_report";
  document.center.sourceDate = "2026-02-02";
  document.center.verificationStatus = "needs_review";
  document.center.notes = "Fixture sin datos personales reales.";
  document.updatedAt = nowIso();
  return { document, categories };
}
