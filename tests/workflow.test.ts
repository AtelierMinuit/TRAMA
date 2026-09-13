import { describe, expect, it } from "vitest";
import { compareStates } from "../src/domain/compare";
import { cloneState } from "../src/domain/model";
import { renderSchemaTex } from "../src/adapters/schematex";
import { deserializePortable, serializePortable } from "../src/infrastructure/portable";
import { createFictitiousFixture } from "./fixtures";

describe("flujo estructurado reproducible", () => {
  it("crea, serializa, reabre, compara y renderiza un ecomapa ficticio", () => {
    const { document, categories } = createFictitiousFixture();
    const versionA = cloneState(document);
    document.systems[2].notes = "Nota ficticia de seguimiento";
    document.connections[2].relationshipType = "strong";
    const versionB = cloneState(document);
    const packageBytes = serializePortable(document, [{
      id: "workflow-snapshot",
      ecomapId: document.id,
      snapshotAt: document.updatedAt,
      name: "Versión A",
      reason: "Prueba de flujo",
      state: versionA,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }]);
    const reopened = deserializePortable(packageBytes).document;
    const diff = compareStates(versionA, versionB);
    expect(reopened.connections).toHaveLength(3);
    expect(diff.relationshipChanges).toHaveLength(1);
    expect(renderSchemaTex(reopened, categories).svg).toMatch(/^<svg/);
  });
});
