import Database from "@tauri-apps/plugin-sql";
import {
  AuditEvent,
  Category,
  Center,
  Connection,
  Ecomap,
  Note,
  RepositoryState,
  Snapshot,
  SystemNode,
  Template,
  Workspace,
} from "../domain/model";
import { createBuiltInTemplates, createDefaultCategories, documentFromTemplate } from "../domain/defaults";
import { isTauriRuntime } from "./platform";

const BROWSER_STORAGE_KEY = "trama.local.state.v1";

type JsonRecord = Record<string, unknown>;

interface EcomapRow {
  id: string;
  workspace_id: string;
  title: string;
  schema_version: number;
  app_version: string;
  document_json: string;
  created_at: string;
  updated_at: string;
}

interface SnapshotRow {
  id: string;
  ecomap_id: string;
  snapshot_at: string;
  name: string;
  reason: string;
  state_json: string;
  created_at: string;
  updated_at: string;
}

let databasePromise: Promise<Database | null> | undefined;

async function openDatabase(): Promise<Database | null> {
  if (!isTauriRuntime()) return null;
  databasePromise ??= Database.load("sqlite:trama.db");
  return databasePromise;
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getBrowserState(): RepositoryState | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(BROWSER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RepositoryState;
  } catch {
    localStorage.removeItem(BROWSER_STORAGE_KEY);
    return null;
  }
}

function setBrowserState(state: RepositoryState): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(state));
  }
}

function createWorkspace(): Workspace {
  const now = new Date().toISOString();
  const id = globalThis.crypto?.randomUUID?.() ?? `workspace-${Date.now()}`;
  return {
    id,
    createdAt: now,
    updatedAt: now,
    name: "Espacio local",
    description: "Documentos TRAMA almacenados en este dispositivo.",
  };
}

