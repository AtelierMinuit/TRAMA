### TRAMA v0.1.0-alpha.5 — Rediseño Contemporáneo Radical

Esta versión marca un antes y un después en la experiencia visual de TRAMA. Tras un análisis minucioso y auto-corrección visual en bucle mediante capturas reales, se descubrió y erradicó la causa por la cual los colores persistían apagados: un bloque de estilos internos incrustado por el renderizador SVG de SchemaTex y un color beige remanente en `index.css`.

#### 🎨 Innovaciones y Cambios Visuales Profundos
- **Fin a los Colores Apagados:** Se anularon mediante selectores CSS de alta especificidad los tonos opacos hardcodeados en el SVG. Los nodos ahora cuentan con una paleta vibrante contemporánea (Cian Neón, Verde Esmeralda, Rosa Rubí, Índigo Eléctrico y Ámbar Cálido) acompañados de sombras suaves (`drop-shadow`).
- **Lienzo Infinito con Retícula de Puntos (Dot Grid):** El fondo sucio/beige fue eliminado en favor de un lienzo limpio con trama de puntos sutiles inspirada en herramientas modernas como Figma, Linear y Miro.
- **Iconografía Temática Lucide en Paneles:** Las categorías y nodos en el panel de sistemas ahora integran insignias redondeadas con íconos vectoriales modernos de Lucide (Hogar, Usuarios, Maletín, Birrete, Corazón, etc.), abandonando los caracteres tipográficos arcaicos.
- **Inspector de Conexiones Pulido:** La lista de vínculos entre sistemas en el panel derecho se transformó en tarjetas flotantes interactivas con flechas de dirección acentuadas y respuesta háptica visual.
- **Barra de Herramientas Flotante Todo-en-Uno:** Se integraron los controles de zoom (Alejar, Ajustar/Fit, Acercar) dentro de la cápsula flotante inferior, eliminando botones huérfanos en esquinas.
- **Modo Oscuro Obsidiana:** Una experiencia nocturna de primer nivel en tonos pizarra profunda (`#090d16`) con retícula de puntos luminosos y nodos con brillo sutil.

#### 📦 Instalación
Descarga el archivo adjunto **TRAMA_0.1.0-alpha.5_aarch64.dmg**, ábrelo y arrastra la aplicación a tu carpeta de Aplicaciones en macOS Apple Silicon.
