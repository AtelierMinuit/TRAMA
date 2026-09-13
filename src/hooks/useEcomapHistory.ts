import { useState, useCallback } from "react";
import type { Ecomap, SystemNode, Connection } from "../domain/model";
import { cloneState, withUpdatedTimestamp, nowIso } from "../domain/model";

function clone<T>(value: T): T { return structuredClone(value); }

export function useEcomapHistory() {
  const [document, setDocument] = useState<Ecomap | null>(null);
  const [past, setPast] = useState<Ecomap[]>([]);
  const [future, setFuture] = useState<Ecomap[]>([]);
  const [dirty, setDirty] = useState(false);

  const commitDocument = useCallback(
    (transform: (current: Ecomap) => Ecomap) => {
      if (!document) return;
      setPast((items) => [...items, clone(document)].slice(-60));
      setFuture([]);
      setDocument((current) =>
        current ? { ...transform(clone(current)), updatedAt: nowIso() } : current,
      );
      setDirty(true);
    },
    [document],
  );

  const undo = useCallback(() => {
    if (!document || past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [clone(document), ...items].slice(0, 60));
    setDocument({ ...clone(previous), updatedAt: nowIso() });
    setDirty(true);
  }, [document, past]);

  const redo = useCallback(() => {
    if (!document || future.length === 0) return;
    const next = future[0];
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, clone(document)].slice(-60));
    setDocument({ ...clone(next), updatedAt: nowIso() });
    setDirty(true);
  }, [document, future]);

  const resetHistory = useCallback((next: Ecomap | null) => {
    setDocument(next);
    setPast([]);
    setFuture([]);
    setDirty(false);
  }, []);

  const updateCenter = useCallback(
    (patch: Partial<Ecomap["center"]>) => {
      commitDocument((current) => ({
        ...current,
        center: withUpdatedTimestamp({ ...current.center, ...patch }),
      }));
    },
    [commitDocument],
  );

  const updateSystem = useCallback(
    (id: string, patch: Partial<SystemNode>) => {
      commitDocument((current) => ({
        ...current,
        systems: current.systems.map((s) =>
          s.id === id ? withUpdatedTimestamp({ ...s, ...patch }) : s,
        ),
      }));
    },
    [commitDocument],
  );

  const updateConnection = useCallback(
    (id: string, patch: Partial<Connection>) => {
      commitDocument((current) => ({
        ...current,
        connections: current.connections.map((c) =>
          c.id === id ? withUpdatedTimestamp({ ...c, ...patch }) : c,
        ),
      }));
    },
    [commitDocument],
  );

  return {
    document,
    past,
    future,
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
  };
}
