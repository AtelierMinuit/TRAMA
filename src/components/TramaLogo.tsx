import React, { type ReactNode } from "react";

export interface TramaLogoProps {
  size?: number;
  className?: string;
  variant?: "brand" | "monochrome";
}

/**
 * TramaLogo — Isotipo oficial de TRAMA.
 * Representa la triquetra relacional: tres lazos entrelazados que simbolizan
 * a la persona/sujeto, su núcleo familiar y su red comunitaria en constante interacción.
 */
export function TramaLogo({
  size = 24,
  className = "",
  variant = "brand",
}: TramaLogoProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`trama-logo ${className}`}
      aria-label="TRAMA Logo"
      role="img"
    >
      <defs>
        <linearGradient id="trama-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="trama-mint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="trama-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <g
        transform="translate(24, 25)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {variant === "brand" ? (
          <>
            {/* Lazo 1: Eje Central / Persona (Esmeralda) */}
            <path
              d="M -4.5,-2 C -8.5,4.5 -8.5,14 0,16.5 C 8.5,14 8.5,4.5 4.5,-2 C 2.5,-5 -2.5,-5 -4.5,-2 Z"
              stroke="url(#trama-emerald)"
            />

            {/* Lazo 2: Núcleo Relacional / Familia (Menta) */}
            <g transform="rotate(120)">
              <path
                d="M -4.5,-2 C -8.5,4.5 -8.5,14 0,16.5 C 8.5,14 8.5,4.5 4.5,-2 C 2.5,-5 -2.5,-5 -4.5,-2 Z"
                stroke="url(#trama-mint)"
              />
            </g>

            {/* Lazo 3: Entorno y Recursos / Comunidad (Ámbar cálido) */}
            <g transform="rotate(240)">
              <path
                d="M -4.5,-2 C -8.5,4.5 -8.5,14 0,16.5 C 8.5,14 8.5,4.5 4.5,-2 C 2.5,-5 -2.5,-5 -4.5,-2 Z"
                stroke="url(#trama-amber)"
              />
            </g>

            {/* Punto de articulación / Nodo central */}
            <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
          </>
        ) : (
          <>
            {/* Modo Monocromo adaptable por CSS (currentColor) */}
            <path
              d="M -4.5,-2 C -8.5,4.5 -8.5,14 0,16.5 C 8.5,14 8.5,4.5 4.5,-2 C 2.5,-5 -2.5,-5 -4.5,-2 Z"
              stroke="currentColor"
            />
            <g transform="rotate(120)">
              <path
                d="M -4.5,-2 C -8.5,4.5 -8.5,14 0,16.5 C 8.5,14 8.5,4.5 4.5,-2 C 2.5,-5 -2.5,-5 -4.5,-2 Z"
                stroke="currentColor"
                strokeOpacity="0.8"
              />
            </g>
            <g transform="rotate(240)">
              <path
                d="M -4.5,-2 C -8.5,4.5 -8.5,14 0,16.5 C 8.5,14 8.5,4.5 4.5,-2 C 2.5,-5 -2.5,-5 -4.5,-2 Z"
                stroke="currentColor"
                strokeOpacity="0.6"
              />
            </g>
            <circle cx="0" cy="0" r="2.2" fill="currentColor" />
          </>
        )}
      </g>
    </svg>
  );
}
