import { svgToPngBlob } from "schematex/export";
import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { Category, Ecomap, EnergyFlow, RelationshipType, isExtendedRelationship } from "../domain/model";
import { renderSchemaTex } from "../adapters/schematex";

export type ExportFormat = "svg" | "png" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  includeLegend: boolean;
  background: "transparent" | "white";
}

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  strong: "Fuerte",
  moderate: "Moderada",
  weak: "Débil",
  stressful: "Estresante",
  conflictual: "Conflictiva",
  broken: "Interrumpida / rota",
  enmeshed: "Enredada / fusionada",
  distant: "Distante",
  ambivalent: "Ambivalente",
  cutoff: "Cortada",
  abusive: "Abusiva / dañina",
  mandated: "Mandatada",
  dependent: "Dependiente",
  estranged: "Alejada",
  coercive: "Coercitiva",
  emerging: "Emergente",
};

const FLOW_LABELS: Record<EnergyFlow, string> = {
  toward_center: "Hacia centro",
  away_from_center: "Desde centro",
  mutual: "Mutuo",
  none: "Sin dirección",
};

export async function exportEcomap(
  document: Ecomap,
  categories: Category[],
  options: ExportOptions,
  theme: "light" | "dark" | "monochrome" = "light",
): Promise<Uint8Array> {
  const projection = renderSchemaTex(document, categories, theme);
  const svg = options.includeLegend ? addLegend(projection.svg, document, categories, theme) : projection.svg;
  if (options.format === "svg") return new TextEncoder().encode(svg);
  if (options.format === "png") {
    const blob = await svgToPngBlob(svg, {
      scale: 2,
      background: options.background === "white" ? "white" : null,
    });
    return new Uint8Array(await blob.arrayBuffer());
  }
  return pdfFromSvg(svg);
}

function pdfFromSvg(svg: string): Promise<Uint8Array> {
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parsed.documentElement;
  if (root.tagName.toLowerCase() !== "svg") throw new Error("El SVG no pudo prepararse para PDF.");
  const viewBox = (root.getAttribute("viewBox") ?? "0 0 1200 800").split(/\s+/).map(Number);
  const sourceWidth = Number.isFinite(viewBox[2]) && viewBox[2] > 0 ? viewBox[2] : 1200;
  const sourceHeight = Number.isFinite(viewBox[3]) && viewBox[3] > 0 ? viewBox[3] : 800;
  const pageWidth = 595;
  const pageHeight = Math.max(420, pageWidth * (sourceHeight / sourceWidth));
  const pdf = new jsPDF({
    orientation: sourceWidth >= sourceHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pageWidth, pageHeight],
    compress: true,
  });
  return svg2pdf(root, pdf, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    loadExternalStyleSheets: false,
    loadImages: false,
  }).then(() => new Uint8Array(pdf.output("arraybuffer")));
}

function addLegend(svg: string, document: Ecomap, categories: Category[], theme: "light" | "dark" | "monochrome"): string {
  const match = svg.match(/viewBox="([^"]+)"/);
  const values = match?.[1]?.split(/\s+/).map(Number) ?? [0, 0, 1200, 800];
  const width = Number.isFinite(values[2]) ? values[2] : 1200;
  const height = Number.isFinite(values[3]) ? values[3] : 800;
  const presentCategories = categories.filter((category) => document.systems.some((node) => node.categoryId === category.id));
  const relationTypes = [...new Set(document.connections.map((connection) => connection.relationshipType))];
  const flows = [...new Set(document.connections.map((connection) => connection.energyFlow))];
  const rows = Math.max(presentCategories.length, relationTypes.length, flows.length, 1);
  const legendHeight = 72 + rows * 24;
  const foreground = theme === "dark" ? "#f4f1eb" : "#28312f";
  const muted = theme === "dark" ? "#b8c1bb" : "#65716d";
  const surface = theme === "dark" ? "#18201f" : "#fbfaf7";
  const separator = theme === "dark" ? "#41504b" : "#d7ded8";
  const columns = [
    {
      title: "Sistemas",
      items: presentCategories.map((category) => `${category.icon}  ${category.label}`),
    },
    {
      title: "Vínculos",
      items: relationTypes.map((relationship) => `${isExtendedRelationship(relationship) ? "EXT. " : ""}${RELATIONSHIP_LABELS[relationship]}`),
    },
    {
      title: "Flujo",
      items: flows.map((flow) => FLOW_LABELS[flow]),
    },
  ];
  const columnWidth = width / columns.length;
  const legend = [
    `<g class="trama-legend" aria-label="Leyenda">`,
    `<rect x="0" y="${height}" width="${width}" height="${legendHeight}" fill="${surface}"/>`,
    `<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${separator}" stroke-width="1"/>`,
    `<text x="28" y="${height + 28}" fill="${foreground}" font-family="Avenir Next, sans-serif" font-size="14" font-weight="700">Leyenda</text>`,
  ];
  columns.forEach((column, columnIndex) => {
    const x = columnIndex * columnWidth + 28;
    legend.push(`<text x="${x}" y="${height + 50}" fill="${muted}" font-family="Avenir Next, sans-serif" font-size="11" font-weight="700">${escapeXml(column.title.toUpperCase())}</text>`);
    column.items.forEach((item, rowIndex) => {
      legend.push(`<text x="${x}" y="${height + 72 + rowIndex * 24}" fill="${foreground}" font-family="Avenir Next, sans-serif" font-size="12">${escapeXml(item)}</text>`);
    });
  });
  legend.push("</g>");
  const updatedSvg = svg.replace(/viewBox="([^"]+)"/, `viewBox="${values[0]} ${values[1]} ${width} ${height + legendHeight}"`);
  return updatedSvg.replace("</svg>", `${legend.join("")}</svg>`);
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
