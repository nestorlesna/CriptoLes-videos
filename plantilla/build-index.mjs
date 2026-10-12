// Arma <proyecto>/index.html desde <proyecto>/tema.json + audio_engine_meta.json + plantilla/runtime.js.
// Uso: node plantilla/build-index.mjs videos/<slug>
// buildIndex(dir, { thumb: true }) arma en cambio <proyecto>/miniatura/index.html: una escena quieta (spec.miniatura.escena,
// default el hook) con el elemento principal agrandado, sin subtítulo, barra de progreso ni audio → miniatura de YouTube.
//
// Kit de escenas (frames[].kind): hook · concepto · analogia · flujo · comparacion · claves · alerta · glosario · cierre.
// Cada kind arma su HTML y una lista de animaciones con tiempos relativos a la escena (`at` de la ficha, `cue` = palabra
// de la voz, o repartidos cada STEP s). La duración de la escena = máx(min, voz + 1 s, última animación + 0,45 s);
// las animaciones "until: end" (flotar, la moneda que viaja por el flujo) se expanden DESPUÉS, con la duración real.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ICONOS, icono } from "./iconos.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const VO_LEAD = 0.25; // la voz arranca esto después de que abre la escena
const TAIL = 0.75; // aire después de la voz (VO_LEAD + TAIL = voz + 1 s)
const STEP = 1.3; // separación por defecto entre elementos de una lista
export const W = 1080, H = 1920, VIS_BOTTOM = 1560; // nada visual debajo de 1560: el subtítulo arranca en 1600
export const KINDS = ["hook", "concepto", "analogia", "flujo", "comparacion", "claves", "alerta", "glosario", "cierre"];
const BADGE = { concepto: "LA IDEA", analogia: "ES COMO…", flujo: "CÓMO FUNCIONA", comparacion: "COMPARÁ", claves: "CLAVES", alerta: "¡OJO!", glosario: "GLOSARIO", cierre: "EN RESUMEN" };

