import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { Ecomap, Snapshot, TRAMA_APP_VERSION, TRAMA_SCHEMA_VERSION } from "../domain/model";

const MAX_PACKAGE_BYTES = 20 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;

export interface PortableManifest {
  format: "trama";
  formatVersion: 1;
  schemaVersion: number;
  appVersion: string;
  createdAt: string;
  modifiedAt: string;
}

export interface PortableImport {
  manifest: PortableManifest;
  document: Ecomap;
  snapshots: Snapshot[];
}

export function createManifest(document: Ecomap): PortableManifest {
  return {
    format: "trama",
    formatVersion: 1,
    schemaVersion: document.schemaVersion,
    appVersion: document.appVersion || TRAMA_APP_VERSION,
    createdAt: document.createdAt,
    modifiedAt: document.updatedAt,
  };
}

export function serializePortable(document: Ecomap, snapshots: Snapshot[] = []): Uint8Array {
  const manifest = createManifest(document);
  const files: Record<string, Uint8Array> = {
    "manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
    "ecomap.json": strToU8(JSON.stringify(document, null, 2)),
  };
  for (const snapshot of snapshots) {
    files[`snapshots/${snapshot.id}.json`] = strToU8(JSON.stringify(snapshot, null, 2));
  }
  return zipSync(files, { level: 6 });
}

export function deserializePortable(bytes: Uint8Array): PortableImport {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PACKAGE_BYTES) {
    throw new Error("El archivo .trama excede el tamaño permitido o está vacío.");
  }

  let archive: Record<string, Uint8Array>;
  try {
    archive = unzipSync(bytes);
  } catch {
    throw new Error("El archivo seleccionado no es un contenedor .trama válido.");
  }

  let uncompressedBytes = 0;
  for (const path of Object.keys(archive)) {
    uncompressedBytes += archive[path].byteLength;
    validateArchivePath(path);
  }
  if (uncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
    throw new Error("El contenido descomprimido excede el límite de seguridad.");
  }

  const manifest = parseManifest(readJsonFile(archive, "manifest.json"));
  const document = parseEcomap(readJsonFile(archive, "ecomap.json"));
  const snapshots: Snapshot[] = [];
  for (const path of Object.keys(archive).filter((item) => item.startsWith("snapshots/") && item.endsWith(".json"))) {
    snapshots.push(parseSnapshot(JSON.parse(strFromU8(archive[path])) as unknown));
  }
  return { manifest, document, snapshots };
}

function validateArchivePath(path: string): void {
  if (path.startsWith("/") || path.includes("\\") || path.split("/").some((segment) => segment === ".." || segment === "")) {
    throw new Error(`Ruta no permitida dentro de .trama: ${path}`);
  }
  const allowed = path === "manifest.json" || path === "ecomap.json" || path.startsWith("snapshots/") || path.startsWith("assets/");
  if (!allowed) throw new Error(`Entrada no permitida dentro de .trama: ${path}`);
}

function readJsonFile(archive: Record<string, Uint8Array>, path: string): unknown {
  const file = archive[path];
  if (!file) throw new Error(`Falta ${path} en el archivo .trama.`);
  try {
    return JSON.parse(strFromU8(file)) as unknown;
  } catch {
    throw new Error(`${path} no contiene JSON válido.`);
  }
}

function parseManifest(value: unknown): PortableManifest {
  if (!isRecord(value) || value.format !== "trama" || value.formatVersion !== 1) {
    throw new Error("El manifiesto .trama no corresponde al formato abierto de TRAMA.");
  }
  const schemaVersion = value.schemaVersion;
  const appVersion = value.appVersion;
  const createdAt = value.createdAt;
  const modifiedAt = value.modifiedAt;
  if (
    typeof schemaVersion !== "number" ||
    typeof appVersion !== "string" ||
    typeof createdAt !== "string" ||
    typeof modifiedAt !== "string" ||
    schemaVersion > TRAMA_SCHEMA_VERSION
  ) {
    throw new Error("El manifiesto .trama usa una versión no compatible.");
  }
  return { format: "trama", formatVersion: 1, schemaVersion, appVersion, createdAt, modifiedAt };
}

function parseEcomap(value: unknown): Ecomap {
  if (!isRecord(value) || !isRecord(value.center) || !Array.isArray(value.systems) || !Array.isArray(value.connections)) {
    throw new Error("El ecomapa importado no tiene la estructura esperada.");
  }
  if (
    typeof value.id !== "string" ||
    typeof value.workspaceId !== "string" ||
    typeof value.title !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    typeof value.schemaVersion !== "number"
  ) {
    throw new Error("El ecomapa importado contiene campos obligatorios inválidos.");
  }
  
  // Basic sanity check against malformed systems preventing catastrophic crashes
  for (const system of value.systems) {
    if (!isRecord(system) || typeof system.id !== "string") {
      throw new Error("Un sistema importado no tiene un ID válido.");
    }
  }
  
  return value as unknown as Ecomap;
}

function parseSnapshot(value: unknown): Snapshot {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.ecomapId !== "string" || !isRecord(value.state)) {
    throw new Error("Un snapshot importado no tiene la estructura esperada.");
  }
  return value as unknown as Snapshot;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
