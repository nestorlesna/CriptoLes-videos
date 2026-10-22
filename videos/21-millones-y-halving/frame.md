---
version: 1
name: Noche Dorada — Cripto desde cero (capa de video)
description: >
  Oscura pero cálida: azul noche con puntitos tenues, dorado como acento y menta de apoyo. Más "tech",
  sin caer en el neón agresivo de los canales de trading. Space Grotesk en títulos, Inter en el cuerpo.
  Tarjetas azul más claro con borde sutil, sin sombras.
unit: frame vertical 1080×1920 (Shorts) · 16:9 documentado abajo, todavía no implementado
principle: una idea por escena · el visual explica, el texto nombra · nada pisa el subtítulo

colors:
  bg: "#151A3B"          # azul noche
  bg-dots: "rgba(255,255,255,.08)"
  blob: "#1F2654"
  surface: "#222A5E"     # tarjetas
  ink: "#F6F4FF"         # texto (14:1 sobre bg)
  muted: "#AEB4DD"       # secundario (8:1)
  primary: "#FFC83D"     # dorado: acento, ticks, barra (texto dorado OK: 11:1)
  leaf: "#4FE0B6"        # menta de apoyo
  sky: "#6FA8FF"
  alert: "#FF6B6B"       # alertas (alert-ink #FF9A9A para texto)
  sub-bg: "#0B0E24"      # subtítulo casi negro con filete dorado

typography:
  display: { family: "Space Grotesk", weight: 700, use: "títulos, términos, VS" }
  body:    { family: "Inter", weight: 700–900 }
  ramp: igual que Pizarra Menta (headline 118px, subtítulo 42px, máx. 3 líneas)

components:
  card: "surface, borde 4px #3A4387, radio 22px, sin sombra"
  plate: "círculo claro (#F6F4FF) bajo cada ícono: los íconos tienen trazo oscuro"
  subtitle: "caja #0B0E24, filete dorado"

layout: idéntico a Pizarra Menta (texto arriba, visual al medio, subtítulo y 1600–1820, barra y 1858)
motion: idéntico a Pizarra Menta

do:
  - usar el dorado con moderación (título del hook, ticks, barra)
don't:
  - verde/rojo tipo "velas" de trading, gráficos de precios, cifras inventadas
---

# Noche Dorada

Se ve más "cripto" y luce muy bien en pantallas OLED, pero para un público que arranca de cero puede
sentirse más serio. Buena opción si el canal quiere parecer más moderno/tecnológico.
