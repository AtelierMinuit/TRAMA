import React, { useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import type { Language } from "../i18n";

export interface EditorToolbarProps {
  language: Language;
  onAddNode: () => void;
  onConnect: () => void;
  onToggleNotes: () => void;
  notesOpen: boolean;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOrganize: () => void;
}

export function EditorToolbar({
  language,
  onAddNode,
  onConnect,
  onToggleNotes,
  notesOpen,
  onFit,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOrganize,
}: EditorToolbarProps): ReactNode {
  const [activeTool, setActiveTool] = useState<"select" | "node" | "relation" | "note" | "text">("select");
  const isSpanish = language === "es";

  return (
    <div className="desktop-editor-toolbar" role="toolbar" aria-label="Herramientas del editor">
      {/* Primary Tool Buttons */}
      <div className="toolbar-tools-group">
        <button
          className={`toolbar-tool-btn ${activeTool === "select" ? "is-active" : ""}`}
          onClick={() => setActiveTool("select")}
          title={isSpanish ? "Herramienta Seleccionar" : "Select Tool"}
        >
          <Icon name="arrow" size={15} />
          <span>{isSpanish ? "Seleccionar" : "Select"}</span>
        </button>

        <button
          className={`toolbar-tool-btn ${activeTool === "node" ? "is-active" : ""}`}
          onClick={() => {
            setActiveTool("node");
            onAddNode();
          }}
          title={isSpanish ? "Añadir Sistema o Persona" : "Add Node"}
        >
          <Icon name="add" size={15} />
          <span>{isSpanish ? "Nodo" : "Node"}</span>
        </button>

        <button
          className={`toolbar-tool-btn ${activeTool === "relation" ? "is-active" : ""}`}
          onClick={() => {
            setActiveTool("relation");
            onConnect();
          }}
          title={isSpanish ? "Crear Vínculo o Relación" : "Create Connection"}
        >
          <Icon name="link" size={15} />
          <span>{isSpanish ? "Relación" : "Relation"}</span>
        </button>

        <button
          className={`toolbar-tool-btn ${notesOpen || activeTool === "note" ? "is-active" : ""}`}
          onClick={() => {
            setActiveTool("note");
            onToggleNotes();
          }}
          title={isSpanish ? "Panel de Notas Generales" : "General Notes"}
        >
          <Icon name="file-text" size={15} />
          <span>{isSpanish ? "Nota" : "Note"}</span>
        </button>

        <button
          className={`toolbar-tool-btn ${activeTool === "text" ? "is-active" : ""}`}
          onClick={() => {
            setActiveTool("text");
            onToggleNotes();
          }}
          title={isSpanish ? "Anotación de Texto" : "Text Annotation"}
        >
          <span className="toolbar-text-glyph">T</span>
          <span>{isSpanish ? "Texto" : "Text"}</span>
        </button>
      </div>

      <div className="toolbar-vertical-divider" />

      {/* Viewport & History Tools */}
      <div className="toolbar-viewport-group">
        <button className="toolbar-icon-btn" onClick={onFit} title={isSpanish ? "Ajustar al centro (Fit)" : "Fit to screen"}>
          <Icon name="fit" size={15} />
          <span>{isSpanish ? "Ajustar" : "Fit"}</span>
        </button>

        <div className="toolbar-zoom-controls">
          <button className="toolbar-icon-btn compact" onClick={onZoomOut} title="Alejar (-)">
            <Icon name="zoom-out" size={14} />
          </button>
          <button className="toolbar-zoom-label" onClick={onFit}>
            100%
          </button>
          <button className="toolbar-icon-btn compact" onClick={onZoomIn} title="Acercar (+)">
            <Icon name="zoom-in" size={14} />
          </button>
        </div>

        <div className="toolbar-vertical-divider" />

        <button
          className="toolbar-icon-btn compact"
          onClick={onUndo}
          disabled={!canUndo}
          title={isSpanish ? "Deshacer (⌘Z)" : "Undo (⌘Z)"}
        >
          <Icon name="back" size={15} />
        </button>

        <button
          className="toolbar-icon-btn compact"
          onClick={onRedo}
          disabled={!canRedo}
          title={isSpanish ? "Rehacer (⌘⇧Z)" : "Redo (⌘⇧Z)"}
        >
          <Icon name="forward" size={15} />
        </button>

        <button
          className="toolbar-icon-btn compact"
          onClick={onOrganize}
          title={isSpanish ? "Organizar mapa automáticamente" : "Auto-organize"}
        >
          <Icon name="grid" size={15} />
        </button>
      </div>
    </div>
  );
}