export function identidadActiva(override) {
  const id = override || process.env.IDENTIDAD || readFileSync(join(HERE, "identidad", "activa.txt"), "utf8").trim();
  const file = join(HERE, "identidad", `${id}.css`);
  if (!existsSync(file)) throw new Error(`identidad desconocida "${id}" (ver plantilla/identidad/)`);
  const css = readFileSync(file, "utf8");
  return { id, css, fonts: (css.match(/fonts:\s*(\S+)/) || [])[1] };
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// **negrita** dentro de un texto de la ficha → <b> (acento de color)
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const plain = (s) => String(s ?? "").replace(/\*\*/g, "");
const norm = (s) => plain(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const txt = (x) => (typeof x === "object" && x ? x.text ?? x.label ?? "" : x);
const TICK = `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="var(--plate)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Alto aproximado del bloque de texto (badge + head + sub) → la zona visual arranca debajo.
function textBottom(f, hero) {
  const lineH = hero ? 132 : 118;
  const subLines = f.sub ? Math.ceil(plain(f.sub).length / 34) : 0;
  return 150 + 58 + 24 + f.head.length * lineH + (subLines ? 20 + subLines * 56 : 0);
}

// ── Kit: cada kind devuelve { html, anims[], loops[] } con tiempos relativos a la escena ─────────────────────────────
function kit(f, ctx) {
  const anims = [], loops = [], warn = ctx.warn;
  let n = 0;
  const id = (p) => `${p}-${f.id}-${n++}`;
  const v = ctx.voice; // { duration_s } o undefined
  const at = (item, def) => {
    if (item && typeof item === "object") {
      if (item.at != null) return item.at;
      if (item.cue) {
        const i = norm(f.vo).indexOf(norm(item.cue));
        if (i < 0) warn(`frame ${f.id}: cue "${item.cue}" no aparece en la voz`);
        else if (v) return +(VO_LEAD + (v.duration_s * i) / norm(f.vo).length - 0.15).toFixed(2);
      }
    }
    return def;
  };
  const push = (sel, t, fx, extra = {}) => anims.push({ sel, at: +t.toFixed(3), fx, ...extra });
  const ico = (name) => {
    if (name && !ICONOS[name]) warn(`frame ${f.id}: ícono desconocido "${name}" (ver --iconos)`);
    return icono(name);
  };
  const plate = (name, size, cls = "", attrs = "") => `<div class="plate ${cls}" style="width:${size}px;height:${size}px"${attrs}>${ico(name)}</div>`;
  let html = "";

  switch (f.kind) {
    case "hook":
    case "concepto": {
      const hero = id("hero");
      const big = f.kind === "hook" ? 470 : 420;
      const orb = (f.orbita || []).slice(0, 6);
      // órbita: íconos chicos alrededor del principal
      const spots = [[-40, -10], [big - 110, -30], [-70, big - 170], [big - 80, big - 150], [big / 2 - 75, -90], [big / 2 - 75, big - 60]];
      const orbHtml = orb.map((o, i) => {
        const oid = id("orb");
        push(`#${oid}`, at(o, 1.0 + i * 0.35), "pop");
        return `<div id="${oid}" class="orb a-in" style="left:${spots[i][0]}px;top:${spots[i][1]}px">${plate(txt(o) || o.icono, 150)}</div>`;
      }).join("");
      html += `<div class="hero-ico keep" style="width:${big}px;height:${big}px"><div id="${hero}" class="plate a-in" style="position:absolute;inset:0;border-width:8px">${ico(f.icono)}</div>${orbHtml}</div>`;
      push(`#${hero}`, at(f.iconoAt != null ? { at: f.iconoAt } : null, 0.35), "pop");
      loops.push({ sel: `#${hero}`, at: 1.2, fx: "float" });
      const chips = f.etiquetas || [];
      if (chips.length) {
        html += `<div class="chips-row">${chips.map((c, i) => {
          const cid = id("chip");
          push(`#${cid}`, at(c, 1.6 + i * STEP), "up");
          return `<div id="${cid}" class="chip a-in">${rich(txt(c))}</div>`;
        }).join("")}</div>`;
      }
      break;
    }
    case "analogia": {
      const a = f.a || {}, b = f.b || {};
      const cA = id("ana"), cB = id("ana"), mid = id("mid"), con = id("con");
      html += `<div id="${con}" class="ana-conn a-in">${esc(f.conector ?? "es como")}</div>
        <div class="ana keep">
          <div id="${cA}" class="ana-card card a-in">${plate(a.icono, 230)}<div class="lbl">${rich(a.label)}</div></div>
          <div id="${mid}" class="ana-mid a-in">${esc(f.simbolo ?? "=")}</div>
          <div id="${cB}" class="ana-card card a-in">${plate(b.icono, 230)}<div class="lbl">${rich(b.label)}</div></div>
        </div>`;
      push(`#${con}`, 0.3, "fade");
      push(`#${cA}`, at(a, 0.6), "left");
      push(`#${mid}`, at(f.simboloAt != null ? { at: f.simboloAt } : null, at(a, 0.6) + 1.3), "pop");
      push(`#${cB}`, at(b, at(a, 0.6) + 2.0), "right");
      if (f.nota) {
        const nid = id("nota");
        push(`#${nid}`, at(f.nota, at(b, 2.6) + 1.3), "up");
        html += `<div id="${nid}" class="tip card a-in">${icono("foco")}<span>${rich(txt(f.nota))}</span></div>`;
      }
      break;
    }
    case "flujo": {
      const nodos = f.nodos || [];
      if (nodos.length > 4) warn(`frame ${f.id}: flujo con ${nodos.length} nodos (máx. 4)`);
      const Hn = nodos.length <= 3 ? 172 : 150, G = nodos.length <= 3 ? 92 : 66, p = Hn - 36;
      const cx = 5 + 18 + p / 2, total = nodos.length * Hn + (nodos.length - 1) * G;
      const top = (i) => i * (Hn + G);
      const times = nodos.map((nd, i) => at(nd, 0.6 + i * STEP));
      let arrows = "";
      const nodeHtml = nodos.map((nd, i) => {
        const nid = id("node");
        push(`#${nid}`, times[i], "left");
        if (i > 0) {
          const aid = id("arr"), y1 = top(i - 1) + Hn + 10, y2 = top(i) - 14;
          arrows += `<path id="${aid}" d="M ${cx} ${y1} L ${cx} ${y2}" pathLength="1" fill="none" stroke="var(--primary)" stroke-width="12" stroke-linecap="round" stroke-dasharray="0 1"/>`;
          arrows += `<path id="${aid}h" class="a-in" d="M ${cx - 20} ${y2 - 16} L ${cx} ${y2 + 4} L ${cx + 20} ${y2 - 16}" fill="none" stroke="var(--primary)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
          push(`#${aid}`, Math.max(times[i] - 0.55, times[i - 1] + 0.3), "draw", { dur: 0.45 });
          push(`#${aid}h`, Math.max(times[i] - 0.15, times[i - 1] + 0.7), "fade", { dur: 0.15 });
        }
        return `<div id="${nid}" class="node card a-in" style="top:${top(i)}px;height:${Hn}px">${plate(nd.icono, p, "", ' style="border-width:5px"')}<div class="lbl">${rich(nd.label)}${nd.detalle ? `<small>${rich(nd.detalle)}</small>` : ""}</div></div>`;
      }).join("");
      let token = "";
      if (f.token && nodos.length > 1) {
        const tk = typeof f.token === "string" ? { icono: f.token } : f.token;
        const tid = id("token"), S = 88;
        const tx = cx + p * 0.32 - S / 2, ty = (i) => top(i) + Hn / 2 + p * 0.22 - S / 2;
        token = `<div id="${tid}" class="token a-in" style="left:${tx}px;top:${ty(0)}px">${ico(tk.icono || "moneda")}</div>`;
        const start = at(tk, times[times.length - 1] + 0.8);
        // un viaje: aparece en el primer nodo, baja nodo por nodo y se desvanece en el último
        const trip = (t0) => {
          const out = [{ sel: `#${tid}`, at: t0, fx: "pop", dur: 0.3, from: { y: 0 }, to: { y: 0 } }];
          let t = t0 + 0.4;
          for (let i = 1; i < nodos.length; i++) {
            out.push({ sel: `#${tid}`, at: +t.toFixed(3), fx: "tween", dur: 0.7, from: { y: ty(i - 1) - ty(0) }, to: { y: ty(i) - ty(0) }, ease: "power2.inOut" });
            t += 0.7 + 0.35;
          }
          out.push({ sel: `#${tid}`, at: +t.toFixed(3), fx: "out", dur: 0.25 });
          return { out, end: t + 0.25 };
        };
        if (tk.until === "end") loops.push({ fx: "trip", at: start, trip, gap: 0.35 });
        else trip(start).out.forEach((a) => anims.push(a));
      }
      html += `<div class="flow keep" style="height:${total}px">${nodeHtml}<svg class="arr" width="880" height="${total}" viewBox="0 0 880 ${total}" style="left:0;top:0">${arrows}</svg>${token}</div>`;
      break;
    }
    case "comparacion": {
      const a = f.a || {}, b = f.b || {};
      const ca = id("col"), cb = id("col"), vs = id("vs");
      const items = (side, list) => list.map((it) => `<li id="${id("ci")}" class="a-in" data-side="${side}">${rich(txt(it))}</li>`);
      const la = items("a", a.items || []), lb = items("b", b.items || []);
      html += `<div class="cmp keep">
          <div id="${ca}" class="cmp-col a card a-in"><div class="cmp-head">${plate(a.icono, 110, "", ' style="border-width:5px"')}<div class="t">${rich(a.titulo)}</div></div><ul class="cmp-items">${la.join("")}</ul></div>
          <div id="${vs}" class="vs a-in">VS</div>
          <div id="${cb}" class="cmp-col b card a-in"><div class="cmp-head">${plate(b.icono, 110, "", ' style="border-width:5px"')}<div class="t">${rich(b.titulo)}</div></div><ul class="cmp-items">${lb.join("")}</ul></div>
        </div>`;
      push(`#${ca}`, at(a, 0.5), "left");
      push(`#${cb}`, at(b, 1.0), "right");
      push(`#${vs}`, 1.5, "pop");
      // ítems intercalados: a0, b0, a1, b1… (como suele decirlo la voz)
      let t = 2.1;
      const ids = (s) => s.map((h) => h.match(/id="([^"]+)"/)[1]);
      const ia = ids(la), ib = ids(lb);
      for (let i = 0; i < Math.max(ia.length, ib.length); i++) {
        if (ia[i]) { push(`#${ia[i]}`, at((a.items || [])[i], t), "up"); t += STEP; }
        if (ib[i]) { push(`#${ib[i]}`, at((b.items || [])[i], t), "up"); t += STEP; }
      }
      break;
    }
    case "claves":
    case "cierre": {
      const list = f.kind === "claves" ? f.items || [] : f.resumen || [];
      const small = f.kind === "cierre";
      const lid = id("keys");
      html += `<ul id="${lid}" class="keys${small ? " small" : ""} keep">${list.map((k, i) => {
        const kid = id("key");
        const t = at(k, (small ? 0.5 : 1.0) + i * (small ? 1.0 : STEP));
        push(`#${kid}`, t, "left");
        push(`#${kid} .tick`, t + 0.2, "tick");
        return `<li id="${kid}" class="card a-in"><span class="tick">${TICK}</span><span>${rich(txt(k))}</span></li>`;
      }).join("")}</ul>`;
      if (small) {
        const nid = id("next");
        const tnext = at(f.proximoAt != null ? { at: f.proximoAt } : null, 0.5 + list.length * 1.0 + 0.4);
        const prox = f.proximo ?? ctx.next?.titulo;
        if (prox) {
          push(`#${nid}`, tnext, "up");
          html += `<div id="${nid}" class="next-card a-in">${icono("play")}<div><div class="k">EN EL PRÓXIMO VIDEO</div><div class="t">${esc(prox)}</div></div></div>`;
        } else warn(`frame ${f.id}: cierre sin "proximo" (no hay tema siguiente en temas.csv)`);
      }
      break;
    }
    case "alerta": {
      const tri = id("tri"), card = id("acard");
      html += `<svg id="${tri}" class="alert-ico a-in" viewBox="0 0 120 120">${ICONOS[f.icono || "alerta"] || ICONOS.alerta}</svg>`;
      push(`#${tri}`, 0.35, "pop");
      push(`#${tri}`, 0.95, "shake");
      const items = (f.items || []).map((it, i) => {
        const iid = id("ai");
        push(`#${iid}`, at(it, 1.6 + i * STEP), "left");
        return `<div id="${iid}" class="it a-in">${icono("cruz")}<span>${rich(txt(it))}</span></div>`;
      });
      html += `<div id="${card}" class="alert-card a-in keep">${f.titulo ? `<div class="t">${rich(f.titulo)}</div>` : ""}${items.join("")}</div>`;
      push(`#${card}`, 0.9, "up");
      if (f.consejo) {
        const cid = id("tip");
        push(`#${cid}`, at(f.consejo, 1.6 + items.length * STEP + 0.2), "up");
        html += `<div id="${cid}" class="tip card a-in">${icono("escudo")}<span>${rich(txt(f.consejo))}</span></div>`;
      }
      break;
    }
    case "glosario": {
      const terms = f.terminos || [{ termino: f.termino, definicion: f.definicion, icono: f.icono }];
      if (terms.length > 3) warn(`frame ${f.id}: glosario con ${terms.length} términos (máx. 3)`);
      html += `<div class="glos keep">${terms.map((g, i) => {
        const gid = id("g");
        push(`#${gid}`, at(g, 0.6 + i * 1.6), "up");
        return `<div id="${gid}" class="gcard card a-in">${plate(g.icono || "libro", 130, "", ' style="border-width:5px"')}<div class="gtxt"><div class="gterm">${rich(g.termino)}</div><div class="gdef">${rich(g.definicion)}</div></div></div>`;
      }).join("")}</div>`;
      break;
    }
    default:
      throw new Error(`frame ${f.id}: kind desconocido "${f.kind}" (${KINDS.join(", ")})`);
  }
  return { html, anims, loops };
}

// Expande los loops "hasta el final de la escena" con la duración ya medida.
function expandLoops(loops, dur) {
  const out = [];
  for (const l of loops) {
    if (l.fx === "float") {
      const half = 1.3, reps = Math.floor((dur - 0.4 - l.at) / half) - 1;
      if (reps >= 1) out.push({ sel: l.sel, at: l.at, fx: "float", dur: half, repeat: reps });
    } else if (l.fx === "trip") {
      let t = l.at;
      for (;;) {
        const { out: tw, end } = l.trip(t);
        if (end > dur - 0.2) break;
        out.push(...tw);
        t = end + l.gap;
      }
    }
  }
  return out;
}

export const THUMB_MIN = 2.6;

export function buildIndex(projectDir, { thumb = false, identidad, next } = {}) {
  const P = resolve(projectDir);
  const spec = JSON.parse(readFileSync(join(P, "tema.json"), "utf8"));
  const metaPath = join(P, "audio_engine_meta.json");
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : { voices: [] };
  const voice = Object.fromEntries((meta.voices || []).map((v) => [v.id, v]));
  const warnings = [];
  const warn = (w) => warnings.push(w);
  const ident = identidadActiva(identidad);
  const mini = spec.miniatura || {};

  let frames = spec.frames.map((f, i) => ({ ...f, id: f.id || String(i + 1).padStart(2, "0"), kind: f.kind || "concepto", head: f.head || [] }));
  if (thumb) {
    const e = mini.escena;
    const pick = typeof e === "number" ? frames[e - 1] : frames.find((f) => f.id === e || f.kind === (e || "hook")) || frames[0];
    frames = [{ ...pick, head: mini.head || pick.head, sub: mini.sub ?? pick.sub }];
  }

  // 1) HTML + animaciones por escena, 2) duraciones, 3) loops "until end"
  let t = 0;
  for (const f of frames) {
    const v = thumb ? undefined : voice[f.id];
    if (!v && !thumb) warn(`frame ${f.id}: sin voz generada`);
    if (!thumb && plain(f.vo).length > 125) warn(`frame ${f.id}: la voz tiene ${plain(f.vo).length} caracteres: puede pasar a 4 líneas de subtítulo, revisalo en el contact sheet`);
    f.head.forEach((h) => h.length > 17 && warn(`frame ${f.id}: línea de título larga "${h}" (máx. ~16)`));
    const k = kit(f, { voice: v, warn, next });
    f.html = k.html;
    f.anims = k.anims;
    f.loops = thumb ? [] : k.loops;
    const ends = f.anims.map((a) => a.at + (a.dur ?? 0.5));
    const lastAct = ends.length ? Math.max(...ends) : 0;
    const need = thumb
      ? Math.max(THUMB_MIN, lastAct + 0.6) + 0.4
      : Math.max(f.min || 4, v ? VO_LEAD + v.duration_s + TAIL : 0, lastAct + 0.45);
    f.start = +t.toFixed(3);
    f.dur = +need.toFixed(3);
    f.ready = +lastAct.toFixed(3);
    f.vTop = Math.max(textBottom(f, f.kind === "hook") + 40, 520);
    if (VIS_BOTTOM - f.vTop < 380) warn(`frame ${f.id}: poco lugar para el visual (${VIS_BOTTOM - f.vTop}px): acortá el título o la bajada`);
    t += f.dur;
  }
  const total = +t.toFixed(3);
  frames.forEach((f) => f.anims.push(...expandLoops(f.loops, f.dur)));
  const last = frames[frames.length - 1];

  // Animaciones con tiempos absolutos para el runtime
  const anims = [];
  frames.forEach((f) => f.anims.forEach((a) => anims.push({ ...a, t: +(f.start + a.at).toFixed(3), at: undefined })));
  anims.sort((a, b) => a.t - b.t);

  const clip = (id, f, cls, inner, track, style = "", innerAttrs = "") =>
    `<div id="${id}" class="clip ${cls}" data-start="${f.start}" data-duration="${f.dur}" data-track-index="${track}"${style ? ` style="${style}"` : ""}><div class="inner"${innerAttrs}>${inner}</div></div>`;

  const nivel = spec.nivel || "";
  const textBlocks = frames.map((f) => {
    const hero = f.kind === "hook";
    const badge = f.badge ?? (hero ? `CRIPTO DESDE CERO${nivel ? ` · ${nivel}` : ""}` : BADGE[f.kind]);
    const head = f.head.map((h) => `<span class="hl">${esc(h)}</span>`).join("");
    let inner = `<div class="badge${f.kind === "alerta" ? " alert" : ""}">${esc(badge)}</div><h1 class="headline${hero ? " hero" : ""}">${head}</h1>`;
    if (f.sub) inner += `<p class="subline">${rich(f.sub)}</p>`;
    return clip(`txt-${f.id}`, f, "scene-text", inner, 3);
  });
  const zoom = thumb ? mini.zoom ?? 1 : 1, dy = thumb ? mini.dy ?? 0 : 0;
  const visuals = frames.map((f) => {
    const keepOnly = thumb && mini.elemento ? `<style>#vis-${f.id} .vwrap > :not(.${mini.elemento}) { display: none; }</style>` : "";
    return `<div id="vis-${f.id}" class="clip visual" data-start="${f.start}" data-duration="${f.dur}" data-track-index="2" style="top:${f.vTop}px;height:${VIS_BOTTOM - f.vTop}px">${keepOnly}<div class="vwrap" style="--zoom:${zoom};--dy:${dy}px">${f.html}</div></div>`;
  });
  const subs = thumb ? [] : frames.map((f) => clip(`sub-${f.id}`, f, "subtitle", `<p>${esc(plain(f.vo))}</p>`, 5));
  const audio = thumb ? [] : frames.filter((f) => voice[f.id]).map((f) =>
    `<audio id="vo-${f.id}" src="${voice[f.id].path}" data-start="${+(f.start + VO_LEAD).toFixed(3)}" data-duration="${voice[f.id].duration_s}" data-track-index="10" data-volume="1"></audio>`);

  // Cama musical compartida (plantilla/musica/bgm-base.wav) recortada al largo del video, con fade in/out por automation.
  let bgm = "";
  const bed = join(HERE, "musica", "bgm-base.wav");
  if (!thumb && spec.music !== false && existsSync(bed)) {
    mkdirSync(join(P, "assets", "bgm"), { recursive: true });
    const out = join(P, "assets", "bgm", "track-long.wav");
    const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", bed, "-t", String(total + 1), out]);
    if (r.status === 0) {
      const vol = spec.musicVolume ?? 0.18;
      bgm = `<audio id="bgm" src="assets/bgm/track-long.wav" data-start="0" data-duration="${total}" data-track-index="11" data-volume="${vol}" data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0},{"t":1.2,"v":${vol}},{"t":${+(total - 2).toFixed(2)},"v":${vol}},{"t":${total},"v":0}]}]}'></audio>`;
    } else warn("ffmpeg falló al preparar la música");
  }

  const f2 = frames[1];
  const config = {
    total, thumb,
    frames: frames.map((f) => ({ id: f.id, start: f.start, dur: f.dur, last: f === last })),
    anims,
  };
  const runtime = readFileSync(join(HERE, "runtime.js"), "utf8");
  const css = readFileSync(join(HERE, "styles.css"), "utf8");
  const brand = icono("moneda", "brand-ico");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="${ident.fonts}" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
