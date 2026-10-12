// Un comando por video: temas/<slug>.json → videos/<slug>/ → salida/<slug>.mp4 + .youtube.txt + .miniatura.png + CHECKLIST.md
//
//   node plantilla/make-video.mjs <slug>              init si hace falta → voz (solo si cambió el texto) → index.html → check → snapshots
//   node plantilla/make-video.mjs <slug> --render     lo anterior + render de calidad alta → salida/<slug>.mp4 (correrlo en segundo plano)
//   node plantilla/make-video.mjs <slug> --miniatura  solo regenera salida/<slug>.miniatura.png (rápido, sin voz ni render)
//   node plantilla/make-video.mjs <slug> --info       fila de temas/temas.csv + anterior/siguiente (datos para la ficha)
//   node plantilla/make-video.mjs --checklist         regenera CHECKLIST.md y todos los salida/<slug>.youtube.txt
//   node plantilla/make-video.mjs --iconos            hoja con todos los íconos (videos/_iconos/snapshots/)
//   node plantilla/make-video.mjs --pronunciacion [palabra]  audios para comparar cómo lee Daniela (videos/_pronunciacion/)
//   node plantilla/make-video.mjs --kit               demo de todos los kinds de escena (plantilla/kit-demo.json → videos/_kit/)
//   node plantilla/make-video.mjs <slug> --identidad <id>  mismo video con otra identidad visual (videos/_identidad-<id>/)
//
// Flags: --force-tts (regenera la voz aunque el texto no cambió) · --no-check · --no-snapshot
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, identidadActiva } from "./build-index.mjs";
import { ICON_NAMES, icono } from "./iconos.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
export const HF = "npx --yes hyperframes@0.8.150"; // misma versión que VidesoEjercicios
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const opt = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const slug = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--identidad");

const sh = (cmd, cwd, inherit = true) => {
  console.log(`$ ${cmd}`);
  return spawnSync(cmd, { cwd, shell: true, stdio: inherit ? "inherit" : "pipe", encoding: "utf8" });
};
const statusPath = (dir) => join(dir, ".pipeline.json");
const readStatus = (dir) => (existsSync(statusPath(dir)) ? JSON.parse(readFileSync(statusPath(dir), "utf8")) : {});
const writeStatus = (dir, patch) => writeFileSync(statusPath(dir), JSON.stringify({ ...readStatus(dir), ...patch }, null, 2));
const today = () => new Date().toISOString().slice(0, 10);

// Lista maestra: temas/temas.csv — clave;titulo;nivel;descripcion;estado (";" con comillas opcionales, UTF-8).
// El orden de las filas es el orden de producción (y de "En el próximo video…").
export function readCsv() {
  const file = join(ROOT, "temas", "temas.csv");
  if (!existsSync(file)) return [];
  const t = readFileSync(file, "utf8").replace(/^﻿/, "");
  const rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
    } else if (c === '"') q = true;
    else if (c === ";") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f.replace(/\r$/, "")); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...data] = rows;
  return data.filter((r) => r.length > 1 && r[0]).map((r) => Object.fromEntries(head.map((k, i) => [k.trim(), (r[i] || "").trim()])));
}
const neighbours = (key) => {
  const csv = readCsv(), i = csv.findIndex((r) => r.clave === key);
  return { row: csv[i], prev: i > 0 ? csv[i - 1] : null, next: i >= 0 ? csv[i + 1] || null : null };
};

// Huella de lo que se ve/escucha: cambiar youtube, miniatura, notas o revisado NO marca el video como desactualizado.
export function contentHash(spec) {
  const { youtube, miniatura, notas, revisado, ...rest } = spec;
  return createHash("sha1").update(JSON.stringify(rest)).digest("hex").slice(0, 12);
}

// Lo que se compara para saber si el render quedó viejo: la ficha + la identidad visual con la que se renderizó.
const renderHash = (spec) => `${contentHash(spec)}:${identidadActiva().id}`;

