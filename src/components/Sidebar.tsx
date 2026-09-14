import React, { type ReactNode } from "react";
import { Icon } from "./Icon";
import { TramaLogo } from "./TramaLogo";
import type { Language } from "../i18n";
import type { Ecomap } from "../domain/model";

export interface SidebarProps {
  language: Language;
  currentScreen: "dashboard" | "editor" | "settings";
  activeDocId?: string;
  recentDocs: Ecomap[];
  onNavigate: (screen: "dashboard" | "editor" | "settings") => void;
  onSelectDoc: (doc: Ecomap) => void;
  onOpenTemplates: () => void;
  onOpenSnapshots: () => void;
  onOpenExport: () => void;
  onSearch: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  language,
  currentScreen,
  activeDocId,
  recentDocs,
  onNavigate,
  onSelectDoc,
  onOpenTemplates,
  onOpenSnapshots,
  onOpenExport,
  onSearch,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps): ReactNode {
  const isSpanish = language === "es";

  // Helper for relative timestamps like "Hoy, 10:24" or "Ayer, 16:10"
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return isSpanish ? "Reciente" : "Recent";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
      const hours = date.getHours().toString().padStart(2, "0");
      const mins = date.getMinutes().toString().padStart(2, "0");

      if (diffDays === 0) return `${isSpanish ? "Hoy" : "Today"}, ${hours}:${mins}`;
      if (diffDays === 1) return `${isSpanish ? "Ayer" : "Yesterday"}, ${hours}:${mins}`;
      return new Intl.DateTimeFormat(isSpanish ? "es-CL" : "en-US", {
        day: "numeric",
        month: "short",
      }).format(date);
    } catch {
      return isSpanish ? "Reciente" : "Recent";
    }
  };

  return (
    <aside className={`app-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-wrap">
          <TramaLogo size={28} variant="brand" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-title">TRAMA</span>
          <span className="sidebar-subtitle">
            {isSpanish ? "Ecomapas con sentido" : "Relational Ecomaps"}
          </span>
        </div>
      </div>

      {/* Quick Search (⌘K) */}
      <button className="sidebar-search-btn" onClick={onSearch} title="Buscar o ejecutar comandos (⌘K)">
        <Icon name="search" size={15} className="sidebar-search-icon" />
        <span className="sidebar-search-placeholder">{isSpanish ? "Buscar..." : "Search..."}</span>
        <kbd className="sidebar-kbd">⌘K</kbd>
      </button>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${currentScreen === "dashboard" ? "is-active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          <Icon name="home" size={18} />
          <span>{isSpanish ? "Inicio" : "Home"}</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentScreen === "editor" ? "is-active" : ""}`}
          onClick={() => onNavigate("editor")}
        >
          <Icon name="file-text" size={18} />
          <span>{isSpanish ? "Ecomapas" : "Ecomaps"}</span>
        </button>

        <button className="sidebar-nav-item" onClick={onOpenTemplates}>
          <Icon name="grid" size={18} />
          <span>{isSpanish ? "Plantillas" : "Templates"}</span>
        </button>

        <button className="sidebar-nav-item" onClick={onOpenSnapshots}>
          <Icon name="history" size={18} />
          <span>{isSpanish ? "Snapshots" : "Snapshots"}</span>
        </button>

        <button className="sidebar-nav-item" onClick={onOpenExport}>
          <Icon name="download" size={18} />
          <span>{isSpanish ? "Exportaciones" : "Exports"}</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentScreen === "settings" ? "is-active" : ""}`}
          onClick={() => onNavigate("settings")}
        >
          <Icon name="settings" size={18} />
          <span>{isSpanish ? "Ajustes" : "Settings"}</span>
        </button>
      </nav>

      {/* Recientes Section */}
      <div className="sidebar-recents-section">
        <div className="sidebar-section-header">
          <span>{isSpanish ? "Recientes" : "Recents"}</span>
        </div>

        <div className="sidebar-recents-list">
          {recentDocs.length === 0 ? (
            <div className="sidebar-empty-recents">
              <small>{isSpanish ? "Sin ecomapas recientes" : "No recent ecomaps"}</small>
            </div>
          ) : (
            recentDocs.slice(0, 5).map((doc) => {
              const isActive = doc.id === activeDocId;
              return (
                <button
                  key={doc.id}
                  className={`sidebar-recent-item ${isActive ? "is-active" : ""}`}
                  onClick={() => onSelectDoc(doc)}
                  title={doc.title}
                >
                  <div className="sidebar-recent-icon-badge">
                    <Icon name="file" size={14} />
                  </div>
                  <div className="sidebar-recent-meta">
                    <span className="sidebar-recent-title">{doc.title}</span>
                    <span className="sidebar-recent-time">{formatTimeAgo(doc.updatedAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {recentDocs.length > 5 && (
          <button className="sidebar-view-all" onClick={() => onNavigate("dashboard")}>
            {isSpanish ? "Ver todos..." : "View all..."}
          </button>
        )}
      </div>

      {/* Bottom Inspirational Card & Footer */}
      <div className="sidebar-footer-card">
        <div className="sidebar-inspirational-card">
          <p className="sidebar-card-text">
            {isSpanish ? "Las relaciones también cuentan historias." : "Relationships also tell stories."}
          </p>
        </div>
        <div className="sidebar-legal-footer">
          <strong>TRAMA</strong>
          <span>
            {isSpanish
              ? "Herramienta libre para comunidades que cuidan."
              : "Free tool for caring communities."}
          </span>
        </div>
      </div>
    </aside>
  );
}
