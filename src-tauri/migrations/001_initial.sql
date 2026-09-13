PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ecomaps (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  app_version TEXT NOT NULL,
  document_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  schematex_category TEXT NOT NULL,
  icon TEXT NOT NULL,
  visual_style TEXT NOT NULL,
  accent TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, key)
);

CREATE TABLE IF NOT EXISTS centers (
  id TEXT PRIMARY KEY,
  ecomap_id TEXT NOT NULL REFERENCES ecomaps(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  representation TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  source_type TEXT,
  source_date TEXT,
  source_note TEXT,
  verification_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(ecomap_id)
);

CREATE TABLE IF NOT EXISTS system_nodes (
  id TEXT PRIMARY KEY,
  ecomap_id TEXT NOT NULL REFERENCES ecomaps(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  description TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT 'medium',
  notes TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  position_json TEXT,
  source_type TEXT,
  source_date TEXT,
  source_note TEXT,
  verification_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  ecomap_id TEXT NOT NULL REFERENCES ecomaps(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  energy_flow TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  source_type TEXT,
  source_date TEXT,
  source_note TEXT,
  verification_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (source_node_id <> target_node_id)
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  ecomap_id TEXT NOT NULL REFERENCES ecomaps(id) ON DELETE CASCADE,
  target_kind TEXT NOT NULL,
  target_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  ecomap_id TEXT NOT NULL REFERENCES ecomaps(id) ON DELETE CASCADE,
  snapshot_at TEXT NOT NULL,
  name TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  state_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL,
  state_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  ecomap_id TEXT REFERENCES ecomaps(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  target_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ecomaps_workspace_updated ON ecomaps(workspace_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_nodes_ecomap_order ON system_nodes(ecomap_id, order_index);
CREATE INDEX IF NOT EXISTS idx_connections_ecomap ON connections(ecomap_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_ecomap_time ON snapshots(ecomap_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_ecomap_time ON audit_events(ecomap_id, created_at DESC);
