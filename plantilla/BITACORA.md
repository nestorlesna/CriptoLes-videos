# Bitácora de producción

Problemas encontrados al generar videos, cómo se resolvieron y qué conviene hacer la próxima vez.
**Leer antes de arrancar un tema nuevo y sumar una entrada cada vez que algo falle o se mejore.**

## Flujo que funciona (2026-10-12, heredado de VidesoEjercicios + primer video)

1. `node plantilla/make-video.mjs <slug> --info` → fila del CSV, tema anterior y siguiente.
2. Escribir `temas/<slug>.json`: guion de voz por escenas (una idea por video, términos definidos la primera vez, voseo,
   ~110–130 caracteres por escena) → visuales con el kit → `youtube` (usar `{{DESLINDE}}` y `{{SIGUIENTE}}`, así no hay
   que pegar ni escapar el deslinde) → `miniatura`.
   Ojo: en Git Bash de Windows dos heredocs seguidos en un mismo comando pueden romperse → un heredoc por comando, o
   escribir el archivo con la herramienta de escritura / un script.
3. `make-video <slug>` → mirar `videos/<slug>/snapshots/contact-sheet.jpg` y los `⚠` del builder. Corregir lo que se pisa
   o queda chico.
4. `--render` **en segundo plano** (~2–3 min). Mientras renderiza, preparar la ficha del próximo tema.
5. Resumen corto al dueño del canal. Cuando aprueba: `"revisado": true` + `--checklist`. Los publicados los mueve él a `salida/subidos/`.

## Problemas y soluciones

| Fecha | Tema | Problema | Solución / regla |
|---|---|---|---|
| 10-11 | (heredado) | En Git Bash dos heredocs en un mismo comando se rompen | un heredoc por comando o escribir el script a un archivo |
| 10-11 | (heredado) | Cambiar la descripción de YouTube marcaba el video como desactualizado | `contentHash` ignora `youtube`, `miniatura`, `notas`, `revisado` |
| 10-11 | (heredado) | Piper/Kokoro no dan tiempos por palabra | elementos por `at`, `cue` (posición estimada en el texto) o cada ~1,3 s |
| 10-11 | (heredado) | Animaciones "hasta el final" alargaban la escena | `until: "end"` se expande **después** de medir la voz |
| 10-11 | (heredado) | Labels cerca del piso pisaban el subtítulo | zona visual hasta y = 1560; subtítulo desde 1600; nada en el medio |
| 10-12 | (heredado) | Voz de 4 líneas desborda el subtítulo | máx. 3 líneas por `vo` (ver entrada de plata-en-el-banco: ideal ≤ 120) |
| 10-12 | (heredado) | Kokoro robótico, Edge TTS 403 | Piper + Daniela es_AR (aprobada), crédito CC BY-SA automático |
| 10-12 | (heredado) | Render bloqueaba el trabajo | `--render` en segundo plano y preparar el próximo mientras tanto |
| 10-12 | (kit) | El registry de HyperFrames no tiene un set de íconos inline reutilizable (sí primitivas: trazo dibujado, check) | íconos propios en `iconos.mjs`; las primitivas se reprodujeron inline (draw, tick, pop) |
| 10-12 | (kit) | Con mucho lugar libre los visuales quedaban chicos para el celular | auto-ajuste `--fit`: achica si no entra, agranda hasta 1,3× si sobra (sin pasar 1040 px de ancho) |
| 10-12 | (kit) | Con textos largos el visual pisaría el subtítulo | la zona visual se calcula según el alto del título/bajada y el contenido se achica solo |
| 10-12 | que-es-el-dinero | Comparación: columnas de ~480 px con letra 36 se leían chico | ítems 42 px, títulos 52 px; máx. 3 ítems cortos por lado |
| 10-12 | (snapshot) | `hyperframes snapshot` agrega un cuadro "end-of-timeline" con un tiempo propio (menor al total) | ignorarlo: el total real es `data-duration`; el último snapshot por escena es el que vale |
| 10-12 | (identidad) | El dueño eligió la identidad B "Noche Dorada" | `activa.txt` = `b-noche-dorada`; el render guarda la identidad (`renderHash`) → cambiarla marca los videos como desactualizados |
| 10-12 | (voz) | Daniela lee mal palabras en inglés (Bitcoin, blockchain…) y no hay forma automática de verificarlo (Whisper en español = modelo de 3 GB) | `--pronunciacion` genera audios "tal cual / ajustada" en `videos/_pronunciacion/` para que el dueño escuche y elija |
| 10-12 | plata-en-el-banco, inflación | Con Inter 42 px, voces de 127–133 caracteres pasaron a 4 líneas y tocaron la barra de progreso | ideal ≤ ~120 caracteres; el builder avisa > 125 (revisar en el contact sheet) |
| 10-12 | que-es-una-criptomoneda | Comillas rectas en el título: Space Grotesk dibuja la de apertura como de cierre (”cripto”) | evitar comillas en `head`; en textos de cuerpo (Inter) se ven bien |
| 10-12 | (ícono bitcoin) | ₿ blanco sobre naranja = contraste 2,3:1 en el check | ₿ en color tinta (`--line`) |
| 10-12 | (5 videos) | Producir varios seguidos | escribir las fichas → un loop `make-video` sin render para revisar todos los contact sheets → corregir → loop con `--render` en segundo plano |
| 10-12 | (voz) | Pronunciación probada por el dueño: todas las del ajuste OK salvo Ethereum ("Ezérium") | Ethereum → "Etérium" (elegida entre 6 variantes) |

## Pendientes / ideas

- Palabras nuevas en inglés: sumarlas a `pronunciacion.json` y pasarle el audio de `--pronunciacion <palabra>` al dueño antes de renderizar.
- Versión 16:9: tokens listos, falta el layout (texto a la izquierda, visual a la derecha).
- Kind posible a futuro: "números" (un dato verificable grande, ej. 21.000.000) y "línea de tiempo" (2008 → 2009 → hoy).
