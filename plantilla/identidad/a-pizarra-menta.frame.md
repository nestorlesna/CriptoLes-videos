---
version: 1
name: Pizarra Menta — Cripto desde cero (capa de video)
description: >
  Clara y amigable, como un cuaderno de clase: papel cálido con puntitos, tinta azul marino, menta como
  acento y dorado reservado para "la moneda". Tipografía redondeada (Fredoka) que no intimida y cuerpo
  Nunito muy legible en el celular. Tarjetas blancas con borde de tinta y sombra plana corta.
unit: frame vertical 1080×1920 (Shorts) · 16:9 documentado abajo, todavía no implementado
principle: una idea por escena · el visual explica, el texto nombra · nada pisa el subtítulo

colors:
  bg: "#FBF7EE"          # papel cálido (fondo)
  bg-dots: "rgba(27,35,64,.10)"  # grilla de puntos de cuaderno
  blob: "#E3F6EE"        # mancha menta suave detrás del visual
  ink: "#1B2340"         # texto y trazos (contraste 14:1 sobre bg)
  muted: "#586079"       # textos secundarios (6,3:1)
  primary: "#19C39A"     # menta: rellenos, ticks, barra de progreso (nunca texto chico)
  primary-strong: "#0A7A5E"  # menta oscura para texto acentuado (5,1:1)
  gold: "#FFC23D"        # la moneda / el valor
  sky: "#7FB2FF"         # apoyo en diagramas
  alert: "#F0564A"       # alertas, estafas (con alert-soft de fondo y alert-ink para texto)
  sub-bg: "#1B2340"      # subtítulo: caja tinta con texto blanco y filete menta

typography:
  display: { family: "Fredoka", weight: 600, use: "títulos (head), términos, VS, números" }
  body:    { family: "Nunito",  weight: 700–900, use: "subtítulo, listas, etiquetas, bajadas" }
  ramp (1080×1920):
    headline: 118px / 1.0  (hook 132px) — máx. ~16 caracteres por línea, 1–3 líneas
    subline:  46px / 800, primary-strong
    item:     46px / 800
    label:    38px / 800
    subtitle: 42px / 800, line-height 1.3, máx. 3 líneas (~130 caracteres)
    badge:    28px / 900, tracking 4px, mayúsculas

components:
  badge: "pastilla tinta, texto blanco, radio total"
  card: "blanco, borde 5px tinta, radio 28px, sombra plana 0 10px 0 tinta 12%"
  plate: "círculo blanco con borde tinta donde se apoya cada ícono"
  tick: "cuadrado menta radio 16 con check blanco dibujado"
  subtitle: "caja tinta radio 24, filete izquierdo menta 12px, y 1600–1820"
  progress: "barra menta 12px en y 1858"
  topbar: "moneda chica + CRIPTO DESDE CERO (tinta) · NIVEL N (menta oscura)"

layout (1080×1920):
  topbar: y 64–112 (desde la 2.ª escena)
  texto: x 70–1010, y 150 → hasta donde llegue (badge + head + sub)
  visual: desde el final del texto + 40 hasta y 1560 (el builder calcula la zona)
  subtítulo: y 1600–1820 · barra: y 1858 → nada por debajo de y 1580 salvo subtítulo y barra

motion:
  entrada: "sube 30px + fade 0,5 s power3.out"; íconos "pop" (back.out); flechas se dibujan (stroke 0→1)
  ritmo: un elemento nuevo cada ~1,3 s si la voz no marca otra cosa (`at`)
  salida: fade 0,3 s al final de cada escena (la última queda quieta)

do:
  - fondos claros, contraste alto, mucho aire
  - un solo acento por escena (menta), dorado solo para dinero/valor, rojo solo para riesgo
don't:
  - gráficos de precios reales, logos de marcas reales, cifras inventadas
  - texto menta claro sobre papel (no se lee): usar primary-strong

16:9 (futuro): mismos tokens; texto a la izquierda (x 90–900), visual a la derecha (x 980–1830), subtítulo y 880–1010.
---

# Pizarra Menta

Pensada para alguien que nunca leyó nada de cripto: parece un cuaderno, no una pantalla de trading.
El menta transmite "tranquilo, esto se entiende" y el dorado queda reservado para la plata, así el ojo
aprende rápido qué es valor. El rojo aparece solo en alertas de estafas y riesgos.
