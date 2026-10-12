# Plantilla — Cripto desde cero

> Antes de empezar un tema nuevo leé también **`plantilla/BITACORA.md`** (problemas ya resueltos y flujo que funciona).

Canal de YouTube que explica criptomonedas a gente que no sabe nada del tema. Arranca por lo más básico (qué es el dinero)
y la complejidad sube de a poco. Un video = una ficha JSON en `temas/<slug>.json`. Todo lo demás se genera.

```
temas/temas.csv             ← lista maestra en orden de producción (clave;titulo;nivel;descripcion;estado)
temas/<slug>.json           ← ficha del video (lo único que se escribe a mano)
plantilla/                  ← builder, runtime, estilos, identidad visual, íconos, piper-tts.py, música, deslinde
videos/<slug>/              ← proyecto HyperFrames generado (index.html, voz, snapshots, render) — no se edita a mano
salida/<slug>.mp4           ← video final
salida/<slug>.youtube.txt   ← TÍTULO / DESCRIPCIÓN / TAGS para pegar en YouTube Studio (autogenerado)
salida/<slug>.miniatura.png ← miniatura 1080×1920 (autogenerada)
salida/subidos/             ← los ya publicados (los mueve a mano el dueño del canal; el CHECKLIST los marca como Subido)
CHECKLIST.md                ← estado de toda la lista (autogenerado)
```

## Comandos (desde la raíz `VideosCripto/`)

| Comando | Qué hace |
|---|---|
| `node plantilla/make-video.mjs <slug> --info` | fila del CSV + tema anterior y siguiente (el cierre conecta con el siguiente) |
| `node plantilla/make-video.mjs <slug>` | init si hace falta → voz (solo si cambió el texto) → `index.html` → `hyperframes check` → snapshots (`videos/<slug>/snapshots/contact-sheet.jpg`) → miniatura |
| `node plantilla/make-video.mjs <slug> --render` | lo anterior + render calidad alta → `salida/<slug>.mp4` (**correrlo en segundo plano**, ~2–3 min) |
| `node plantilla/make-video.mjs <slug> --miniatura` | solo regenera la miniatura (rápido) |
| `node plantilla/make-video.mjs --checklist` | regenera `CHECKLIST.md` y todos los `salida/*.youtube.txt` |
| `node plantilla/make-video.mjs --iconos` | hoja con todos los íconos → `videos/_iconos/snapshots/` |
| `node plantilla/make-video.mjs --pronunciacion [palabra]` | audios de prueba de `pronunciacion.json` → `videos/_pronunciacion/` (`todas.wav` y uno por palabra: primero tal cual, después ajustada) |
| `node plantilla/make-video.mjs --kit` | demo de los 9 kinds (`plantilla/kit-demo.json`) → `videos/_kit/snapshots/` — correrlo después de tocar estilos/runtime |
| `node plantilla/make-video.mjs <slug> --identidad <id>` | el mismo video con otra identidad visual → `videos/_identidad-<id>/` (para comparar) |
| `npx hyperframes preview` (dentro de `videos/<slug>`) | revisar en el Studio |

Flags: `--force-tts`, `--no-check`, `--no-snapshot`. HyperFrames fijo en **0.8.150** (`HF` en `make-video.mjs`).

## Pasos para un tema nuevo

1. `--info <slug>` (si el tema no está en `temas.csv`, agregarlo en su lugar de la progresión).
2. Escribir `temas/<slug>.json` (copiar `temas/que-es-el-dinero.json` como base): guion de voz por escenas + visuales + `youtube` + `miniatura`.
3. `make-video <slug>` → mirar el contact sheet: textos que se pisan, visuales chicos, avisos `⚠` del builder → corregir.
4. `--render` en segundo plano. Mientras tanto, preparar el próximo tema.
5. Cuando el dueño del canal lo aprueba: `"revisado": true` y `--checklist`.

## Reglas de contenido