// Los ya publicados se mueven a mano a salida/subidos/: los archivos se buscan ahí también (no se duplican ni se pierden).
const SUBIDOS = join(ROOT, "salida", "subidos");
const subidoPath = (file) => (existsSync(join(SUBIDOS, file)) ? join(SUBIDOS, file) : null);
const outPath = (file) => subidoPath(file) || join(ROOT, "salida", file);
const rel = (f) => f.slice(ROOT.length + 1).replace(/\\/g, "/");

const VOICE_CREDIT = "🎙️ Voz: Daniela (Piper TTS, rhasspy/piper-voices), datos de Google OpenSLR 61, licencia CC BY-SA 4.0.";
const DESLINDE = () => readFileSync(join(HERE, "youtube-deslinde.txt"), "utf8").trim();

// salida/<slug>.youtube.txt — TÍTULO / DESCRIPCIÓN / TAGS listos para YouTube Studio. Devuelve los avisos de validación.
// En la descripción: {{DESLINDE}} = plantilla/youtube-deslinde.txt tal cual; {{SIGUIENTE}} = título del próximo tema del CSV.
export function exportYoutube(spec) {
  const yt = spec.youtube;
  if (!yt?.descripcion) return null;
  const warns = [];
  const next = neighbours(spec.slug).next;
  let desc = yt.descripcion.replace("{{DESLINDE}}", DESLINDE()).replace("{{SIGUIENTE}}", next?.titulo || "¡se viene pronto!");
  if (!desc.includes(DESLINDE())) warns.push("falta el deslinde ({{DESLINDE}})");
  // Crédito de la voz (CC BY-SA 4.0): antes de la línea de hashtags (la última).
  if (!desc.includes("Voz: Daniela")) {
    const lines = desc.split("\n"), tags = lines.pop();
    desc = [...lines, VOICE_CREDIT, "", tags].join("\n");
  }
  const tags = yt.tags || [];
  if ([...yt.titulo].length > 100) warns.push(`título de ${[...yt.titulo].length} caracteres (máx. 100)`);
  if (tags.length < 8 || tags.length > 15) warns.push(`${tags.length} tags (8–15)`);
  if (tags.join(", ").length > 500) warns.push(`tags: ${tags.join(", ").length} caracteres (máx. 500)`);
  if ([...desc].length > 5000) warns.push(`descripción de ${[...desc].length} caracteres (máx. 5000)`);
  if (/[<>]/.test(desc)) warns.push("la descripción tiene < o > (YouTube los rechaza)");
  mkdirSync(join(ROOT, "salida"), { recursive: true });
  const txt = ["TÍTULO", yt.titulo, "", "DESCRIPCIÓN", desc, "", "TAGS", tags.join(", "), ""].join("\n");
  writeFileSync(outPath(`${spec.slug}.youtube.txt`), txt);
  return warns;
}

function writeDocs(dir, spec, frames) {
  writeFileSync(join(dir, "BRIEF.md"), `---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "${spec.titulo}"
destination: shorts
aspect: 1080x1920
language: es-AR
audience: personas que no saben nada de criptomonedas
angle: explainer
---

## Intent

Video educativo vertical del canal "Cripto desde cero" (${spec.nivel}): "${spec.titulo}".
Descripción del tema (verbatim): "${spec.descripcion}"

## Notes

- Generado con plantilla/make-video.mjs desde temas/${spec.slug}.json (no editar a mano).
- Identidad visual: plantilla/identidad/ (frame.md copiado en este proyecto).
`);
  writeFileSync(join(dir, "STORYBOARD.md"), `---
format: 1080x1920
message: "${spec.titulo}"
audience: personas que no saben nada de criptomonedas
mode: autonomous
music: plantilla/musica/bgm-base.wav
---
${frames.map((f, i) => `
## Frame ${i + 1} — ${f.kind}: ${(f.head || []).join(" ")}

- status: animated
- min: ${f.min || 4}s
- voiceover: "${f.vo}"
`).join("")}`);
  writeFileSync(join(dir, "SCRIPT.md"), `# SCRIPT — ${spec.slug}

**Voice:** es_AR-daniela-high (piper, español rioplatense)
**Voice direction:** Cercana, clara y tranquila; explica como a un amigo que nunca escuchó del tema.

---
${frames.map((f, i) => `
## Line ${i + 1} — ${f.kind} (Frame ${i + 1})

    ${f.vo}
`).join("")}`);
}

