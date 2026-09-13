import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  
  
  
} from "react";
import { listen } from "@tauri-apps/api/event";
import {
  open as openNative,
  save as saveNative,
  confirm as confirmNative,
} from "@tauri-apps/plugin-dialog";
import "./App.css";
import { Icon } from "./components/Icon";
import { Dashboard } from "./screens/Dashboard";
import { SettingsScreen } from "./screens/SettingsScreen";
import { Editor } from "./screens/Editor/Editor";
import { NewDocumentModal, ConnectionModal, ExportModal, SnapshotsModal, CompareModal } from "./modals/Modals";
import { toSchemaTexDsl } from "./adapters/schematex";
import {
  Category,
  CenterRepresentation,
  Connection,
  Ecomap,
  EnergyFlow,
  ExtendedRelationshipType,
  Provenance,
  RelationshipType,
  Snapshot,
  SourceType,
  StandardRelationshipType,
  SystemNode,
  Template,
  VerificationStatus,
  createConnection,
  createEmptyDocument,
  createId,
  createSystemNode,
  cloneState,
  nowIso,
  withUpdatedTimestamp,
} from "./domain/model";
import type { RepositoryState } from "./domain/model";
import { LocalRepository } from "./infrastructure/repository";
import { deserializePortable, serializePortable } from "./infrastructure/portable";
import { exportEcomap, type ExportFormat } from "./infrastructure/exporter";
import { isTauriRuntime, readFileBytes, writeFileBytes } from "./infrastructure/platform";
import { compareStates, type EcomapDiff } from "./domain/compare";
import { t, type Language } from "./i18n";

import { 
  Screen, ThemeMode, SaveState, Modal, Selection, 
  STANDARD_RELATIONSHIP_OPTIONS, EXTENDED_RELATIONSHIP_OPTIONS, 
  FLOW_OPTIONS, SOURCE_OPTIONS, VERIFICATION_OPTIONS,
  IconButton, FormField, sourceLabel, relationshipLabel, flowLabel
} from "./shared";

const repository = new LocalRepository();

// ─── Utilities ──────────────────────────────────────────────────────────────

// ─── Utilities ──────────────────────────────────────────────────────────────

function clone<T>(value: T): T { return structuredClone(value); }

function isDarkPreferred(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;
}

