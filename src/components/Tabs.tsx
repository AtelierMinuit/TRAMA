import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = "panel-tabs", tabClassName = "panel-tab" }: TabsProps): ReactNode {
  return (
    <div className={className} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`${tabClassName}${activeTab === tab.id ? " is-active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="notes-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
