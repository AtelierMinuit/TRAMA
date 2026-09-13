import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import {
  cloneState,
  createConnection,
  createEmptyDocument,
  createId,
  createSystemNode,
} from "../src/domain/model";
import { deserializePortable, serializePortable } from "../src/infrastructure/portable";
import { createFictitiousFixture } from "./fixtures";

function buildArchive(files: Record<string, string>): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    entries[path] = strToU8(content);
  }
  return zipSync(entries);
}

function validManifest(document: ReturnType<typeof createFictitiousFixture>["document"]): string {
  return JSON.stringify({
    format: "trama",
    formatVersion: 1,
    schemaVersion: 1,
    appVersion: "0.1.0",
    createdAt: document.createdAt,
    modifiedAt: document.updatedAt,
  });
}

describe("resistencia del formato .trama y datos corruptos", () => {
  it("rechaza un archivo vacío", () => {
    expect(() => deserializePortable(new Uint8Array(0))).toThrow(/vac/);
  });

  it("rechaza bytes que no son un ZIP válido", () => {
    const junk = strToU8("esto no es un contenedor zip válido");
    expect(() => deserializePortable(junk)).toThrow(/válido/);
  });

  it("rechaza un .trama sin manifiesto", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({ "ecomap.json": JSON.stringify(document) });
    expect(() => deserializePortable(archive)).toThrow(/manifest/);
  });

  it("rechaza un .trama sin ecomapa", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({ "manifest.json": validManifest(document) });
    expect(() => deserializePortable(archive)).toThrow(/ecomap/);
  });

  it("rechaza un manifiesto con formato equivocado", () => {
    const { document } = createFictitiousFixture();
    const badManifest = JSON.stringify({ format: "otro", formatVersion: 1, schemaVersion: 1, appVersion: "0.1.0", createdAt: document.createdAt, modifiedAt: document.updatedAt });
    const archive = buildArchive({ "manifest.json": badManifest, "ecomap.json": JSON.stringify(document) });
    expect(() => deserializePortable(archive)).toThrow(/manifiesto/);
  });

  it("rechaza un manifiesto con una versión de esquema del futuro", () => {
    const { document } = createFictitiousFixture();
    const futureManifest = JSON.stringify({ format: "trama", formatVersion: 1, schemaVersion: 999, appVersion: "0.1.0", createdAt: document.createdAt, modifiedAt: document.updatedAt });
    const archive = buildArchive({ "manifest.json": futureManifest, "ecomap.json": JSON.stringify(document) });
    expect(() => deserializePortable(archive)).toThrow(/versión/);
  });

  it("rechaza un ecomapa con JSON corrupto en ecomap.json", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": "{ no es json valido :::: ",
    });
    expect(() => deserializePortable(archive)).toThrow(/JSON/);
  });

  it("rechaza un ecomapa sin la estructura mínima requerida", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": JSON.stringify({ id: "x", title: "falta el centro" }),
    });
    expect(() => deserializePortable(archive)).toThrow(/estructura/);
  });

  it("rechaza un ecomapa con campos obligatorios inválidos", () => {
    const { document } = createFictitiousFixture();
    const broken = { ...document, id: 42, workspaceId: true };
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": JSON.stringify(broken),
    });
    expect(() => deserializePortable(archive)).toThrow(/obligatorios/);
  });

  it("rechaza un sistema sin ID válido", () => {
    const { document } = createFictitiousFixture();
    const broken = { ...document, systems: [{ label: "sin id" }] } as unknown;
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": JSON.stringify(broken),
    });
    expect(() => deserializePortable(archive)).toThrow(/sistema/);
  });

  it("rechaza un snapshot sin estructura esperada", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": JSON.stringify(document),
      "snapshots/bad.json": JSON.stringify({ id: "x" }),
    });
    expect(() => deserializePortable(archive)).toThrow(/snapshot/);
  });

  it("rechaza entradas en rutas no permitidas", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": JSON.stringify(document),
      "evil.exe": "payload",
    });
    expect(() => deserializePortable(archive)).toThrow(/no permitida/);
  });

  it("rechaza un paquete que excede el tamaño máximo", () => {
    const { document } = createFictitiousFixture();
    const archive = buildArchive({
      "manifest.json": validManifest(document),
      "ecomap.json": JSON.stringify(document),
      "assets/blob.bin": "A".repeat(51 * 1024 * 1024),
    });
    expect(() => deserializePortable(archive)).toThrow(/descomprimido/);
  });
});

