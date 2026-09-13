import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Icon } from "./Icon";
import { getCategoryIconName } from "../shared";
import type { Category, Template } from "../domain/model";
import type { Language } from "../i18n";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  language: Language;
  onAddSystem: (category: Category) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOrganize: () => void;
  onExport: () => void;
  onReport: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  categories,
  language,
  onAddSystem,
  onSave,
  onUndo,
  onRedo,
  onOrganize,
  onExport,
  onReport,
  onToggleTheme,
  onToggleLanguage,
}: CommandPaletteProps) {
  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="cmdk-backdrop" onClick={() => onOpenChange(false)}>
      <div className="cmdk-container" onClick={(e) => e.stopPropagation()}>
        <Command label="Comandos TRAMA">
          <div className="cmdk-input-wrapper">
            <Icon name="file" size={16} className="cmdk-search-icon" />
            <Command.Input
              placeholder={
                language === "es"
                  ? "Escribe un comando o busca un sistema... (⌘K)"
                  : "Type a command or search a system... (⌘K)"
              }
              autoFocus
            />
            <kbd className="cmdk-kbd">ESC</kbd>
          </div>

          <Command.List className="cmdk-list">
            <Command.Empty className="cmdk-empty">
              {language === "es" ? "No se encontraron resultados." : "No results found."}
            </Command.Empty>

            {/* Acciones de Documento */}
            <Command.Group heading={language === "es" ? "Acciones y Herramientas" : "Actions & Tools"}>
              <Command.Item
                onSelect={() => {
                  onSave();
                  onOpenChange(false);
                }}
              >
                <Icon name="save" size={16} />
                <span>{language === "es" ? "Guardar cambios" : "Save changes"}</span>
                <kbd>⌘S</kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onReport();
                  onOpenChange(false);
                }}
              >
                <Icon name="file-text" size={16} />
                <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                  {language === "es" ? "Generar Informe Sociofamiliar Oficial (A4/PDF)" : "Generate Official Clinical Report (A4/PDF)"}
                </span>
                <span className="cmdk-badge">PRO</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOrganize();
                  onOpenChange(false);
                }}
              >
                <Icon name="grid" size={16} />
                <span>{language === "es" ? "Organizar mapa automáticamente" : "Auto-organize ecomap"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onExport();
                  onOpenChange(false);
                }}
              >
                <Icon name="download" size={16} />
                <span>{language === "es" ? "Exportar imagen (SVG / PNG)" : "Export image (SVG / PNG)"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onUndo();
                  onOpenChange(false);
                }}
              >
                <Icon name="back" size={16} />
                <span>{language === "es" ? "Deshacer último cambio" : "Undo"}</span>
                <kbd>⌘Z</kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onRedo();
                  onOpenChange(false);
                }}
              >
                <Icon name="forward" size={16} />
                <span>{language === "es" ? "Rehacer cambio" : "Redo"}</span>
                <kbd>⌘⇧Z</kbd>
              </Command.Item>
            </Command.Group>

            {/* Añadir Sistemas */}
            <Command.Group heading={language === "es" ? "Añadir Nuevo Sistema al Mapa" : "Add System to Map"}>
              {categories.map((cat) => (
                <Command.Item
                  key={cat.id}
                  onSelect={() => {
                    onAddSystem(cat);
                    onOpenChange(false);
                  }}
                >
                  <Icon name={getCategoryIconName(cat.key)} size={16} />
                  <span>
                    {language === "es" ? `Añadir: ${cat.label}` : `Add: ${cat.label}`}
                  </span>
                  <span className="cmdk-category-tag" style={{ background: `${cat.accent}20`, color: cat.accent }}>
                    {cat.label}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Preferencias */}
            <Command.Group heading={language === "es" ? "Preferencias y Sistema" : "Preferences & System"}>
              <Command.Item
                onSelect={() => {
                  onToggleTheme();
                  onOpenChange(false);
                }}
              >
                <Icon name="moon" size={16} />
                <span>{language === "es" ? "Alternar Modo Claro / Oscuro" : "Toggle Light / Dark Mode"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onToggleLanguage();
                  onOpenChange(false);
                }}
              >
                <Icon name="file" size={16} />
                <span>{language === "es" ? "Cambiar idioma (Español / English)" : "Switch language"}</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