function rowsToSnapshots(rows: SnapshotRow[]): Snapshot[] {
  return rows.map((row) => ({
    id: row.id,
    ecomapId: row.ecomap_id,
    snapshotAt: row.snapshot_at,
    name: row.name,
    reason: row.reason,
    state: parseJson(row.state_json, {
      center: {} as Center,
      systems: [],
      connections: [],
      notes: [],
    }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export class LocalRepository {
  async loadState(): Promise<RepositoryState> {
    const browserState = getBrowserState();
    const db = await openDatabase();
    if (!db) {
      if (browserState) return browserState;
      const workspace = createWorkspace();
      const categories = createDefaultCategories(workspace.id);
      const templates = createBuiltInTemplates(workspace.id, categories);
      const initialDoc = documentFromTemplate(templates[0], workspace.id);
      initialDoc.title = "Familia Torres";
      const initial: RepositoryState = { workspace, categories, ecomaps: [initialDoc], templates, snapshots: [] };
      setBrowserState(initial);
      return initial;
    }

    const workspaceRows = await db.select<Workspace[]>(
      "SELECT id, name, description, created_at AS createdAt, updated_at AS updatedAt FROM workspaces ORDER BY created_at LIMIT 1",
    );
    let workspace = workspaceRows[0];
    if (!workspace) {
      workspace = createWorkspace();
      await db.execute(
        "INSERT INTO workspaces (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
        [workspace.id, workspace.name, workspace.description, workspace.createdAt, workspace.updatedAt],
      );
    }

    const categoryRows = await db.select<Array<Category & { hidden: number | boolean }>>(
      "SELECT id, workspace_id AS workspaceId, key, label, schematex_category AS schematexCategory, icon, visual_style AS visualStyle, accent, hidden, order_index AS orderIndex, created_at AS createdAt, updated_at AS updatedAt FROM categories WHERE workspace_id = $1 ORDER BY order_index",
      [workspace.id],
    );
    let categories: Category[] = categoryRows.map((category) => ({ ...category, hidden: Boolean(category.hidden) }));
    if (categories.length === 0) {
      categories = createDefaultCategories(workspace.id);
      for (const category of categories) await this.persistCategory(db, category);
    }

    const ecomapRows = await db.select<EcomapRow[]>(
      "SELECT id, workspace_id, title, schema_version, app_version, document_json, created_at, updated_at FROM ecomaps WHERE workspace_id = $1 ORDER BY updated_at DESC",
      [workspace.id],
    );
    const ecomaps = ecomapRows
      .map((row) => parseJson<Ecomap | null>(row.document_json, null))
      .filter((document): document is Ecomap => document !== null && typeof document.id === "string" && document.id.length > 0);

    const templateRows = await db.select<Array<Template & { workspace_id: string; state_json: string }>>(
      "SELECT id, workspace_id, name, description, kind, state_json, created_at AS createdAt, updated_at AS updatedAt FROM templates WHERE workspace_id = $1 ORDER BY created_at",
      [workspace.id],
    );
    let templates: Template[] = templateRows.map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      description: row.description,
      kind: row.kind,
      state: parseJson(row.state_json, {
        center: {} as Center,
        systems: [],
        connections: [],
        notes: [],
      }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
    if (templates.length === 0) {
      templates = createBuiltInTemplates(workspace.id, categories);
      for (const template of templates) await this.persistTemplate(db, template);
    }

    if (ecomaps.length === 0 && templates.length > 0) {
      const initialDoc = documentFromTemplate(templates[0], workspace.id);
      initialDoc.title = "Familia Torres";
      await this.saveDocument(initialDoc);
      ecomaps.push(initialDoc);
    }

    const snapshotRows = await db.select<SnapshotRow[]>(
      "SELECT id, ecomap_id, snapshot_at, name, reason, state_json, created_at, updated_at FROM snapshots ORDER BY snapshot_at DESC",
    );
    return { workspace, categories, ecomaps, templates, snapshots: rowsToSnapshots(snapshotRows) };
  }

  async saveDocument(document: Ecomap): Promise<void> {
    const db = await openDatabase();
    if (!db) {
      const state = getBrowserState();
      if (!state) return;
      const ecomaps = state.ecomaps.filter((item) => item.id !== document.id);
      setBrowserState({ ...state, ecomaps: [document, ...ecomaps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) });
      return;
    }

    await db.execute("BEGIN");
    try {
      await db.execute(
        `INSERT INTO ecomaps (id, workspace_id, title, schema_version, app_version, document_json, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT(id) DO UPDATE SET title = excluded.title, schema_version = excluded.schema_version,
         app_version = excluded.app_version, document_json = excluded.document_json, updated_at = excluded.updated_at`,
        [document.id, document.workspaceId, document.title, document.schemaVersion, document.appVersion, JSON.stringify(document), document.createdAt, document.updatedAt],
      );
      await db.execute("DELETE FROM connections WHERE ecomap_id = $1", [document.id]);
      await db.execute("DELETE FROM notes WHERE ecomap_id = $1", [document.id]);
      await db.execute("DELETE FROM system_nodes WHERE ecomap_id = $1", [document.id]);
      await db.execute("DELETE FROM centers WHERE ecomap_id = $1", [document.id]);
      await this.persistCenter(db, document.center);
      for (const node of document.systems) await this.persistSystem(db, node);
      for (const connection of document.connections) await this.persistConnection(db, connection);
      for (const note of document.notes) await this.persistNote(db, note);
      await this.persistAudit(db, {
        id: globalThis.crypto?.randomUUID?.() ?? `audit-${Date.now()}`,
        workspaceId: document.workspaceId,
        ecomapId: document.id,
        eventType: "document_saved",
        targetId: document.id,
        payload: { systemCount: document.systems.length, connectionCount: document.connections.length },
        createdAt: document.updatedAt,
        updatedAt: document.updatedAt,
      });
      await db.execute("COMMIT");
    } catch (saveError) {
      await db.execute("ROLLBACK");
      throw saveError;
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    const db = await openDatabase();
    if (!db) {
      const state = getBrowserState();
      if (state) setBrowserState({ ...state, categories });
      return;
    }
    for (const category of categories) await this.persistCategory(db, category);
  }

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    const db = await openDatabase();
    if (!db) {
      const state = getBrowserState();
      if (state) setBrowserState({ ...state, snapshots: [snapshot, ...state.snapshots] });
      return;
    }
    await db.execute(
      `INSERT INTO snapshots (id, ecomap_id, snapshot_at, name, reason, state_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [snapshot.id, snapshot.ecomapId, snapshot.snapshotAt, snapshot.name, snapshot.reason, JSON.stringify(snapshot.state), snapshot.createdAt, snapshot.updatedAt],
    );
    await this.persistAudit(db, {
      id: globalThis.crypto?.randomUUID?.() ?? `audit-${Date.now()}`,
      workspaceId: (await this.workspaceId(db, snapshot.ecomapId)) ?? "",
      ecomapId: snapshot.ecomapId,
      eventType: "snapshot_created",
      targetId: snapshot.id,
      payload: { reason: snapshot.reason },
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  async saveTemplate(template: Template): Promise<void> {
    const db = await openDatabase();
    if (!db) {
      const state = getBrowserState();
      if (state) setBrowserState({ ...state, templates: [template, ...state.templates] });
      return;
    }
    await this.persistTemplate(db, template);
  }

  private async workspaceId(db: Database, ecomapId: string): Promise<string | null> {
    const rows = await db.select<Array<{ workspace_id: string }>>("SELECT workspace_id FROM ecomaps WHERE id = $1", [ecomapId]);
    return rows[0]?.workspace_id ?? null;
  }

  private async persistCenter(db: Database, center: Center): Promise<void> {
    await db.execute(
      `INSERT INTO centers (id, ecomap_id, label, representation, description, notes, source_type, source_date, source_note, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [center.id, center.ecomapId, center.label, center.representation, center.description, center.notes, center.sourceType ?? null, center.sourceDate ?? null, center.sourceNote ?? null, center.verificationStatus ?? null, center.createdAt, center.updatedAt],
    );
  }

  private async persistSystem(db: Database, node: SystemNode): Promise<void> {
    await db.execute(
      `INSERT INTO system_nodes (id, ecomap_id, label, category_id, description, size, notes, order_index, position_json, source_type, source_date, source_note, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [node.id, node.ecomapId, node.label, node.categoryId, node.description, node.size, node.notes, node.orderIndex, node.position ? JSON.stringify(node.position) : null, node.sourceType ?? null, node.sourceDate ?? null, node.sourceNote ?? null, node.verificationStatus ?? null, node.createdAt, node.updatedAt],
    );
  }

  private async persistConnection(db: Database, connection: Connection): Promise<void> {
    await db.execute(
      `INSERT INTO connections (id, ecomap_id, source_node_id, target_node_id, relationship_type, energy_flow, label, notes, source_type, source_date, source_note, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [connection.id, connection.ecomapId, connection.sourceNodeId, connection.targetNodeId, connection.relationshipType, connection.energyFlow, connection.label, connection.notes, connection.sourceType ?? null, connection.sourceDate ?? null, connection.sourceNote ?? null, connection.verificationStatus ?? null, connection.createdAt, connection.updatedAt],
    );
  }

  private async persistNote(db: Database, note: Note): Promise<void> {
    await db.execute(
      "INSERT INTO notes (id, ecomap_id, target_kind, target_id, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [note.id, note.ecomapId, note.targetKind, note.targetId, note.content, note.createdAt, note.updatedAt],
    );
  }

  private async persistCategory(db: Database, category: Category): Promise<void> {
    await db.execute(
      `INSERT INTO categories (id, workspace_id, key, label, schematex_category, icon, visual_style, accent, hidden, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT(id) DO UPDATE SET label = excluded.label, icon = excluded.icon, visual_style = excluded.visual_style,
       accent = excluded.accent, hidden = excluded.hidden, order_index = excluded.order_index, updated_at = excluded.updated_at`,
      [category.id, category.workspaceId, category.key, category.label, category.schematexCategory, category.icon, category.visualStyle, category.accent, category.hidden ? 1 : 0, category.orderIndex, category.createdAt, category.updatedAt],
    );
  }

  private async persistTemplate(db: Database, template: Template): Promise<void> {
    await db.execute(
      `INSERT INTO templates (id, workspace_id, name, description, kind, state_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, state_json = excluded.state_json, updated_at = excluded.updated_at`,
      [template.id, template.workspaceId, template.name, template.description, template.kind, JSON.stringify(template.state), template.createdAt, template.updatedAt],
    );
  }

  private async persistAudit(db: Database, event: AuditEvent): Promise<void> {
    await db.execute(
      "INSERT INTO audit_events (id, workspace_id, ecomap_id, event_type, target_id, payload_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [event.id, event.workspaceId, event.ecomapId ?? null, event.eventType, event.targetId ?? null, JSON.stringify(event.payload), event.createdAt, event.updatedAt],
    );
  }
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}
