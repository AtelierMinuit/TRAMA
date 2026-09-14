import React, { useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import type { Language } from "../i18n";
import { statusLabel } from "../shared";

export interface DocumentHeaderProps {
  title: string;
  updatedAt: string;
  saveState: "saved" | "saving" | "unsaved" | "error";
  onUpdateTitle: (title: string) => void;
  onBack: () => void;
  onExport: () => void;
  language: Language;
}

export function DocumentHeader({
  title,
  updatedAt,
  saveState,
  onUpdateTitle,
  onBack,
  onExport,
  language,
}: DocumentHeaderProps): ReactNode {
  const [isFavorite, setIsFavorite] = useState(false);
  const isSpanish = language === "es";

  // Calculate initials (e.g., "Familia Torres" -> "FT")
  const getInitials = (text: string) => {
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) || "TR").toUpperCase();
  };

  const formatModified = (isoString?: string) => {
    if (!isoString) return isSpanish ? "hoy" : "today";
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, "0");
      const mins = date.getMinutes().toString().padStart(2, "0");
      return `${isSpanish ? "hoy" : "today"}, ${hours}:${mins}`;
    } catch {
      return isSpanish ? "reciente" : "recent";
    }
  };

  return (
    <header className="desktop-doc-header">
      {/* Navigation & Title */}
      <div className="doc-header-left">
        <button
          className="doc-header-back-btn"
          onClick={onBack}
          title={isSpanish ? "Volver a Inicio" : "Back to Home"}
          aria-label="Volver"
        >
          <Icon name="arrow" size={18} className="doc-back-icon" />
        </button>

        <div className="doc-title-meta-block">
          <div className="doc-title-row">
            <input
              className="doc-title-input"
              value={title}
              onChange={(e) => onUpdateTitle(e.currentTarget.value)}
              placeholder={isSpanish ? "Nombre del ecomapa..." : "Ecomap title..."}
              aria-label="Título del documento"
            />
            <button
              className={`doc-favorite-btn ${isFavorite ? "is-favorite" : ""}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title={isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          </div>

          <div className="doc-meta-row">
            <span>{isSpanish ? "Ecomapa" : "Ecomap"}</span>
            <span className="doc-meta-dot">·</span>
            <span>
              {isSpanish ? `Modificado ${formatModified(updatedAt)}` : `Modified ${formatModified(updatedAt)}`}
            </span>
            <span className="doc-meta-dot">·</span>
            <span className="doc-save-indicator">
              <span className={`save-dot ${saveState}`} />
              <span className="save-label">{statusLabel(language, saveState)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="doc-header-right">
        {/* User / Document Initials Badge */}
        <div className="doc-avatar-badge" title={`Documento: ${title}`}>
          <span>{getInitials(title)}</span>
        </div>

        {/* Primary Export Button */}
        <button className="doc-export-btn" onClick={onExport}>
          <Icon name="download" size={16} />
          <span>{isSpanish ? "Exportar" : "Export"}</span>
          <Icon name="chevron" size={14} className="doc-export-chevron" />
        </button>
      </div>
    </header>
  );
}
