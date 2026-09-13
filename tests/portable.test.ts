import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { deserializePortable, serializePortable } from "../src/infrastructure/portable";
import { createFictitiousFixture } from "./fixtures";

describe("formato portable .trama", () => {
  it("serializes and validates a portable package with snapshots", () => {
    const { document } = createFictitiousFixture();
    const bytes = serializePortable(document, [{
      id: "snapshot-fixture",
      ecomapId: document.id,
      snapshotAt: "2026-02-03T00:00:00.000Z",
      name: "Primera revisión ficticia",
      reason: "Fixture reproducible",
      state: { center: document.center, systems: document.systems, connections: document.connections, notes: [] },
      createdAt: "2026-02-03T00:00:00.000Z",
      updatedAt: "2026-02-03T00:00:00.000Z",
    }]);
    const imported = deserializePortable(bytes);
    expect(imported.manifest.format).toBe("trama");
    expect(imported.document.id).toBe(document.id);
    expect(imported.snapshots).toHaveLength(1);
  });

  it("rejects path traversal entries", () => {
    const { document } = createFictitiousFixture();
    const manifest = JSON.stringify({ format: "trama", formatVersion: 1, schemaVersion: 1, appVersion: "0.1.0", createdAt: document.createdAt, modifiedAt: document.updatedAt });
    const malicious = zipSync({
      "manifest.json": strToU8(manifest),
      "ecomap.json": strToU8(JSON.stringify(document)),
      "../outside.json": strToU8("should not be accepted"),
    });
    expect(() => deserializePortable(malicious)).toThrow(/Ruta no permitida/);
  });
});