// Voz: Piper local con Daniela (es_AR). El subtítulo muestra el texto tal cual; a la voz se le aplica
// plantilla/pronunciacion.json (palabras en inglés que Daniela lee mal) y se le sacan los ** de acento.
const PIPER_VOICE = "es_AR-daniela-high";
function vozText(s) {
  const map = JSON.parse(readFileSync(join(HERE, "pronunciacion.json"), "utf8"));
  let out = String(s).replace(/\*\*/g, "");
  for (const [k, v] of Object.entries(map)) if (!k.startsWith("_")) out = out.replace(new RegExp(`(?<![\\p{L}])${k}(?![\\p{L}])`, "gu"), v);
  return out;
}
function tts(dir, spec, frames) {
  const request = { provider: "piper", speed: spec.voiceSpeed ?? 1.0, voice: PIPER_VOICE, lines: frames.map((f) => ({ id: f.id, text: vozText(f.vo) })) };
  const reqPath = join(dir, "audio_request.json");
  const prev = existsSync(reqPath) ? readFileSync(reqPath, "utf8") : "";
  const next = JSON.stringify(request, null, 2);
  if (prev === next && existsSync(join(dir, "audio_engine_meta.json")) && !has("--force-tts")) {
    console.log("· voz: sin cambios, se reutiliza");
    return true;
  }
  writeFileSync(reqPath, next);
  return sh(`python "${join(HERE, "piper-tts.py")}" audio_request.json audio_engine_meta.json`, dir).status === 0;
}

// Proyecto HyperFrames mínimo (para carpetas auxiliares _iconos, _kit, _identidad-*): mismos archivos que deja init.
function bareProject(dir, name) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true }, authoringSkill: "faceless-explainer" }, null, 2));
  writeFileSync(join(dir, "meta.json"), JSON.stringify({ id: name, name, createdAt: new Date().toISOString() }, null, 2));
  const v = HF.split("@").pop();
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, private: true, type: "module", scripts: { dev: `npx --yes hyperframes@${v} preview`, check: `npx --yes hyperframes@${v} check`, render: `npx --yes hyperframes@${v} render` } }, null, 2));
}

function snapshots(dir, b) {
  // un cuadro por escena, cuando ya apareció todo (antes del fundido de salida)
  const at = b.frames.map((f) => Math.min(f.start + f.dur - 0.4, f.start + Math.max(f.dur * 0.6, f.ready + 0.25)).toFixed(2)).join(",");
  rmSync(join(dir, "snapshots"), { recursive: true, force: true });
  sh(`${HF} snapshot --at ${at}`, dir);
}

// Miniatura de YouTube: una escena quieta (spec.miniatura) sin subtítulo, barra ni audio.
function miniatura(dir, slug, out = outPath(`${slug}.miniatura.png`), identidad) {
  const t = buildIndex(dir, { thumb: true, identidad, next: neighbours(slug).next });
  t.warnings.forEach((w) => console.log(`  ⚠ miniatura: ${w}`));
  const shots = join(t.dir, "snapshots");
  rmSync(shots, { recursive: true, force: true });
  const r = sh(`${HF} snapshot . --at ${t.at} --no-end --describe false`, t.dir);
  const png = existsSync(shots) && readdirSync(shots).find((f) => f.endsWith(".png"));
  if (r.status !== 0 || !png) return false;
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(join(shots, png), out);
  console.log(`✓ ${rel(out)} (escena ${t.escena})`);
  return true;
}

function mp4Duration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return r.status === 0 ? Number(r.stdout.trim()) : null;
}

