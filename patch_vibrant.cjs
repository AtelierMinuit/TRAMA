const fs = require('fs');

// 1. Patch defaults.ts
let defaultsPath = 'src/domain/defaults.ts';
let defaultsContent = fs.readFileSync(defaultsPath, 'utf8');

// The new seed with vibrant macOS colors and cleaner icons
const newSeed = `const categorySeed: Array<[
  string,
  string,
  Category["schematexCategory"],
  string,
  Category["visualStyle"],
  string,
]> = [
  ["family", "Familia", "family", "⌂", "solid", "#FF3B30"], // Red
  ["extended_family", "Familia extensa", "family", "⌁", "outline", "#FF9500"], // Orange
  ["friends_peers", "Amistades / pares", "friends", "◌", "outline", "#34C759"], // Green
  ["education", "Educación", "education", "□", "solid", "#007AFF"], // Blue
  ["work", "Trabajo", "work", "▤", "solid", "#5856D6"], // Indigo
  ["health", "Salud", "health", "＋", "solid", "#FF2D55"], // Pink
  ["mental_health", "Salud mental", "mental-health", "◉", "outline", "#AF52DE"], // Purple
  ["substance_treatment", "Consumo / tratamiento", "substance", "◍", "hatched", "#A2845E"], // Brown
  ["housing", "Vivienda", "government", "⌂", "solid", "#8E8E93"], // Gray
  ["food", "Alimentación", "community", "◒", "outline", "#30B0C7"], // Teal
  ["transport", "Transporte", "government", "⇢", "outline", "#32ADE6"], // Cyan
  ["finance", "Ingresos / finanzas", "financial", "$", "solid", "#00C7BE"], // Mint
  ["government", "Gobierno / servicios públicos", "government", "▦", "solid", "#5856D6"], // Indigo
  ["justice", "Justicia", "legal", "§", "hatched", "#AF52DE"], // Purple
  ["religion", "Religión / espiritualidad", "religion", "✦", "outline", "#FFCC00"], // Yellow
  ["recreation", "Recreación", "recreation", "✳", "outline", "#34C759"], // Green
  ["community", "Comunidad", "community", "✧", "solid", "#007AFF"], // Blue
  ["culture", "Cultura", "cultural", "◈", "outline", "#FF9500"], // Orange
  ["care", "Cuidados", "health", "♡", "solid", "#FF2D55"], // Pink
  ["organizations", "Organizaciones", "community", "▣", "solid", "#32ADE6"], // Cyan
  ["other", "Otro", "other", "•", "outline", "#8E8E93"], // Gray
];`;

// Replace the original seed
defaultsContent = defaultsContent.replace(/const categorySeed: Array<.*?\];/s, newSeed);
fs.writeFileSync(defaultsPath, defaultsContent);

// 2. Patch Editor.tsx
let editorPath = 'src/screens/Editor/Editor.tsx';
let editorContent = fs.readFileSync(editorPath, 'utf8');

// Remove SchemaTex badge
editorContent = editorContent.replace(/<span className="source-only-badge"[^>]*>.*?<\/span>/s, '');
// Remove the whole toolbar-center if it only has document-meta now, actually let's keep document-meta but centered
// Wait, document meta can just be in toolbar-center without the badge.

// Remove canvas-topline completely
editorContent = editorContent.replace(/<div className="canvas-topline">.*?<\/div>/s, '');

// Clean up canvas-bottomline by removing the text span
editorContent = editorContent.replace(/<span>[\s\S]*?(Pan y zoom del canvas disponibles|Canvas pan and zoom available).*?<\/span>/s, '');

// Clean up Inspector empty state. The inspector had a huge "Sin selección" text that didn't look like Mac.
// We'll leave it simple for now, but maybe remove the explicit diagram if there is one.

fs.writeFileSync(editorPath, editorContent);