- Español **rioplatense con voseo** ("fijate", "guardá", "tenés"). Tono cercano, cero jerga sin explicar: **cada término nuevo
  se define la primera vez que aparece**. **Una idea central por video.**
- **Nunca** recomendar comprar ni vender una moneda puntual, nunca dar precios ni cifras inventadas. Si hace falta un número,
  que sea verificable y estable (ej. "el suministro máximo de Bitcoin es 21 millones"); si no, explicarlo sin números.
- Nada de marcas reales (bancos, exchanges, apps): los íconos son genéricos.
- Cada video cierra conectando con el siguiente tema de la lista (la escena `cierre` lo toma sola de `temas.csv`).
- Voz: ~110–130 caracteres por escena (máx. 3 líneas de subtítulo). 7–9 escenas → 50–70 s.

## Formato de la ficha

```jsonc
{
  "slug": "que-es-el-dinero",          // = nombre del archivo = clave del CSV
  "titulo": "¿Qué es el dinero?",
  "nivel": "Básico 0",                 // aparece en la barra superior y en el hook
  "descripcion": "…",                  // la del CSV
  "revisado": false, "notas": "",      // columnas del checklist
  "voiceSpeed": 1.0,                   // Piper + Daniela es_AR (fijo)
  "music": true, "musicVolume": 0.18,  // cama compartida plantilla/musica/bgm-base.wav con fade in/out
  "youtube": { "titulo": "…", "descripcion": "…", "tags": [] },
  "miniatura": { "escena": "hook", "elemento": null, "zoom": 1, "dy": 0, "head": null },
  "frames": [ … ]                      // escenas en orden (kit, abajo)
}
```

`contentHash`: cambiar `youtube`, `miniatura`, `notas` o `revisado` **no** marca el video como desactualizado. Cambiar la identidad visual activa **sí** (el render guarda con qué identidad se hizo).

### Campos comunes a todas las escenas

| Campo | Uso |
|---|---|
| `kind` | uno de los 9 del kit (abajo) |
| `badge` | etiqueta arriba del título (cada kind trae una por defecto) |
| `head[]` | título, una línea por item, **máx. ~16 caracteres** por línea, 1–2 líneas (3 solo si el visual es chico) |
| `sub` | bajada en menta oscura (opcional) |
| `vo` | texto de la voz **y** del subtítulo (`**negrita**` se ignora en la voz) |
| `min` | duración mínima. La real = máx(min, voz + 1 s, última animación + 0,45 s) |

**Tiempos de los elementos** (relativos al inicio de la escena): cada elemento (ítem, nodo, etiqueta, término…) puede ser un
string o un objeto con `"at": 2.4` (segundos) o `"cue": "palabra"` (aparece cuando la voz dice esa palabra: se estima por la
posición del texto, Piper no da tiempos por palabra). Sin nada, se reparten cada ~1,3 s. El texto acepta `**negrita**` (acento).

La zona visual va desde debajo del texto hasta y = 1560 (el subtítulo arranca en 1600). Si el contenido no entra se achica
solo; si sobra lugar se agranda hasta 1,3×. **Nada pisa el subtítulo.**

## Kit de escenas (`frames[].kind`)

### `hook` — pregunta gancho + tema
```json
{ "kind": "hook", "head": ["¿Qué es", "el dinero?"], "sub": "Antes de hablar de cripto",
  "icono": "billetes", "orbita": ["moneda", "concha", "celular", "alcancia"], "vo": "…" }
```
Ícono grande que flota + hasta 6 íconos chicos en órbita. Badge automático "CRIPTO DESDE CERO · <nivel>"; la última línea del título va en color.

### `concepto` — título + ícono + etiquetas
```json
{ "kind": "concepto", "badge": "LA CLAVE", "head": ["Funciona por", "confianza"], "icono": "apreton",
  "etiquetas": [{ "text": "Todos lo aceptan", "cue": "aceptar" }, "Lo respalda un Estado"], "vo": "…" }
```

