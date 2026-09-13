import { describe, expect, it } from "vitest";
import { fromSchemaTexDsl, renderSchemaTex, toSchemaTexDsl } from "../src/adapters/schematex";
import { createFictitiousFixture } from "./fixtures";

describe("SchemaTexAdapter", () => {
  it("creates a valid SchemaTex projection with stable TRAMA IDs", () => {
    const { document, categories } = createFictitiousFixture();
    const dsl = toSchemaTexDsl(document, categories);
    expect(dsl).toContain('ecomap "Fixture ficticio"');
    expect(dsl).toContain("# TRAMA center-id center-fixture");
    expect(dsl).toContain("# TRAMA connection-id connection-community relationship emerging flow away_from_center");
    expect(() => renderSchemaTex(document, categories)).not.toThrow();
    expect(renderSchemaTex(document, categories).svg).toContain("<svg");
  });

  it("round-trips nodes, labels, relationship types and flows", () => {
    const { document, categories } = createFictitiousFixture();
    const reconstructed = fromSchemaTexDsl(toSchemaTexDsl(document, categories), document);
    expect(reconstructed.center.label).toBe(document.center.label);
    expect(reconstructed.systems.map((system) => system.label)).toEqual(document.systems.map((system) => system.label));
    expect(reconstructed.connections.map((connection) => connection.relationshipType)).toEqual(document.connections.map((connection) => connection.relationshipType));
    expect(reconstructed.connections.map((connection) => connection.energyFlow)).toEqual(document.connections.map((connection) => connection.energyFlow));
    expect(reconstructed.connections.map((connection) => connection.label)).toEqual(document.connections.map((connection) => connection.label));
  });
});
