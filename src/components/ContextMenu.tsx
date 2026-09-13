import React, { useEffect, useRef } from "react";
import { Icon } from "./Icon";
import type { Language } from "../i18n";
import type { StandardRelationshipType } from "../domain/model";

export interface ContextMenuState {
  x: number;
  y: number;
  target: "canvas" | "system" | "center";
  systemId?: string;
}

interface ContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
  language: Language;
  onAddConnection?: (type: StandardRelationshipType) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onOrganize?: () => void;
  onFit?: () => void;
  onOpenCommandPalette?: () => void;
}

export function ContextMenu({
  menu,
  onClose,
  language,
  onAddConnection,
  onDelete,
  onDuplicate,
  onOrganize,
  onFit,
  onOpenCommandPalette,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!menu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  // Prevent menu overflow off-screen
  const x = Math.min(menu.x, window.innerWidth - 220);
  const y = Math.min(menu.y, window.innerHeight - 260);

  return (
    <div
      ref={menuRef}
      className="context-menu-popover"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {menu.target === "system" ? (
        <>
          <div className="context-menu-header">
            {language === "es" ? "Opciones del sistema" : "System options"}
          </div>

          <button
            className="context-menu-item"
            onClick={() => {
              onDuplicate?.();
              onClose();
            }}
          >
            <Icon name="file" size={14} />
            <span>{language === "es" ? "Duplicar sistema" : "Duplicate system"}</span>
          </button>

          <div className="context-menu-divider" />
          <div className="context-menu-label">
            {language === "es" ? "Vínculo con centro" : "Tie with center"}
          </div>

          <button
            className="context-menu-item"
            onClick={() => {
              onAddConnection?.("strong");
              onClose();
            }}
          >
            <span className="tie-dot strong" />
            <span>{language === "es" ? "Fuerte / Apoyo" : "Strong / Support"}</span>
          </button>

          <button
            className="context-menu-item"
            onClick={() => {
              onAddConnection?.("moderate");
              onClose();
            }}
          >
            <span className="tie-dot moderate" />
            <span>{language === "es" ? "Moderada / Neutra" : "Moderate / Neutral"}</span>
          </button>

          <button
            className="context-menu-item"
            onClick={() => {
              onAddConnection?.("stressful");
              onClose();
            }}
          >
            <span className="tie-dot stressful" />
            <span>{language === "es" ? "Estresante / Tensión" : "Stressful / Tension"}</span>
          </button>

          <div className="context-menu-divider" />

          <button
            className="context-menu-item danger"
            onClick={() => {
              onDelete?.();
              onClose();
            }}
          >
            <Icon name="trash" size={14} />
            <span>{language === "es" ? "Eliminar del mapa" : "Delete from map"}</span>
          </button>
        </>
      ) : (
        <>
          <div className="context-menu-header">
            {language === "es" ? "Lienzo de trabajo" : "Canvas"}
          </div>

          <button
            className="context-menu-item"
            onClick={() => {
              onOrganize?.();
              onClose();
            }}
          >
            <Icon name="grid" size={14} />
            <span>{language === "es" ? "Organizar automáticamente" : "Auto-organize"}</span>
          </button>

          <button
            className="context-menu-item"
            onClick={() => {
              onFit?.();
              onClose();
            }}
          >
            <Icon name="fit" size={14} />
            <span>{language === "es" ? "Ajustar vista al centro" : "Fit to center"}</span>
          </button>

          <div className="context-menu-divider" />

          <button
            className="context-menu-item"
            onClick={() => {
              onOpenCommandPalette?.();
              onClose();
            }}
          >
            <Icon name="file-text" size={14} />
            <span>{language === "es" ? "Buscar comando (⌘K)" : "Command palette (⌘K)"}</span>
            <kbd>⌘K</kbd>
          </button>
        </>
      )}
    </div>
  );
}