### `analogia` — comparación con algo cotidiano
```json
{ "kind": "analogia", "head": ["Es como un", "llavero"], "conector": "es como",
  "a": { "icono": "billetera", "label": "Billetera cripto" }, "simbolo": "=",
  "b": { "icono": "llave", "label": "Tu llavero", "cue": "llavero" },
  "nota": "Las monedas viven en la red, **no en la billetera**.", "vo": "…" }
```
`simbolo`: "=", "≠", "?", "+"… `nota` (opcional) aparece abajo con un foquito.

### `flujo` — cajas y flechas animadas (billetera → red → bloque)
```json
{ "kind": "flujo", "head": ["Así viaja", "un envío"],
  "nodos": [{ "icono": "billetera", "label": "Tu billetera", "detalle": "Firmás con tu clave" },
            { "icono": "red", "label": "La red" }, { "icono": "bloque", "label": "Un bloque" }],
  "token": { "icono": "bitcoin", "until": "end" }, "vo": "…" }
```
2–4 nodos verticales; las flechas se dibujan antes de cada nodo. `token` (opcional): una moneda que recorre los nodos;
`"until": "end"` la repite hasta el final de la escena (se expande después de medir la voz, no alarga la escena).

### `comparacion` — A vs B
```json
{ "kind": "comparacion", "head": ["Efectivo vs", "plata digital"],
  "a": { "titulo": "Efectivo", "icono": "billetes", "items": ["Lo tenés en la mano"] },
  "b": { "titulo": "En el banco", "icono": "banco", "items": ["Es un número en una computadora"] }, "vo": "…" }
```
Ítems intercalados (a0, b0, a1, b1…) como suele decirlo la voz. Máx. 3 por lado, textos cortos.

### `claves` — lista de claves con ticks
```json
{ "kind": "claves", "badge": "SIRVE PARA", "head": ["Tres cosas"],
  "items": [{ "text": "**Intercambiar:** comprar y vender", "cue": "intercambiar" }], "vo": "…" }
```
Máx. 4 ítems.

### `alerta` — ⚠️ riesgo o estafa típica
```json
{ "kind": "alerta", "head": ["Estafa", "típica"], "titulo": "\"Soporte técnico\" por privado",
  "items": ["Te escribe alguien \"del soporte\"", "Te pide tu frase semilla"],
  "consejo": "Nadie legítimo te la va a pedir. **Nunca.**", "vo": "…" }
```
Badge rojo "¡OJO!", triángulo que se sacude, señales con ✗ y un consejo con escudo.

### `glosario` — término + definición en una línea
```json
{ "kind": "glosario", "head": ["Dinero", "fiduciario"],
  "terminos": [{ "termino": "Fiduciario", "definicion": "Que vale por la **confianza** en quien lo emite.", "icono": "billete" }], "vo": "…" }
```
1–3 términos (también vale la forma corta `"termino"`, `"definicion"`, `"icono"`).

### `cierre` — resumen + "en el próximo video…"
```json
{ "kind": "cierre", "head": ["Lo que", "aprendiste"], "resumen": ["Reemplazó al trueque", "Vale porque confiamos"], "vo": "…" }
```
La tarjeta "EN EL PRÓXIMO VIDEO" toma el título de la fila siguiente de `temas.csv` (o `"proximo": "…"`). La voz tiene que
nombrarlo también. Es la última escena: queda quieta hasta el final.

## Íconos

`plantilla/iconos.mjs` — SVG inline (viewBox 120), trazo grueso y colores de la identidad. Ver todos: `--iconos`.
moneda, bitcoin, cripto, billete, billetes, billetera, banco, edificio, candado, llave, red, bloque, cadena, bloques, celular,
computadora, persona, grupo, manzana, pescado, concha, lingote, intercambio, check, cruz, alerta, pregunta, lupa, grafico,
escudo, foco, libro, reloj, mundo, semilla, alcancia, etiqueta, carrito, corazon, apreton, nube, cohete, regalo, mensaje,
anzuelo, balanza, play.