export function checklist() {
  const csv = readCsv();
  const specs = Object.fromEntries(
    readdirSync(join(ROOT, "temas")).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => {
      const spec = JSON.parse(readFileSync(join(ROOT, "temas", f), "utf8"));
      return [spec.slug, { spec, file: join(ROOT, "temas", f) }];
    }),
  );
  const inCsv = new Set(csv.map((r) => r.clave));
  const items = [
    ...Object.keys(specs).filter((k) => !inCsv.has(k)).sort().map((k) => ({ slug: k, n: "—" })),
    ...csv.map((r, i) => ({ slug: r.clave, n: String(i + 1), row: r })),
  ];
  const ok = (b) => (b ? "✅" : "⬜");
  let done = 0, fichas = 0, yts = 0, subidos = 0, next = null;
  const rows = items.map(({ slug, n, row }) => {
    const s = specs[slug];
    const out = outPath(`${slug}.mp4`), subido = !!subidoPath(`${slug}.mp4`);
    const rendered = existsSync(out);
    const titulo = s?.spec.titulo || row?.titulo || slug;
    const nivel = s?.spec.nivel || row?.nivel || "";
    if (!s) {
      next ??= `${n} · ${titulo}`;
      return `| ${n} | ${titulo} | ${nivel} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — | — | ⬜ | ⬜ | ${row?.estado || ""} |`;
    }
    fichas++;
    const { spec, file } = s;
    const st = readStatus(join(ROOT, "videos", slug));
    const stale = rendered && (st.renderHash ? st.renderHash !== renderHash(spec) : statSync(file).mtimeMs > statSync(out).mtimeMs);
    const ytWarns = exportYoutube(spec);
    if (rendered) done++;
    if (subido) subidos++;
    if (ytWarns) yts++;
    const notas = [spec.notas, ...(ytWarns || []).map((w) => `⚠️ YouTube: ${w}`)].filter(Boolean).join(" · ");
    const dur = rendered ? `${mp4Duration(out)?.toFixed(1)} s` : st.duracion ? `(${st.duracion.toFixed(1)} s)` : "—";
    const mini = outPath(`${slug}.miniatura.png`);
    return `| ${n} | ${titulo} | ${nivel} | ✅ | ${ok(st.voz)} | ${ok(st.composicion)} | ${st.check == null ? "⬜" : st.check ? "✅" : "❌"} | ${rendered ? (stale ? "⚠️ desactualizado" : "✅") : "⬜"} | ${ytWarns ? `[${ytWarns.length ? "⚠️" : "✅"}](${rel(outPath(`${slug}.youtube.txt`))})` : "⬜"} | ${existsSync(mini) ? `[✅](${rel(mini)})` : "⬜"} | ${dur} | ${rendered ? `[${slug}.mp4](${rel(out)})` : "—"} | ${ok(spec.revisado)} | ${ok(subido)} | ${notas} |`;
  });
  const md = `# Checklist — Cripto desde cero

Generado automáticamente por \`node plantilla/make-video.mjs --checklist\` (no editar a mano).
La lista y su orden salen de \`temas/temas.csv\`; el estado, de \`temas/<clave>.json\`, \`videos/<clave>/.pipeline.json\` y \`salida/\`.
Para aprobar un video: \`"revisado": true\` en su JSON; las notas salen de \`"notas"\` (y de la columna estado del CSV si no hay ficha).
Subido = el .mp4 está en \`salida/subidos/\` (lo mueve el dueño del canal después de publicarlo). Identidad visual activa: \`${identidadActiva().id}\`.

**Renderizados:** ${done} / ${items.length} · **Fichas:** ${fichas} · **Descripción YouTube:** ${yts} · **Subidos:** ${subidos}${next ? ` · **Próximo:** ${next}` : ""}

| # | Tema | Nivel | Ficha | Voz | Composición | Check | Render | YouTube | Miniatura | Duración | Archivo | Revisado | Subido | Notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}

Leyenda: ✅ listo · ⬜ pendiente · ❌ falló · ⚠️ desactualizado = lo que se ve/escucha en la ficha cambió después del último render (volver a renderizar) · Duración entre paréntesis = estimada (todavía sin render).
`;
  writeFileSync(join(ROOT, "CHECKLIST.md"), md);
  console.log(`✓ CHECKLIST.md (${done}/${items.length} renderizados, ${fichas} fichas, ${yts} con descripción YouTube)`);
}

