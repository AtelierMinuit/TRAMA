import { describe, expect, it } from "vitest";
import {
  ENERGY_FLOWS,
  EXTENDED_RELATIONSHIPS,
  STANDARD_RELATIONSHIPS,
  cloneState,
  createEmptyDocument,
  createConnection,
  isExtendedRelationship,
  isStandardRelationship,
} from "../src/domain/model";
import { compareStates } from "../src/domain/compare";
import { createFictitiousFixture } from "./fixtures";

describe("TRAMA domain model", () => {
  it("keeps relationship type and energy flow as independent dimensions", () => {
    const document = createEmptyDocument("workspace-test");
    const connection = createConnection(document.id, document.center.id, "system-test");
    connection.relationshipType = "conflictual";
    connection.energyFlow = "toward_center";
    expect(connection.relationshipType).toBe("conflictual");
    expect(connection.energyFlow).toBe("toward_center");
    expect(STANDARD_RELATIONSHIPS).toContain(connection.relationshipType);
    expect(ENERGY_FLOWS).toContain(connection.energyFlow);
  });

  it("distinguishes standard and extended relationship profiles", () => {
    expect(STANDARD_RELATIONSHIPS).toHaveLength(6);
    expect(EXTENDED_RELATIONSHIPS).toHaveLength(10);
    expect(isStandardRelationship("broken")).toBe(true);
    expect(isStandardRelationship("enmeshed")).toBe(false);
    expect(isExtendedRelationship("emerging")).toBe(true);
    expect(isExtendedRelationship("strong")).toBe(false);
  });

  it("clones state without sharing mutable arrays", () => {
    const { document } = createFictitiousFixture();
    const state = cloneState(document);
    state.systems[0].label = "Cambio de prueba";
    expect(document.systems[0].label).toBe("Escuela ficticia");
  });

  it("detects temporal changes deterministically", () => {
    const { document } = createFictitiousFixture();
    const before = cloneState(document);
    document.systems[0].categoryId = "category-community";
    document.connections[0].relationshipType = "conflictual";
    document.connections[0].energyFlow = "away_from_center";
    const diff = compareStates(before, cloneState(document));
    expect(diff.categoryChanges).toHaveLength(1);
    expect(diff.relationshipChanges).toHaveLength(1);
    expect(diff.flowChanges).toHaveLength(1);
  });
});
