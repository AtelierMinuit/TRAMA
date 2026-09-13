import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from "react";
import { type Ecomap, type RepositoryState, type SystemNode, type Connection, type Category, type Template, type Snapshot, type CenterRepresentation, type RelationshipType, type EnergyFlow, createId, createSystemNode, createEmptyDocument, createConnection, cloneState, nowIso, withUpdatedTimestamp } from "../domain/model";
import { LocalRepository } from "../infrastructure/repository";
import { useEcomapHistory } from "../hooks/useEcomapHistory";
import { type Selection, type SaveState, type ThemeMode } from "../shared";

export const repository = new LocalRepository();

export interface DocumentContextType {
  repoState: RepositoryState | null;
  setRepoState: React.Dispatch<React.SetStateAction<RepositoryState | null>>;
  document: Ecomap | null;
  setDocument: (doc: Ecomap | null) => void;
  setPast: React.Dispatch<React.SetStateAction<Ecomap[]>>;
  setFuture: React.Dispatch<React.SetStateAction<Ecomap[]>>;
  past: Ecomap[];
  future: Ecomap[];
  dirty: boolean;
  setDirty: React.Dispatch<React.SetStateAction<boolean>>;
  saveState: SaveState;
  setSaveState: React.Dispatch<React.SetStateAction<SaveState>>;
  selection: Selection;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  undo: () => void;
  redo: () => void;
  commitDocument: (transform: (current: Ecomap) => Ecomap) => void;
  resetHistory: (next: Ecomap | null) => void;
  updateCenter: (patch: Partial<Ecomap["center"]>) => void;
  updateSystem: (id: string, patch: Partial<SystemNode>) => void;
  updateConnection: (id: string, patch: Partial<Connection>) => void;
  addSystem: (category: Category) => void;
  deleteSelected: (askConfirmation: (q: string) => Promise<boolean>, msg: string) => Promise<void>;
  duplicateSelected: () => void;
  autoOrganize: () => void;
  loading: boolean;
  error: string | null;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [repoState, setRepoState] = useState<RepositoryState | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    document,
    past,
    setPast,
    future,
    setFuture,
    dirty,
    setDirty,
    commitDocument,
    undo,
    redo,
    resetHistory,
    updateCenter,
    updateSystem,
    updateConnection,
    setDocument,
  } = useEcomapHistory();

  useEffect(() => {
    let active = true;
    repository.loadState()
      .then((state) => { if (!active) return; setRepoState(state); setLoading(false); })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "No se pudo abrir el almacenamiento local.");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Autosave
  useEffect(() => {
    if (!dirty || !document) return;
    let active = true;
    setSaveState("unsaved");
    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      repository.saveDocument(document)
        .then(() => { 
          if (active) {
            setDirty(false);
            setSaveState("saved"); 
          }
        })
        .catch((err: unknown) => {
          if (active) {
            setSaveState("error");
          }
        });
    }, 700);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [dirty, document]);

  const addSystem = useCallback((category: Category) => {
    if (!document) return;
    const node = createSystemNode(document.id, category.id, category.label, document.systems.length);
    commitDocument((current) => ({ ...current, systems: [...current.systems, node] }));
    setSelection({ kind: "system", id: node.id });
  }, [document, commitDocument, setSelection]);

  const deleteSelected = useCallback(async (askConfirmation: (q: string) => Promise<boolean>, msg: string) => {
    if (!document || !selection || selection.kind === "center") return;
    if (!(await askConfirmation(msg))) return;
    if (selection.kind === "system") {
      commitDocument((current) => ({
        ...current,
        systems: current.systems.filter((s) => s.id !== selection.id),
        connections: current.connections.filter(
          (c) => c.sourceNodeId !== selection.id && c.targetNodeId !== selection.id,
        ),
      }));
    } else {
      commitDocument((current) => ({
        ...current,
        connections: current.connections.filter((c) => c.id !== selection.id),
      }));
    }
    setSelection({ kind: "center", id: document.center.id });
  }, [commitDocument, document, selection]);

  const duplicateSelected = useCallback(() => {
    if (!document || selection?.kind !== "system") return;
    const original = document.systems.find((s) => s.id === selection.id);
    if (!original) return;
    const copy = {
      ...cloneState(document).systems.find(s => s.id === original.id)!, 
      id: createId(),
      label: `${original.label} · copia`,
      orderIndex: document.systems.length,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    commitDocument((current) => ({ ...current, systems: [...current.systems, copy] }));
    setSelection({ kind: "system", id: copy.id });
  }, [commitDocument, document, selection]);

  const autoOrganize = useCallback(() => {
    if (!document || !repoState) return;
    const categoryOrder = new Map(repoState.categories.map((c) => [c.id, c.orderIndex]));
    commitDocument((current) => ({
      ...current,
      systems: [...current.systems]
        .sort(
          (a, b) =>
            (categoryOrder.get(a.categoryId) ?? 999) - (categoryOrder.get(b.categoryId) ?? 999) ||
            a.label.localeCompare(b.label),
        )
        .map((system, index) => ({ ...system, orderIndex: index })),
    }));
  }, [commitDocument, document, repoState]);

  const value = {
    repoState,
    setRepoState,
    document,
    setDocument,
    past,
    setPast,
    future,
    setFuture,
    dirty,
    setDirty,
    saveState,
    setSaveState,
    selection,
    setSelection,
    search,
    setSearch,
    undo,
    redo,
    commitDocument,
    resetHistory,
    updateCenter,
    updateSystem,
    updateConnection,
    addSystem,
    deleteSelected,
    duplicateSelected,
    autoOrganize,
    loading,
    error
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocumentContext must be used within a DocumentProvider");
  }
  return context;
}
