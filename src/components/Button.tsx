import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type ButtonVariant = "primary" | "secondary" | "outline" | "quiet" | "icon" | "toolbar" | "full-secondary";

interface ButtonProps {
  variant?: ButtonVariant;
  icon?: IconName;
  iconSize?: number;
  label?: string; // aria-label para icon-only
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  children?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "primary-button",
  secondary: "secondary-action",
  outline: "outline-button",
  quiet: "quiet-button",
  icon: "icon-button",
  toolbar: "toolbar-button",
  "full-secondary": "secondary-full-button",
};

export function Button({
  variant = "primary",
  icon,
  iconSize = 16,
  label,
  active = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  children,
}: ButtonProps): ReactNode {
  const cls = `${variantClass[variant]}${active ? " is-active" : ""}${className ? ` ${className}` : ""}`;
  return (
    <button
      className={cls}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}
