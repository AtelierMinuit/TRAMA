import React, { useState, useEffect, type ReactNode } from "react";
import { Icon } from "./Icon";
import type { Language } from "../i18n";
import type { Ecomap, SystemNode } from "../domain/model";

export interface BottomNotesDrawerProps {
  language: Language;
  document: Ecomap;
  selectedSystem: SystemNode | null;
  onUpdateDocumentNotes: (notes: string) => void;
  onUpdateSystemNotes: (notes: string) => void;
  onClose: () => void;
  open: boolean;
}

export function BottomNotesDrawer({
  language,
  document,
  selectedSystem,
  onUpdateDocumentNotes,
  onUpdateSystemNotes,
  onClose,
  open,
}: BottomNotesDrawerProps): ReactNode {
  const [activeTab, setActiveTab] = useState<"global" | "node" | "history">("global");
  const [localNote, setLocalNote] = useState("");
  const [savedBadge, setSavedBadge] = useState(false);
  const isSpanish = language === "es";

  useEffect(() => {
    if (selectedSystem && open) {
      setActiveTab("node");
    } else if (!selectedSystem && activeTab === "node") {
      setActiveTab("global");
    }
  }, [selectedSystem, open]);

  const isEditingNode = activeTab === "node" && selectedSystem;

  useEffect(() => {
    if (isEditingNode && selectedSystem) {
      setLocalNote(selectedSystem.notes || "");
    } else {
      setLocalNote(document.center.notes || "");
    }
  }, [activeTab, selectedSystem, document.center.notes]);

  if (!open) return null;

  const handleSave = () => {
    if (isEditingNode) {
      onUpdateSystemNotes(localNote);
    } else {
      onUpdateDocumentNotes(localNote);
    }
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = window.document.getElementById("bottom-notes-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || "texto"}${suffix}`;
    const next = text.substring(0, start) + replacement + text.substring(end);
    setLocalNote(next);
  };

  return (
    <div className="desktop-bottom-drawer">
      {/* Drawer Header Tabs */}
      <div className="bottom-drawer-header">
        <div className="bottom-drawer-tabs">
          <button
            className={`bottom-drawer-tab ${activeTab === "global" ? "is-active" : ""}`}
            onClick={() => setActiveTab("global")}
          >
            {isSpanish ? "Notas generales" : "Global notes"}
          </button>
          <button
            className={`bottom-drawer-tab ${activeTab === "node" ? "is-active" : ""}`}
            onClick={() => setActiveTab("node")}
            disabled={!selectedSystem}
            title={!selectedSystem ? (isSpanish ? "Selecciona un nodo primero" : "Select a node first") : ""}
          >
            {isSpanish ? "Notas del nodo" : "Node notes"}
          </button>
          <button
            className={`bottom-drawer-tab ${activeTab === "history" ? "is-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            {isSpanish ? "Historial" : "History"}
          </button>
        </div>

        <button className="bottom-drawer-close-btn" onClick={onClose} title="Minimizar panel">
          <Icon name="close" size={14} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="bottom-drawer-body">
        {activeTab === "global" || activeTab === "node" ? (
          <>
            <textarea
              id="bottom-notes-textarea"
              className="bottom-notes-input"
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder={
                isEditingNode
                  ? (isSpanish
                      ? `Añade notas para el nodo ${selectedSystem.label || 'seleccionado'}...`
                      : `Add notes for node ${selectedSystem.label || 'selected'}...`)
                  : (isSpanish
                      ? "Añade una nota general sobre este ecomapa..."
                      : "Add a general note about this ecomap...")
              }
              rows={3}
            />

            {/* Markdown Formatting Toolbar */}
            <div className="bottom-notes-toolbar">
              <div className="markdown-tools">
                <button
                  className="fmt-btn"
                  onClick={() => insertMarkdown("**", "**")}
                  title="Negrita (Bold)"
                >
                  <strong>B</strong>
                </button>
                <button
                  className="fmt-btn"
                  onClick={() => insertMarkdown("*", "*")}
                  title="Cursiva (Italic)"
                >
                  <em>I</em>
                </button>
                <button
                  className="fmt-btn"
                  onClick={() => insertMarkdown("<u>", "</u>")}
                  title="Subrayado"
                >
                  <u>U</u>
                </button>
                <div className="fmt-divider" />
                <button
                  className="fmt-btn"
                  onClick={() => insertMarkdown("- ")}
                  title="Lista desordenada"
                >
                  ≡
                </button>
                <button
                  className="fmt-btn"
                  onClick={() => insertMarkdown("1. ")}
                  title="Lista numerada"
                >
                  ⁝
                </button>
                <button
                  className="fmt-btn"
                  onClick={() => insertMarkdown("[", "](https://)")}
                  title="Enlace"
                >
                  <Icon name="link" size={13} />
                </button>
              </div>

              <div className="bottom-notes-actions">
                <span className="markdown-hint">Markdown (?)</span>
                <button className="bottom-save-btn" onClick={handleSave}>
                  {savedBadge ? (isSpanish ? "✓ Guardado" : "✓ Saved") : (isSpanish ? "Guardar" : "Save")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bottom-drawer-history-list">
            <p className="muted" style={{ fontSize: 13, margin: "8px 0" }}>
              {isSpanish
                ? `Ecomapa creado el ${new Date(document.createdAt).toLocaleDateString()}. Total de ${document.systems.length} sistemas y ${document.connections.length} vínculos.`
                : `Ecomap created on ${new Date(document.createdAt).toLocaleDateString()}. Total of ${document.systems.length} systems and ${document.connections.length} connections.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