describe("documento vacío y casos extremos", () => {
  it("serializa y reabre un ecomapa recién creado sin sistemas", () => {
    const document = createEmptyDocument("ws-empty", "Vacío ficticio", "family_unit");
    const bytes = serializePortable(document, []);
    const reopened = deserializePortable(bytes).document;
    expect(reopened.systems).toEqual([]);
    expect(reopened.connections).toEqual([]);
    expect(reopened.center.representation).toBe("family_unit");
  });

  it("mantiene caracteres Unicode y nombres largos intactos", () => {
    const document = createEmptyDocument("ws-unicode", "Caso Ñandú — Año bisiesto 2026", "single_person");
    document.center.label = "Trabajadora social Ñoña Ñandú";
    document.center.notes = "Marcadores: ☊ ☋ ⚕ ✦ — caractères accentués: éàüñ";
    const longLabel = "Sistema con nombre extremadamente largo ".repeat(6) + "fin";
    const system = createSystemNode(document.id, "cat-x", longLabel, 0);
    document.systems = [system];
    const bytes = serializePortable(document, []);
    const reopened = deserializePortable(bytes).document;
    expect(reopened.title).toBe("Caso Ñandú — Año bisiesto 2026");
    expect(reopened.center.label).toBe("Trabajadora social Ñoña Ñandú");
    expect(reopened.center.notes).toContain("caractères accentués");
    expect(reopened.systems[0].label).toBe(longLabel);
  });
});

describe("ecomapa grande (fixture de estrés)", () => {
  it("serializa y reabre 1 centro, 50 sistemas y 100 conexiones", () => {
    const document = createEmptyDocument("ws-stress", "Fixture de estrés ficticio", "single_person");
    document.id = "stress-fixture";
    document.center.id = "center-stress";
    document.center.ecomapId = document.id;
    const systems = [];
    for (let index = 0; index < 50; index++) {
      const node = createSystemNode(document.id, "cat-stress", `Sistema ficticio ${index}`, index);
      node.id = `system-stress-${index}`;
      systems.push(node);
    }
    document.systems = systems;
    const connections = [];
    for (let index = 0; index < 100; index++) {
      const source = index % 2 === 0 ? document.center.id : systems[index % 50].id;
      const target = systems[(index * 7) % 50].id;
      const connection = createConnection(document.id, source, target);
      connection.id = `connection-stress-${index}`;
      connections.push(connection);
    }
    document.connections = connections;

    const bytes = serializePortable(document, []);
    const reopened = deserializePortable(bytes).document;
    expect(reopened.systems).toHaveLength(50);
    expect(reopened.connections).toHaveLength(100);
    const snapshot = cloneState(document);
    expect(snapshot.systems).toHaveLength(50);
    expect(snapshot.connections).toHaveLength(100);
  });
});

describe("identidad de datos tras ida y vuelta", () => {
  it("el reimport reproduce exactamente sistemas, conexiones y snapshots", () => {
    const { document } = createFictitiousFixture();
    const snapshot = {
      id: createId(),
      ecomapId: document.id,
      snapshotAt: "2026-03-01T00:00:00.000Z",
      name: "Revisión ficticia",
      reason: "Verificación de identidad",
      state: cloneState(document),
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };
    const bytes = serializePortable(document, [snapshot]);
    const imported = deserializePortable(bytes);
    expect(imported.document.systems.map((s) => s.id)).toEqual(document.systems.map((s) => s.id));
    expect(imported.document.connections.map((c) => c.id)).toEqual(document.connections.map((c) => c.id));
    expect(imported.snapshots).toHaveLength(1);
    expect(imported.snapshots[0].state.systems).toHaveLength(document.systems.length);
  });
});
