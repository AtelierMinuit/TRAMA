// Captures REAL screenshots of the TRAMA app served from dist/.
// Uses only fictitious demo data. Requires a prior `pnpm build`.
const puppeteer = require("puppeteer");
const express = require("express");
const path = require("node:path");
const fs = require("node:fs");

const PORT = 3033;
const OUT = path.join(__dirname, "..", "docs", "assets", "screenshots");

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clickByLabel = (page, label) => page.evaluate((l) => {
  const el = document.querySelector(`button[aria-label="${l}"], button[title="${l}"]`);
  if (el) el.click();
  return !!el;
}, label);

// Fictitious ecomap state seeded into localStorage so the dashboard shows a real document.
function seedState() {
  const now = "2026-09-13T10:00:00.000Z";
  const ws = "ws-rivera";
  const centerId = "center-rivera";
  const ecomapId = "ecomap-rivera";
  const cat = (key, label, icon, accent, orderIndex, id) => ({
    id, workspaceId: ws, key, label, schematexCategory: key,
    icon, visualStyle: "solid", accent, hidden: false, orderIndex,
    createdAt: now, updatedAt: now,
  });
  const categories = [
    cat("family", "Familia extensa", "users", "#4f7291", 0, "cat-family"),
    cat("education", "Escuela", "education", "#8a7f4f", 1, "cat-school"),
    cat("health", "CESFAM", "heart", "#ad5b61", 2, "cat-health"),
    cat("government", "Programa social", "scale", "#5a6b8c", 3, "cat-social"),
    cat("community", "Comunidad", "community", "#53775b", 4, "cat-community"),
    cat("work", "Trabajo", "briefcase", "#7a6b54", 5, "cat-work"),
    cat("recreation", "Amistades", "heart", "#9c6f7d", 6, "cat-friends"),
  ];
  const sys = (categoryId, label, orderIndex, id, size = "medium") => ({
    ...{ id, ecomapId: ecomapId, label, categoryId, description: "", size, notes: "", orderIndex, createdAt: now, updatedAt: now },
    sourceType: "professional_observation", verificationStatus: "verified",
  });
  const systems = [
    sys("cat-family", "Familia extensa", 0, "sys-family", "large"),
    sys("cat-school", "Escuela ficticia", 1, "sys-school"),
    sys("cat-health", "CESFAM ficticio", 2, "sys-health"),
    sys("cat-social", "Programa social ficticio", 3, "sys-social"),
    sys("cat-community", "Comunidad ficticia", 4, "sys-community"),
    sys("cat-work", "Trabajo ficticio", 5, "sys-work"),
    sys("cat-friends", "Amistades ficticias", 6, "sys-friends"),
  ];
  const conn = (sourceId, targetId, relationshipType, energyFlow, label, id) => ({
    ...{ id, ecomapId: ecomapId, sourceNodeId: sourceId, targetNodeId: targetId, relationshipType, energyFlow, label, notes: "", createdAt: now, updatedAt: now },
    sourceType: "client_report", verificationStatus: "needs_review",
  });
  const connections = [
    conn(centerId, "sys-family", "strong", "mutual", "Vínculo cercano", "c1"),
    conn(centerId, "sys-school", "moderate", "toward_center", "", "c2"),
    conn(centerId, "sys-health", "stressful", "toward_center", "", "c3"),
    conn(centerId, "sys-social", "mandated", "toward_center", "Atención mandatada", "c4"),
    conn(centerId, "sys-community", "emerging", "mutual", "", "c5"),
    conn(centerId, "sys-work", "moderate", "away_from_center", "", "c6"),
    conn(centerId, "sys-friends", "weak", "mutual", "", "c7"),
    conn("sys-family", "sys-health", "ambivalent", "none", "", "c8"),
  ];
  const center = {
    id: centerId, ecomapId: ecomapId, label: "Familia Rivera", representation: "family_unit",
    description: "Caso ficticio demostrativo", notes: "Datos ficticios para capturas.",
    sourceType: "client_report", sourceDate: "2026-09-01", verificationStatus: "needs_review",
    createdAt: now, updatedAt: now,
  };
  const ecomap = {
    id: ecomapId, workspaceId: ws, title: "Familia Rivera — Caso demostrativo",
    schemaVersion: 1, appVersion: "0.1.0", createdAt: now, updatedAt: now,
    center, systems, connections, notes: [],
  };
  const snapshotState = (relOverride, name) => ({
    center, systems, connections: connections.map((c) => c.id === "c3" ? { ...c, relationshipType: relOverride } : c), notes: [],
  });
  const snapshots = [
    {
      id: "snap-1", ecomapId: ecomapId, snapshotAt: "2026-09-01T10:00:00.000Z",
      name: "Primera entrevista", reason: "Línea base ficticia",
      state: snapshotState("strong", "s1"), createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "snap-2", ecomapId: ecomapId, snapshotAt: "2026-09-13T10:00:00.000Z",
      name: "Seguimiento mensual", reason: "Cambios en red de apoyo",
      state: snapshotState("stressful", "s2"), createdAt: now, updatedAt: now,
    },
  ];
  return {
    workspace: { id: ws, name: "Espacio local", description: "Documentos TRAMA ficticios.", createdAt: now, updatedAt: now },
    categories, ecomaps: [ecomap], templates: [], snapshots,
  };
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const app = express();
  app.use(express.static(path.join(__dirname, "..", "dist")));
  const server = app.listen(PORT, () => console.log(`Server on ${PORT}`));

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  const seed = JSON.stringify(seedState());

  // 1. Dashboard (light)
  await page.goto(`http://localhost:${PORT}`);
  await page.evaluate((s) => { localStorage.setItem("trama.local.state.v1", s); localStorage.setItem("trama.theme", "light"); }, seed);
  await page.reload();
  await wait(1800);
  await page.screenshot({ path: path.join(OUT, "dashboard.png") });
  console.log("1. dashboard.png");

  // 2. Editor (light) — open the seeded document
  await page.evaluate(() => {
    const card = document.querySelector(".recent-row") || document.querySelector(".template-card");
    if (card) card.click();
  });
  await wait(2200);
  await page.screenshot({ path: path.join(OUT, "editor.png") });
  console.log("2. editor.png");

  // 3. Inspector — select a system node to show the inspector panel
  await page.evaluate(() => {
    const item = document.querySelector(".system-list-item");
    if (item) item.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(OUT, "inspector.png") });
  console.log("3. inspector.png");

  // 4. Snapshots modal
  await clickByLabel(page, "Historial");
  await wait(1200);
  await page.screenshot({ path: path.join(OUT, "snapshots.png") });
  console.log("4. snapshots.png");

  // 5. Comparison — open compare from snapshots modal
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /compar|compare/i.test(b.textContent));
    if (btn) btn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(OUT, "comparison.png") });
  console.log("5. comparison.png");
  await page.keyboard.press("Escape");
  await wait(500);

  // 6. Export modal
  await clickByLabel(page, "Exportar");
  await wait(1200);
  await page.screenshot({ path: path.join(OUT, "export.png") });
  console.log("6. export.png");
  await page.keyboard.press("Escape");
  await wait(500);

  // 7. Settings — click the TRAMA wordmark to return to dashboard, then Ajustes
  await page.evaluate(() => {
    const wordmark = document.querySelector("button.brand-wordmark");
    if (wordmark) wordmark.click();
  });
  await wait(1500);
  await clickByLabel(page, "Ajustes");
  await wait(1500);
  let settingsReady = await page.evaluate(() => !!document.querySelector(".settings-screen"));
  if (!settingsReady) {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button[aria-label], button[title]")].find((b) => /ajustes|settings|preferencias/i.test(b.getAttribute("aria-label") || b.getAttribute("title") || ""));
      if (btn) btn.click();
    });
    await wait(1500);
    settingsReady = await page.evaluate(() => !!document.querySelector(".settings-screen"));
  }
  await page.screenshot({ path: path.join(OUT, "settings.png") });
  console.log("7. settings.png" + (settingsReady ? "" : " (fallback)"));

  // 8. Dark mode — back to editor in dark theme
  await page.evaluate(() => { localStorage.setItem("trama.theme", "dark"); });
  await page.goto(`http://localhost:${PORT}`);
  await page.evaluate((s) => { localStorage.setItem("trama.local.state.v1", s); }, seed);
  await page.reload();
  await wait(1500);
  await page.evaluate(() => {
    const card = document.querySelector(".recent-row") || document.querySelector(".template-card");
    if (card) card.click();
  });
  await wait(2200);
  await page.screenshot({ path: path.join(OUT, "dark-mode.png") });
  console.log("8. dark-mode.png");

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log("All screenshots captured.");
})().catch((err) => {
  console.error("SCREENSHOT FAIL:", err);
  process.exit(1);
});