Para agregar uno: antes buscar en el registry (`npx hyperframes@0.8.150 catalog --query "<en inglés>"`); si no hay, dibujarlo
en `iconos.mjs` con el mismo estilo (variables `--line`, `--plate`, `--primary`, `--gold`, `--sky`, `--alert`, `--leaf`,
`--paper`), revisarlo con `--iconos` y anotarlo en la BITACORA. Nunca logos de marcas reales.

## Identidad visual

`plantilla/identidad/<id>.css` (tokens) + `<id>.frame.md` (la especificación). La activa está en `plantilla/identidad/activa.txt`.

- `a-pizarra-menta` — papel cálido con puntitos, tinta azul marino, menta y dorado. Fredoka + Nunito. (alternativa)
- `b-noche-dorada` — azul noche, dorado y menta. Space Grotesk + Inter. **(activa, elegida 2026-10-12)**

Formato: vertical 1080×1920 (Shorts). 16:9 todavía no está implementado (está documentado en los frame.md cómo sería).

## Descripción de YouTube (`youtube`)

`make-video` y `--checklist` la exportan a `salida/<slug>.youtube.txt` y la validan (avisos en Notas del CHECKLIST).

- `titulo` ≤ 100 caracteres (ideal ~60): `<Tema> 🪙 <beneficio> explicado fácil | Cripto desde cero`.
- `tags`: 8–15 búsquedas en español, ≤ 500 caracteres en total.
- `descripcion` ≤ 5000 caracteres, **sin `<` ni `>`**, rioplatense cercano con emojis. Estructura fija:

```
🪙 <TEMA EN MAYÚSCULAS> — <qué vas a entender en una línea>

<gancho de 1–2 frases>

📚 EN ESTE VIDEO
1️⃣ … (los mismos puntos que dice la voz)

💡 LA IDEA CLAVE
<una analogía>

📖 GLOSARIO
• Término: definición. (2–4)

⚠️ OJO CON
<riesgo o estafa relacionada, si aplica>

🎓 NIVEL: <Básico n> · Siguiente video: {{SIGUIENTE}}

🙌 Si te sirvió, dejá tu like, guardalo y compartilo …

{{DESLINDE}}

#Criptomonedas #Bitcoin #<Tema> #CriptoDesdeCero #<otro>
```

- `{{DESLINDE}}` se reemplaza por `plantilla/youtube-deslinde.txt` **tal cual**; `{{SIGUIENTE}}` por el título del próximo tema.
- El crédito de la voz (CC BY-SA 4.0) se agrega solo antes de la línea de hashtags.

## Miniatura (`miniatura`)

`salida/<slug>.miniatura.png` (1080×1920): una escena quieta, **sin subtítulo, barra ni audio**, con el visual principal agrandado.

- `escena`: id ("01"), número (1) o kind ("hook", default).
- `elemento` (opcional): deja solo esa parte del visual, ej. `"keep"` (el elemento principal de cada kind) — el resto se oculta.
- `zoom` (default 1, se multiplica con el auto-ajuste), `dy` (px hacia abajo), `head` (título alternativo más corto/punchy).

## Voz

**Piper** local con **Daniela (es_AR-daniela-high)**, velocidad normal (aprobada; no proponer otras). `plantilla/piper-tts.py`.
- PC nueva: `python -m pip install piper-tts` y bajar el modelo (no va a git, 114 MB) a `plantilla/voces-piper/`:
  `https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_AR/daniela/high/es_AR-daniela-high.onnx` (+ `.onnx.json`).
- Palabras en inglés (Bitcoin, blockchain, wallet…): `plantilla/pronunciacion.json` cambia cómo se escriben **solo para la voz**.
  Antes de sumar o cambiar una entrada: `--pronunciacion <palabra>` y escucharla.
- Licencia CC BY-SA 4.0: crédito automático en la descripción. Edge TTS da 403; Kokoro suena robótico (descartados).

## Skills

`npx skills add heygen-com/hyperframes` (quedan en `.claude/skills/`, fijadas en `skills-lock.json`). Skill de autoría: `faceless-explainer`.
