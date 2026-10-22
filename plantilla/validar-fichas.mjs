// Valida fichas temas/<slug>.json SIN generar voz ni renderizar (rápido, sin efectos en videos/ ni salida/).
// Uso: node plantilla/validar-fichas.mjs [slug …]   (sin slugs: todas las fichas de temas/)
// Revisa: coincidencia con temas.csv, kinds del kit, hook primero y cierre último, largo de voz/títulos, cues que no
// aparecen en la voz, íconos desconocidos, límites del kit (buildIndex en una carpeta temporal) y la descripción de YouTube.
// Duración estimada con ~19,5 caracteres de voz por segundo (Daniela a velocidad 1.0) + 1 s por escena.
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { KINDS, buildIndex } from "./build-index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CPS = 19.5;

const csv = readFileSync(join(ROOT, "temas", "temas.csv"), "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean).slice(1)
  .map((l) => { const [clave, titulo, nivel, descripcion, estado] = l.split(";"); return { clave, titulo, nivel, descripcion, estado }; });
const deslinde = readFileSync(join(HERE, "youtube-deslinde.txt"), "utf8").trim();
const plain = (s) => String(s ?? "").replace(/\*\*/g, "");

const args = process.argv.slice(2);
const slugs = args.length ? args : readdirSync(join(ROOT, "temas")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
let errores = 0, avisos = 0;

for (const slug of slugs) {
  const file = join(ROOT, "temas", `${slug}.json`);
  const err = [], warn = [];
  if (!existsSync(file)) { console.log(`✗ ${slug}: no existe temas/${slug}.json`); errores++; continue; }
  let spec;
  try { spec = JSON.parse(readFileSync(file, "utf8")); } catch (e) { console.log(`✗ ${slug}: JSON inválido — ${e.message}`); errores++; continue; }

  const i = csv.findIndex((r) => r.clave === slug), row = csv[i], next = i >= 0 ? csv[i + 1] : null;
  if (spec.slug !== slug) err.push(`"slug" es "${spec.slug}"`);
  if (!row) err.push("no está en temas.csv");
  else {
    if (spec.titulo !== row.titulo) warn.push(`título distinto al CSV ("${row.titulo}")`);
    if (spec.nivel !== row.nivel) warn.push(`nivel distinto al CSV ("${row.nivel}")`);
  }
  const frames = spec.frames || [];
  frames.forEach((f, n) => {
    if (!KINDS.includes(f.kind)) err.push(`escena ${n + 1}: kind desconocido "${f.kind}"`);
    if (!f.vo) err.push(`escena ${n + 1}: sin "vo"`);
    if ((f.head || []).some((h) => /["“”]/.test(h))) warn.push(`escena ${n + 1}: comillas en head (Space Grotesk las dibuja mal)`);
  });
  if (frames[0]?.kind !== "hook") warn.push("la primera escena no es hook");
  const last = frames[frames.length - 1];
  if (last?.kind !== "cierre") warn.push("la última escena no es cierre");
  else {
    if (!next && !last.proximo) err.push('cierre sin "proximo" y no hay tema siguiente en el CSV');
    if (!/pr[oó]ximo/i.test(last.vo || "")) warn.push("la voz del cierre no nombra el próximo video");
  }
  if (frames.length < 7 || frames.length > 9) warn.push(`${frames.length} escenas (ideal 7–9)`);

  // Reglas del kit: buildIndex sobre una copia sin música en una carpeta temporal.
  const tmp = mkdtempSync(join(tmpdir(), "ficha-"));
  try {
    writeFileSync(join(tmp, "tema.json"), JSON.stringify({ ...spec, music: false }));
    const b = buildIndex(tmp, { next: spec.frames?.at(-1)?.proximo ? { titulo: spec.frames.at(-1).proximo } : next });
    b.warnings.filter((w) => !w.includes("sin voz")).forEach((w) => warn.push(w));
  } catch (e) { err.push(`buildIndex: ${e.message}`); }
  finally { rmSync(tmp, { recursive: true, force: true }); }

  // YouTube (mismas reglas que exportYoutube)
  const yt = spec.youtube || {};
  if (!yt.titulo || !yt.descripcion) err.push("falta youtube.titulo o youtube.descripcion");
  else {
    const desc = yt.descripcion.replace("{{DESLINDE}}", deslinde).replace("{{SIGUIENTE}}", next?.titulo || "¡se viene pronto!");
    if (!yt.descripcion.includes("{{DESLINDE}}")) err.push("descripción sin {{DESLINDE}}");
    if (!yt.descripcion.includes("{{SIGUIENTE}}")) warn.push("descripción sin {{SIGUIENTE}}");
    if (/\{\{/.test(desc)) err.push("marcador {{…}} sin reemplazar");
    if (/[<>]/.test(desc)) err.push("la descripción tiene < o >");
    if ([...yt.titulo].length > 100) err.push(`título YouTube de ${[...yt.titulo].length} caracteres`);
    if ([...desc].length > 4800) warn.push(`descripción de ${[...desc].length} caracteres (máx. 5000 con el crédito)`);
    const tags = yt.tags || [];
    if (tags.length < 8 || tags.length > 15) warn.push(`${tags.length} tags (8–15)`);
    if (tags.join(", ").length > 500) err.push(`tags: ${tags.join(", ").length} caracteres`);
  }

  const dur = frames.reduce((s, f) => s + Math.max(f.min || 4, plain(f.vo).length / CPS + 1), 0);
  errores += err.length; avisos += warn.length;
  console.log(`${err.length ? "✗" : warn.length ? "⚠" : "✓"} ${slug} — ${frames.length} escenas, ~${Math.round(dur)} s`);
  err.forEach((e) => console.log(`    ✗ ${e}`));
  warn.forEach((w) => console.log(`    ⚠ ${w}`));
}
console.log(`\n${slugs.length} fichas · ${errores} errores · ${avisos} avisos`);
process.exit(errores ? 1 : 0);