// Hoja de íconos: todos los de plantilla/iconos.mjs sobre su plato, con el nombre.
function iconSheet() {
  const dir = join(ROOT, "videos", "_iconos");
  bareProject(dir, "iconos");
  const ident = identidadActiva(opt("--identidad"));
  const cells = ICON_NAMES.map((n) => `<div class="c"><div class="plate" style="width:130px;height:130px">${icono(n)}</div><span>${n}</span></div>`).join("");
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><link href="${ident.fonts}" rel="stylesheet"><style>${ident.css}
${readFileSync(join(HERE, "styles.css"), "utf8")}
.grid{position:absolute;inset:40px;display:flex;flex-wrap:wrap;gap:22px 10px;align-content:flex-start}.c{width:160px;display:flex;flex-direction:column;align-items:center;gap:8px;font:800 24px var(--font-body);color:var(--ink)}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="1" data-width="1080" data-height="1920"><div id="bg" class="clip" data-start="0" data-duration="1" data-track-index="0"></div><div class="clip grid" data-start="0" data-duration="1" data-track-index="1">${cells}</div></div>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
  rmSync(join(dir, "snapshots"), { recursive: true, force: true });
  sh(`${HF} snapshot . --at 0.5 --no-end --describe false`, dir);
  console.log(`· íconos (${ICON_NAMES.length}): videos/_iconos/snapshots/`);
}

// Prueba de pronunciación: por cada palabra de plantilla/pronunciacion.json, la frase con la palabra tal cual y con el
// ajuste, una después de la otra → videos/_pronunciacion/<palabra>.wav y todas.wav (para escuchar y decidir).
function pronunciacion() {
  const dir = join(ROOT, "videos", "_pronunciacion");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const map = JSON.parse(readFileSync(join(HERE, "pronunciacion.json"), "utf8"));
  const words = Object.keys(map).filter((k) => !k.startsWith("_") && (!slug || k.toLowerCase() === slug.toLowerCase()));
  const lines = words.flatMap((w, i) => [
    { id: `${String(i).padStart(2, "0")}a`, text: `Tal cual: hoy hablamos de ${w}.` },
    { id: `${String(i).padStart(2, "0")}b`, text: `Ajustada: hoy hablamos de ${map[w]}.` },
  ]);
  writeFileSync(join(dir, "req.json"), JSON.stringify({ voice: PIPER_VOICE, speed: 1.0, lines }));
  if (sh(`python "${join(HERE, "piper-tts.py")}" req.json meta.json`, dir, false).status !== 0) throw new Error("piper falló");
  const list = [];
  words.forEach((w, i) => {
    const n = String(i).padStart(2, "0"), out = `${w.replace(/[^\w]/g, "_")}.wav`;
    spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `assets/voice/${n}a.wav`, "-i", `assets/voice/${n}b.wav`, "-filter_complex", "[0][1]concat=n=2:v=0:a=1", out], { cwd: dir });
    list.push(`file '${out}'`);
  });
  writeFileSync(join(dir, "lista.txt"), list.join("\n"));
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "lista.txt", "todas.wav"], { cwd: dir });
  console.log(`✓ videos/_pronunciacion/ — ${words.length} palabras (todas.wav + una por palabra: primero tal cual, después ajustada)`);
}