${ident.css}
${css}
    </style>
  </head>
  <body>
    <!-- GENERADO por plantilla/build-index.mjs desde tema.json (identidad ${ident.id}) — no editar a mano -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
      <div id="bg" class="clip" data-start="0" data-duration="${total}" data-track-index="0"><div id="blob"></div></div>
      ${thumb || !f2 ? "" : `<div id="topbar" class="clip" data-start="${f2.start}" data-duration="${+(total - f2.start).toFixed(3)}" data-track-index="4"><div class="inner"><span class="brand">${brand}CRIPTO DESDE CERO</span><span class="lvl">${esc(nivel.toUpperCase())}</span></div></div>`}
      ${textBlocks.join("\n      ")}
      ${visuals.join("\n      ")}
      ${subs.join("\n      ")}
      ${thumb ? "" : `<div id="progress" class="clip" data-start="0" data-duration="${total}" data-track-index="6"><div id="progress-fill"></div></div>`}
      ${audio.join("\n      ")}
      ${bgm}
    </div>
    <script>
      window.__CR_CONFIG = ${JSON.stringify(config)};
${runtime}
    </script>
  </body>
</html>
`;
  if (thumb) {
    const T = join(P, "miniatura");
    mkdirSync(T, { recursive: true });
    for (const f of ["hyperframes.json", "meta.json", "package.json"]) if (existsSync(join(P, f))) writeFileSync(join(T, f), readFileSync(join(P, f)));
    writeFileSync(join(T, "index.html"), html);
    return { dir: T, at: +(total - 0.4).toFixed(2), escena: frames[0].id, warnings };
  }
  writeFileSync(join(P, "index.html"), html);
  return { total, frames: frames.map((f) => ({ id: f.id, kind: f.kind, start: f.start, dur: f.dur, ready: f.ready })), warnings, voices: Object.keys(voice).length, music: !!bgm, identidad: ident.id };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("uso: node plantilla/build-index.mjs videos/<slug>");
    process.exit(1);
  }
  const r = buildIndex(dir);
  console.log(`✓ index.html — ${r.frames.length} escenas, ${r.total}s, voces ${r.voices}, música ${r.music ? "sí" : "no"}`);
  r.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
