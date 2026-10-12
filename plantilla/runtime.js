/* Runtime del kit de escenas de "Cripto desde cero".
 * window.__CR_CONFIG lo inyecta plantilla/build-index.mjs: { total, thumb, frames[{id,start,dur,last}], anims[{sel,t,fx,dur,…}] }.
 * Todo es un único timeline GSAP pausado (seek-safe): cada animación es un fromTo con estado inicial explícito y
 * immediateRender:false; los elementos que entran nacen con la clase .a-in (opacity 0).
 * fx: in/up (sube) · left/right (entra de costado) · pop (escala con rebote) · fade · draw (trazo SVG 0→1) · tick (check)
 *     shake (sacudón de alerta) · float (flota, con repeat finito) · tween (from/to explícitos) · out (desaparece)
 */
(function () {
  const C = window.__CR_CONFIG;
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  const IR = { immediateRender: false };
  const FX = {
    in: (a) => [{ opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: a.dur || 0.5, ease: "power3.out" }],
    up: (a) => [{ opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: a.dur || 0.5, ease: "power3.out" }],
    left: (a) => [{ opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: a.dur || 0.5, ease: "power3.out" }],
    right: (a) => [{ opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: a.dur || 0.5, ease: "power3.out" }],
    pop: (a) => [{ opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: a.dur || 0.5, ease: "back.out(1.8)" }],
    fade: (a) => [{ opacity: 0 }, { opacity: 1, duration: a.dur || 0.4, ease: "power1.out" }],
    draw: (a) => [{ strokeDasharray: "0 1" }, { strokeDasharray: "1 0", duration: a.dur || 0.6, ease: "power2.inOut" }],
    tick: (a) => [{ scale: 0 }, { scale: 1, duration: a.dur || 0.35, ease: "back.out(2)" }],
    out: (a) => [{ opacity: 1 }, { opacity: 0, duration: a.dur || 0.3, ease: "power1.in" }],
    tween: (a) => [Object.assign({}, a.from), Object.assign({}, a.to, { duration: a.dur || 0.6, ease: a.ease || "power2.inOut" })],
  };

  C.anims.forEach((a) => {
    if (a.fx === "shake") {
      // sacudón corto (alerta): rotación ida y vuelta, termina en 0
      [-8, 7, -5, 3, 0].forEach((r, i) => tl.to(a.sel, { rotation: r, duration: 0.09, ease: "sine.inOut", transformOrigin: "50% 80%" }, a.t + i * 0.09));
      return;
    }
    if (a.fx === "float") {
      tl.fromTo(a.sel, { y: 0 }, Object.assign({ y: -16, duration: a.dur, ease: "sine.inOut", yoyo: true, repeat: a.repeat }, IR), a.t);
      return;
    }
    const make = FX[a.fx] || FX.in;
    const [from, to] = make(a);
    if (a.fx !== "tween" && a.from) Object.assign(from, a.from);
    if (a.fx !== "tween" && a.to) Object.assign(to, a.to);
    tl.fromTo(a.sel, from, Object.assign(to, IR), a.t);
  });

  // Entradas/salidas de cada escena: texto, visual y subtítulo. La última escena queda quieta.
  C.frames.forEach((f) => {
    const txt = `#txt-${f.id} .inner`, vis = `#vis-${f.id} .vwrap`, sub = `#sub-${f.id} .inner`;
    tl.fromTo(txt, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, f.start + 0.05);
    if (!C.thumb) tl.fromTo(sub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, f.start + 0.15);
    if (!f.last) {
      tl.to(txt, { opacity: 0, duration: 0.3, ease: "power1.in" }, f.start + f.dur - 0.32);
      tl.to(vis, { opacity: 0, duration: 0.3, ease: "power1.in" }, f.start + f.dur - 0.32);
      tl.to(sub, { opacity: 0, duration: 0.25 }, f.start + f.dur - 0.28);
    }
  });
  tl.fromTo("#blob", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" }, 0.1);
  if (document.querySelector("#topbar")) tl.fromTo("#topbar .inner", { opacity: 0 }, { opacity: 1, duration: 0.4 }, C.frames[1].start + 0.1);
  if (document.querySelector("#progress-fill")) tl.fromTo("#progress-fill", { scaleX: 0 }, { scaleX: 1, duration: C.total, ease: "none" }, 0);

  // Si el contenido de una zona visual no entra (textos largos), se achica entero (--fit) en vez de pisar el subtítulo.
  const GROW = 1.3;
  function fit() {
    document.querySelectorAll(".visual").forEach((v) => {
      const w = v.querySelector(".vwrap"), prev = v.style.display;
      v.style.display = "block"; // medir aunque el clip esté oculto en este instante
      w.style.setProperty("--fit", 1);
      let need = 0, wide = 0;
      Array.from(w.children).forEach((c) => { if (c.tagName !== "STYLE") { need += c.offsetHeight; wide = Math.max(wide, c.offsetWidth); } });
      const kids = Array.from(w.children).filter((c) => c.tagName !== "STYLE" && getComputedStyle(c).display !== "none").length;
      need += Math.max(0, kids - 1) * 30;
      // achica si no entra; si sobra lugar agranda hasta GROW (se lee mejor en el celular), sin pasar 1040 px de ancho
      const k = need > 0 ? Math.min(GROW, (v.clientHeight - 40) / need, 1040 / Math.max(wide, 1)) : 1;
      w.style.setProperty("--fit", k.toFixed(3));
      v.style.display = prev;
    });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  window.__timelines["main"] = tl;
  tl.seek(0);
})();
