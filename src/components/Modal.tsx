import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalFrameProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "regular" | "wide";
}

export function ModalFrame({ title, children, onClose, size = "regular" }: ModalFrameProps): ReactNode {
  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className={`modal-card${size === "wide" ? " modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Cerrar"
            title="Cerrar"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