function documentFromTemplate(template: Template, workspaceId: string): Ecomap {
  const document = createEmptyDocument(workspaceId, template.name, template.state.center.representation);
  const centerId = document.center.id;
  const systemIdMap = new Map<string, string>();
  document.center = {
    ...clone(template.state.center),
    id: centerId,
    ecomapId: document.id,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
  document.systems = template.state.systems.map((source, index) => {
    const targetId = createId();
    systemIdMap.set(source.id, targetId);
    return {
      ...clone(source),
      id: targetId,
      ecomapId: document.id,
      orderIndex: index,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  });
  document.connections = template.state.connections.map((source) => ({
    ...clone(source),
    id: createId(),
    ecomapId: document.id,
    sourceNodeId: source.sourceNodeId === template.state.center.id
      ? centerId
      : systemIdMap.get(source.sourceNodeId) ?? source.sourceNodeId,
    targetNodeId: source.targetNodeId === template.state.center.id
      ? centerId
      : systemIdMap.get(source.targetNodeId) ?? source.targetNodeId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }));
  document.notes = clone(template.state.notes).map((note) => ({
    ...note,
    id: createId(),
    ecomapId: document.id,
    targetId: note.targetId === template.state.center.id
      ? centerId
      : systemIdMap.get(note.targetId) ?? note.targetId,
  }));
  return document;
}

function normalizeImportedDocument(
  document: Ecomap,
  workspaceId: string,
  categories: Category[],
): Ecomap {
  const fallbackCategory = categories.find((c) => c.key === "other") ?? categories[0];
  const categoryIds = new Set(categories.map((c) => c.id));
  return {
    ...document,
    workspaceId,
    systems: document.systems.map((system) => ({
      ...system,
      ecomapId: document.id,
      categoryId: categoryIds.has(system.categoryId)
        ? system.categoryId
        : fallbackCategory?.id ?? system.categoryId,
    })),
    center: { ...document.center, ecomapId: document.id },
    connections: document.connections.map((connection) => ({
      ...connection,
      ecomapId: document.id,
    })),
    notes: document.notes.map((note) => ({ ...note, ecomapId: document.id })),
  };
}

async function askConfirmation(question: string): Promise<boolean> {
  if (isTauriRuntime()) {
    try {
      return await confirmNative(question, { title: "TRAMA", kind: "warning" });
    } catch {
      return false;
    }
  }
  return window.confirm(question);
}

function downloadBytes(bytes: Uint8Array, filename: string, mimeType: string): void {
  const safeBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(safeBuffer).set(bytes);
  const blob = new Blob([safeBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "ecomapa";
}

// ─── App Root ───────────────────────────────────────────────────────────────


export function AppContent() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("trama.language") as Language | null) ?? "es",
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    () => (localStorage.getItem("trama.theme") as ThemeMode | null) ?? "system",
  );
  const [systemDark, setSystemDark] = useState(isDarkPreferred);
  const [screen, setScreen] = useState<Screen>("dashboard");
  
  const {
    repoState, setRepoState,
    document, setDocument,
    past, future,
    dirty, setDirty,
    saveState, setSaveState,
    selection, setSelection,
    search, setSearch,
    undo, redo, commitDocument,
    resetHistory, loading, error,
    deleteSelected, duplicateSelected, autoOrganize,
  } = useDocumentContext();

  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | { message: string; type: "error" | "success" | "info" } | null>(null);
  const [newTitle, setNewTitle] = useState("Ecomapa sin título");
  const [newRepresentation, setNewRepresentation] = useState<CenterRepresentation>("single_person");
  const [connectionDraft, setConnectionDraft] = useState({
    source: "",
    target: "",
    relationship: "moderate" as RelationshipType,
    flow: "none" as EnergyFlow,
    label: "",
  });
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [includeLegend, setIncludeLegend] = useState(true);
  const [whiteBackground, setWhiteBackground] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotReason, setSnapshotReason] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<ViewportController | null>(null);
  const modalTriggerRef = useRef<HTMLElement | null>(null);

  const effectiveDark = themeMode === "dark" || (themeMode === "system" && systemDark);
  const activeCategories = useMemo(
    () =>
      (repoState?.categories ?? [])
        .filter((c) => !c.hidden)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [repoState?.categories],
  );
  const selectedSystem = document && selection?.kind === "system"
    ? document.systems.find((s) => s.id === selection.id) ?? null
    : null;
  const selectedConnection = document && selection?.kind === "connection"
    ? document.connections.find((c) => c.id === selection.id) ?? null
    : null;
  const snapshots = useMemo(
    () =>
      (repoState?.snapshots ?? [])
        .filter((s) => s.ecomapId === document?.id)
        .sort((a, b) => b.snapshotAt.localeCompare(a.snapshotAt)),
    [repoState?.snapshots, document?.id],
  );
  const compareDiff = useMemo<EcomapDiff | null>(() => {
    const left = snapshots.find((s) => s.id === compareA);
    const right = snapshots.find((s) => s.id === compareB);
    return left && right ? compareStates(left.state, right.state) : null;
  }, [snapshots, compareA, compareB]);
  const projectionDsl = useMemo(
    () => document && repoState ? toSchemaTexDsl(document, repoState.categories) : "",
    [document, repoState],
  );

  // ── Effects ──



  useEffect(() => {
    localStorage.setItem("trama.language", language);
    globalThis.document.documentElement.lang = language;
  }, [language]);
  useEffect(() => { localStorage.setItem("trama.theme", themeMode); }, [themeMode]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const listener = () => setSystemDark(media.matches);
    media.addEventListener?.("change", listener);
    return () => media.removeEventListener?.("change", listener);
  }, []);
  useEffect(() => {
    if (!toast) return;
    if (typeof toast !== "string" && toast.type === "error") return; // Errors stay until manually dismissed
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // ── Callbacks ──
  
  const handleCloseModal = useCallback(() => {
    setModal(null);
    if (modalTriggerRef.current) {
      modalTriggerRef.current.focus();
      modalTriggerRef.current = null;
    }
  }, []);

  const openDocument = useCallback((next: Ecomap) => {
    resetHistory(next);
    setSaveState("saved");
    setScreen("editor");
    setModal(null);
  }, [resetHistory, setSaveState]);

  const createDocument = useCallback(
    (template?: Template) => {
      if (!repoState) return;
      const next = template
        ? documentFromTemplate(template, repoState.workspace.id)
        : createEmptyDocument(repoState.workspace.id, newTitle || "Ecomapa sin título", newRepresentation);
      if (!template) next.title = newTitle || "Ecomapa sin título";
      setRepoState((state) =>
        state ? { ...state, ecomaps: [next, ...state.ecomaps] } : state,
      );
      void repository.saveDocument(next).catch((err: unknown) =>
        setToast(err instanceof Error ? err.message : "No se pudo crear el documento en el almacenamiento local."),
      );
      openDocument(next);
    },
    [newRepresentation, newTitle, openDocument, repoState],
  );

  const saveCategories = useCallback(
    async (categories: Category[]) => {
      try {
        const normalized = categories.map((c, index) => ({
          ...c,
          orderIndex: index,
          updatedAt: nowIso(),
        }));
        await repository.saveCategories(normalized);
        setRepoState((state) => state ? { ...state, categories: normalized } : state);
        setToast(language === "es" ? "Categorías guardadas localmente." : "Categories saved locally.");
      } catch (err: unknown) {
        setToast(err instanceof Error ? err.message : "No se pudieron guardar las categorías.");
      }
    },
    [language],
  );

  const saveCurrent = useCallback(async () => {
    if (!document) return;
    setSaveState("saving");
    try {
      await repository.saveDocument(document);
      setDirty(false);
      setSaveState("saved");
      setRepoState((state) =>
        state
          ? { ...state, ecomaps: [document, ...state.ecomaps.filter((item) => item.id !== document.id)] }
          : state,
      );
    } catch (err: unknown) {
      setSaveState("error");
      setToast(err instanceof Error ? err.message : "Error al guardar el documento.");
    }
  }, [document]);

  const updateTitle = useCallback(
    (title: string) => { commitDocument((current) => ({ ...current, title })); },
    [commitDocument],
  );

  const handleExport = useCallback(async () => {
    if (!document || !repoState) return;
    const extension = exportFormat;
    const mime =
      exportFormat === "svg" ? "image/svg+xml"
        : exportFormat === "png" ? "image/png"
        : "application/pdf";
    const filename = `${slugify(document.title)}.${extension}`;
    try {
      const bytes = await exportEcomap(
        document,
        repoState.categories,
        { format: exportFormat, includeLegend, background: whiteBackground ? "white" : "transparent" },
        effectiveDark ? "dark" : "light",
      );
      if (isTauriRuntime()) {
        const path = await saveNative({
          title: "Exportar ecomapa",
          defaultPath: filename,
          filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
        });
        if (!path) return;
        await writeFileBytes(path, bytes);
        setToast(`${t(language, "exported")}: ${path}`);
      } else {
        downloadBytes(bytes, filename, mime);
        setToast(`${t(language, "exported")}: ${filename}`);
      }
      setModal(null);
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "No se pudo exportar el ecomapa.");
    }
  }, [document, effectiveDark, exportFormat, includeLegend, language, repoState, whiteBackground]);

  const savePortableAs = useCallback(async () => {
    if (!document || !repoState) return;
    try {
      const bytes = serializePortable(document, snapshots);
      const filename = `${slugify(document.title)}.trama`;
      if (isTauriRuntime()) {
        const path = await saveNative({
          title: "Guardar ecomapa TRAMA",
          defaultPath: filename,
          filters: [{ name: "Ecomapa TRAMA", extensions: ["trama"] }],
        });
        if (!path) return;
        await writeFileBytes(path, bytes);
        setToast(`${t(language, "saved")}: ${path}`);
      } else {
        downloadBytes(bytes, filename, "application/zip");
      }
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "No se pudo crear el archivo .trama.");
    }
  }, [document, language, repoState, snapshots]);

  const importBytes = useCallback(
    async (bytes: Uint8Array) => {
      if (!repoState) return;
      try {
        const imported = deserializePortable(bytes);
        const next = normalizeImportedDocument(imported.document, repoState.workspace.id, repoState.categories);
        await repository.saveDocument(next);
        for (const snapshot of imported.snapshots) {
          await repository.saveSnapshot({ ...snapshot, ecomapId: next.id });
        }
        setRepoState((state) =>
          state
            ? {
                ...state,
                ecomaps: [next, ...state.ecomaps.filter((item) => item.id !== next.id)],
                snapshots: [...imported.snapshots, ...state.snapshots],
              }
            : state,
        );
        openDocument(next);
        setToast(t(language, "imported"));
      } catch (err: unknown) {
        setToast(err instanceof Error ? err.message : t(language, "invalidFile"));
      }
    },
    [language, openDocument, repoState],
  );

  const handleOpen = useCallback(async () => {
    if (isTauriRuntime()) {
      try {
        const path = await openNative({
          title: "Abrir ecomapa TRAMA",
          multiple: false,
          directory: false,
          filters: [{ name: "Ecomapa TRAMA", extensions: ["trama"] }],
        });
        if (typeof path === "string") await importBytes(await readFileBytes(path));
      } catch (err: unknown) {
        setToast(err instanceof Error ? err.message : "No se pudo abrir el archivo.");
      }
    } else {
      fileInputRef.current?.click();
    }
  }, [importBytes]);

  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;
      file.arrayBuffer()
        .then((buffer) => importBytes(new Uint8Array(buffer)))
        .catch((err: unknown) =>
          setToast(err instanceof Error ? err.message : "No se pudo leer el archivo."),
        );
      event.currentTarget.value = "";
    },
    [importBytes],
  );



  const createConnectionFromDraft = useCallback(() => {
    if (!document || !connectionDraft.source || !connectionDraft.target ||
        connectionDraft.source === connectionDraft.target) return;
    const connection = createConnection(document.id, connectionDraft.source, connectionDraft.target);
    connection.relationshipType = connectionDraft.relationship;
    connection.energyFlow = connectionDraft.flow;
    connection.label = connectionDraft.label;
    commitDocument((current) => ({ ...current, connections: [...current.connections, connection] }));
    setSelection({ kind: "connection", id: connection.id });
    setModal(null);
  }, [commitDocument, connectionDraft, document]);

  const createSnapshot = useCallback(async () => {
    if (!document || !repoState) return;
    const snapshot: Snapshot = {
      id: createId(),
      ecomapId: document.id,
      snapshotAt: nowIso(),
      name: snapshotName.trim() ||
        `Snapshot ${new Date().toLocaleDateString(language === "es" ? "es-CL" : "en-US")}`,
      reason: snapshotReason.trim(),
      state: cloneState(document),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await repository.saveSnapshot(snapshot);
    setRepoState((state) => state ? { ...state, snapshots: [snapshot, ...state.snapshots] } : state);
    setSnapshotName("");
    setSnapshotReason("");
    setToast(t(language, "createSnapshot"));
  }, [document, language, repoState, snapshotName, snapshotReason]);

  const restoreSnapshot = useCallback(
    async (snapshot: Snapshot) => {
      if (!document) return;
      if (!(await askConfirmation(t(language, "restoreConfirm")))) return;
      const automatic: Snapshot = {
        id: createId(),
        ecomapId: document.id,
        snapshotAt: nowIso(),
        name: "Antes de restaurar",
        reason: "Respaldo automático previo a restauración",
        state: cloneState(document),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await repository.saveSnapshot(automatic);
      const state = clone(snapshot.state);
      setPast((items) => [...items, clone(document)].slice(-60));
      setFuture([]);
      setDocument((current) => current ? { ...current, ...state, updatedAt: nowIso() } : current);
      setRepoState((current) =>
        current ? { ...current, snapshots: [automatic, ...current.snapshots] } : current,
      );
      setDirty(true);
      setToast(t(language, "restoreSnapshot"));
    },
    [document, language],
  );

  const duplicateSnapshot = useCallback(
    async (snapshot: Snapshot) => {
      if (!repoState) return;
      const next = createEmptyDocument(
        repoState.workspace.id,
        `${document?.title ?? "Ecomapa"} · ${snapshot.name}`,
        snapshot.state.center.representation,
      );
      next.center = {
        ...clone(snapshot.state.center),
        id: next.center.id,
        ecomapId: next.id,
        createdAt: next.createdAt,
        updatedAt: next.updatedAt,
      };
      const idMap = new Map<string, string>();
      next.systems = snapshot.state.systems.map((system, index) => {
        const id = createId();
        idMap.set(system.id, id);
        return {
          ...clone(system),
          id,
          ecomapId: next.id,
          orderIndex: index,
          createdAt: next.createdAt,
          updatedAt: next.updatedAt,
        };
      });
      next.connections = snapshot.state.connections.map((connection) => ({
        ...clone(connection),
        id: createId(),
        ecomapId: next.id,
        sourceNodeId: connection.sourceNodeId === snapshot.state.center.id
          ? next.center.id
          : idMap.get(connection.sourceNodeId) ?? connection.sourceNodeId,
        targetNodeId: connection.targetNodeId === snapshot.state.center.id
          ? next.center.id
          : idMap.get(connection.targetNodeId) ?? connection.targetNodeId,
        createdAt: next.createdAt,
        updatedAt: next.updatedAt,
      }));
      next.notes = clone(snapshot.state.notes).map((note) => ({ ...note, id: createId(), ecomapId: next.id }));
      await repository.saveDocument(next);
      setRepoState((state) => state ? { ...state, ecomaps: [next, ...state.ecomaps] } : state);
      openDocument(next);
    },
    [document?.title, openDocument, repoState],
  );

  const openConnectionModal = useCallback(() => {
    if (!document) return;
    setConnectionDraft({
      source: document.center.id,
      target: document.systems[0]?.id ?? "",
      relationship: "moderate",
      flow: "none",
      label: "",
    });
    setModal("connection");
  }, [document]);

  const closeEditor = useCallback(async () => {
    if (
      dirty &&
      !(await askConfirmation(
        language === "es"
          ? "Hay cambios sin guardar. ¿Cerrar de todos modos?"
          : "There are unsaved changes. Close anyway?",
      ))
    ) return;
    setScreen("dashboard");
    setDocument(null);
    setSelection(null);
    setModal(null);
    setDirty(false);
    setSaveState("saved");
  }, [dirty, language]);

  const handleAutoOrganize = useCallback(() => {
    autoOrganize();
    setToast(
      language === "es"
        ? "Orden derivado actualizado; SchemaTex volverá a calcular el layout radial."
        : "Derived order updated; SchemaTex will recalculate the radial layout.",
    );
  }, [autoOrganize, language]);

  const handleDeleteSelected = useCallback(async () => {
    await deleteSelected(askConfirmation, t(language, "deleteConfirm"));
  }, [deleteSelected, language]);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editingText =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      const command = event.metaKey || event.ctrlKey;

      if (command && event.key.toLowerCase() === "n") { event.preventDefault(); setModal("new"); return; }
      if (command && event.key.toLowerCase() === "o") { event.preventDefault(); void handleOpen(); return; }
      if (command && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (event.shiftKey) void savePortableAs(); else void saveCurrent();
        return;
      }
      if (command && event.key.toLowerCase() === "z") {
        if (!editingText) { event.preventDefault(); event.shiftKey ? redo() : undo(); }
        return;
      }
      if (command && (event.key === "+" || event.key === "=")) {
        event.preventDefault(); viewportRef.current?.zoomIn(); return;
      }
      if (command && event.key === "-") { event.preventDefault(); viewportRef.current?.zoomOut(); return; }
      if (command && event.key === "0") { event.preventDefault(); viewportRef.current?.fit(); return; }
    );
  }, [autoOrganize, language]);

  const handleDeleteSelected = useCallback(async () => {
    await deleteSelected(askConfirmation, t(language, "deleteConfirm"));
  }, [deleteSelected, language]);
          modalTriggerRef.current.focus();
          modalTriggerRef.current = null;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected, handleOpen, redo, saveCurrent, savePortableAs, undo]);

  // ── Tauri menu events ──

  useEffect(() => {
    if (!isTauriRuntime()) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;
    void listen<string>("trama://menu", (event) => {
      switch (event.payload) {
        case "new": setNewTitle("Ecomapa sin título"); setNewRepresentation("single_person"); setModal("new"); break;
        case "open": void handleOpen(); break;
        case "save": void saveCurrent(); break;
        case "save-as": void savePortableAs(); break;
        case "export": setModal("export"); break;
        case "close": void closeEditor(); break;
        case "undo": undo(); break;
        case "redo": redo(); break;
        case "settings": setScreen("settings"); break;
        case "about": setToast("TRAMA 0.1 · ecomapas profesionales · AGPL-3.0-only"); break;
      }
    }).then((cleanup) => {
      if (disposed) cleanup(); else unlisten = cleanup;
    }).catch(() => undefined);
    return () => { disposed = true; unlisten?.(); };
  }, [closeEditor, handleOpen, redo, saveCurrent, savePortableAs, undo]);

  // ── Render ──

  if (loading) {
    return (
      <div className="loading-screen">
        <Icon name="trama" size={42} />
        <span>TRAMA</span>
        <small>{language === "es" ? "Abriendo almacenamiento local…" : "Opening local storage…"}</small>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <Icon name="shield" size={42} />
        <span>{t(language, "saveError")}</span>
        <small>{error}</small>
      </div>
    );
  }

  const themeClass = `app-shell${effectiveDark ? " theme-dark" : ""}${themeMode === "monochrome" ? " theme-monochrome" : ""}`;

  return (
    <div className={themeClass}>
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept=".trama,application/zip"
        onChange={onFileInputChange}
      />

      {screen === "dashboard" && repoState ? (
        <Dashboard
          language={language}
          themeMode={themeMode}
          repoState={repoState}
          onNew={() => { setNewTitle("Ecomapa sin título"); setNewRepresentation("single_person"); setModal("new"); }}
          onOpen={() => void handleOpen()}
          onOpenDocument={openDocument}
          onTemplate={(template) => createDocument(template)}
          onSettings={() => setScreen("settings")}
          onLanguage={() => setLanguage((l) => l === "es" ? "en" : "es")}
          onTheme={() => setThemeMode((m) => m === "system" ? "dark" : m === "dark" ? "light" : "system")}
        />
      ) : null}

      {screen === "settings" && repoState ? (
        <SettingsScreen
          language={language}
          themeMode={themeMode}
          categories={repoState.categories}
          setThemeMode={setThemeMode}
          onSaveCategories={saveCategories}
          onBack={() => setScreen(document ? "editor" : "dashboard")}
          onLanguage={() => setLanguage((l) => l === "es" ? "en" : "es")}
        />
      ) : null}

      {screen === "editor" && document && repoState ? (
        <Editor
          language={language}
          effectiveDark={effectiveDark}
          document={document}
          categories={activeCategories}
          allCategories={repoState.categories}
          templates={repoState.templates}
          selection={selection}
          selectedSystem={selectedSystem}
          selectedConnection={selectedConnection}
          projectionDsl={projectionDsl}
          saveState={saveState}
          past={past}
          future={future}
          search={search}
          setSearch={setSearch}
          onSelect={setSelection}
          onAddSystem={addSystem}
          onConnect={openConnectionModal}
          onUpdateTitle={updateTitle}
          onUpdateCenter={updateCenter}
          onUpdateSystem={updateSystem}
          onUpdateConnection={updateConnection}
          onDuplicate={duplicateSelected}
          onDelete={() => void deleteSelected()}
          onUndo={undo}
          onRedo={redo}
          onSave={() => void saveCurrent()}
          onSaveAs={() => void savePortableAs()}
          onExport={() => { modalTriggerRef.current = globalThis.document.activeElement as HTMLElement; setModal("export"); }}
          onClose={() => void closeEditor()}
          onSnapshots={() => { modalTriggerRef.current = globalThis.document.activeElement as HTMLElement; setModal("snapshots"); }}
          onCompare={() => { modalTriggerRef.current = globalThis.document.activeElement as HTMLElement; setModal("compare"); }}
          onOrganize={autoOrganize}
          viewportRef={viewportRef}
          onSettings={() => setScreen("settings")}
          onLanguage={() => setLanguage((l) => l === "es" ? "en" : "es")}
          onTheme={() => setThemeMode((m) => m === "system" ? "dark" : m === "dark" ? "light" : "system")}
        />
      ) : null}

      {toast ? (
        (() => {
          const isObj = typeof toast !== "string";
          const type = isObj ? toast.type : "info";
          const message = isObj ? toast.message : toast;
          return (
            <div className={`toast ${type === "error" ? "toast-error" : ""}`} role={type === "error" ? "alert" : "status"}>
              <Icon name={type === "error" ? "shield" : "check"} size={16} aria-hidden="true" />
              {message}
              {type === "error" && (
                <button className="quiet-button" onClick={() => setToast(null)} aria-label={t(language, "close")} style={{ marginLeft: "auto", padding: "4px" }}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          );
        })()
      ) : null}

      {modal === "new" && repoState ? (
        <NewDocumentModal
          language={language}
          title={newTitle}
          setTitle={setNewTitle}
          representation={newRepresentation}
          setRepresentation={setNewRepresentation}
          templates={repoState.templates}
          onCancel={handleCloseModal}
          onCreate={() => createDocument()}
          onTemplate={(template) => createDocument(template)}
        />
      ) : null}

      {modal === "connection" && document ? (
        <ConnectionModal
          language={language}
          document={document}
          draft={connectionDraft}
          setDraft={setConnectionDraft}
          onCancel={handleCloseModal}
          onCreate={createConnectionFromDraft}
        />
      ) : null}

      {modal === "export" ? (
        <ExportModal
          language={language}
          format={exportFormat}
          setFormat={setExportFormat}
          includeLegend={includeLegend}
          setIncludeLegend={setIncludeLegend}
          whiteBackground={whiteBackground}
          setWhiteBackground={setWhiteBackground}
          onCancel={handleCloseModal}
          onExport={() => void handleExport()}
        />
      ) : null}

      {modal === "snapshots" && document ? (
        <SnapshotsModal
          language={language}
          snapshots={snapshots}
          snapshotName={snapshotName}
          setSnapshotName={setSnapshotName}
          snapshotReason={snapshotReason}
          setSnapshotReason={setSnapshotReason}
          onCancel={handleCloseModal}
          onCreate={() => void createSnapshot()}
          onRestore={(snapshot) => void restoreSnapshot(snapshot)}
          onDuplicate={(snapshot) => void duplicateSnapshot(snapshot)}
          onCompare={() => setModal("compare")}
        />
      ) : null}

      {modal === "compare" && document ? (
        <CompareModal
          language={language}
          snapshots={snapshots}
          compareA={compareA}
          setCompareA={setCompareA}
          compareB={compareB}
          setCompareB={setCompareB}
          diff={compareDiff}
          onCancel={handleCloseModal}
        />
      ) : null}
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────────────────────────


import { DocumentProvider } from "./context/DocumentContext";

export default function App() {
  return (
    <DocumentProvider>
      <AppContent />
    </DocumentProvider>
  );
}