function main() {
  if (has("--checklist") && !slug) return checklist();
  if (has("--pronunciacion")) return pronunciacion();
  if (has("--iconos")) return iconSheet();
  if (has("--kit")) {
    // Demo de todos los kinds: sin voz (duración = min), para revisar el kit después de tocar plantilla/.
    const dir = join(ROOT, "videos", "_kit");
    if (!existsSync(join(dir, "hyperframes.json"))) bareProject(dir, "kit");
    copyFileSync(join(HERE, "kit-demo.json"), join(dir, "tema.json"));
    const b = buildIndex(dir, { identidad: opt("--identidad"), next: { titulo: "¿Qué es una billetera?" } });
    console.log(`✓ kit — ${b.frames.length} escenas (${b.frames.map((f) => f.kind).join(", ")}), ${b.total}s`);
    b.warnings.filter((w) => !w.includes("sin voz")).forEach((w) => console.log(`  ⚠ ${w}`));
    if (!has("--no-check")) sh(`${HF} check`, dir);
    snapshots(dir, b);
    return console.log("· contact sheet: videos/_kit/snapshots/contact-sheet.jpg");
  }
  if (!slug) {
    console.error("uso: node plantilla/make-video.mjs <slug> [--render | --miniatura | --info] | --checklist | --iconos | --kit");
    process.exit(1);
  }
  if (has("--info")) {
    const { row, prev, next } = neighbours(slug);
    if (!row) throw new Error(`${slug} no está en temas/temas.csv`);
    const specPath = join(ROOT, "temas", `${slug}.json`);
    return console.log(JSON.stringify({ ...row, anterior: prev ? `${prev.clave} — ${prev.titulo}` : null, siguiente: next ? `${next.clave} — ${next.titulo}` : null, ficha: existsSync(specPath) ? `temas/${slug}.json` : null }, null, 2));
  }
  const specPath = join(ROOT, "temas", `${slug}.json`);
  if (!existsSync(specPath)) throw new Error(`no existe ${specPath}`);
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const dir = join(ROOT, "videos", slug);
  const nextRow = neighbours(slug).next;

  if (has("--miniatura")) {
    copyFileSync(specPath, join(dir, "tema.json"));
    writeStatus(dir, { miniatura: miniatura(dir, slug) });
    return checklist();
  }
  if (opt("--identidad")) {
    // Comparar identidades: copia el proyecto (con la voz ya generada) y lo arma con otra identidad.
    const id = opt("--identidad"), alt = join(ROOT, "videos", `_identidad-${id}`);
    rmSync(alt, { recursive: true, force: true });
    bareProject(alt, `identidad-${id}`);
    copyFileSync(specPath, join(alt, "tema.json"));
    for (const f of ["audio_engine_meta.json"]) if (existsSync(join(dir, f))) copyFileSync(join(dir, f), join(alt, f));
    if (existsSync(join(dir, "assets", "voice"))) cpSync(join(dir, "assets", "voice"), join(alt, "assets", "voice"), { recursive: true });
    const b = buildIndex(alt, { identidad: id, next: nextRow });
    snapshots(alt, b);
    miniatura(alt, slug, join(alt, "miniatura.png"), id);
    return console.log(`· videos/_identidad-${id}/snapshots/contact-sheet.jpg y miniatura.png`);
  }

  if (!existsSync(join(dir, "hyperframes.json"))) {
    const r = sh(`${HF} init "videos/${slug}" --non-interactive --example=blank --skill=faceless-explainer`, ROOT);
    if (r.status !== 0) throw new Error("hyperframes init falló");
  }
  copyFileSync(specPath, join(dir, "tema.json"));
  copyFileSync(join(HERE, "identidad", `${identidadActiva().id}.frame.md`), join(dir, "frame.md"));
  const frames = spec.frames.map((f, i) => ({ ...f, id: f.id || String(i + 1).padStart(2, "0") }));
  writeDocs(dir, spec, frames);

  const vozOk = tts(dir, spec, frames);
  writeStatus(dir, { voz: vozOk });
  if (!vozOk) throw new Error("la generación de voz falló");

  const b = buildIndex(dir, { next: nextRow });
  console.log(`✓ index.html — ${b.frames.length} escenas, ${b.total}s, voces ${b.voices}, música ${b.music ? "sí" : "no"}, identidad ${b.identidad}`);
  b.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  writeStatus(dir, { composicion: true, duracion: b.total });

  if (!has("--no-check")) writeStatus(dir, { check: sh(`${HF} check`, dir).status === 0 });
  if (!has("--no-snapshot")) {
    snapshots(dir, b);
    console.log(`· contact sheet: videos/${slug}/snapshots/contact-sheet.jpg`);
  }
  writeStatus(dir, { miniatura: miniatura(dir, slug) });
  if (has("--render")) {
    const r = sh(`${HF} render --skill=faceless-explainer --quality high --output renders/video.mp4`, dir);
    if (r.status !== 0) throw new Error("render falló");
    mkdirSync(join(ROOT, "salida"), { recursive: true });
    copyFileSync(join(dir, "renders", "video.mp4"), outPath(`${slug}.mp4`));
    writeStatus(dir, { renderizado: today(), renderHash: renderHash(spec) });
    console.log(`✓ ${rel(outPath(`${slug}.mp4`))}`);
  }
  checklist();
}

main();
