# Plan de producción — Cripto desde cero (temas 7 a 33)

Estado al **2026-10-22**. Este documento es para quien siga la producción (persona u otra herramienta): **el contenido
ya está escrito**. Lo que queda es tomar cada ficha, generar el video, revisarlo y publicarlo.

> Leé también `plantilla/README.md` (formato de la ficha y kit de escenas) y `plantilla/BITACORA.md` (problemas ya resueltos).

---

## 1. Qué está listo

| Qué | Dónde | Estado |
|---|---|---|
| Lista maestra y orden de la serie | `temas/temas.csv` | 33 temas, sin cambios de orden |
| Fichas de los 33 videos | `temas/<clave>.json` | ✅ las 33 (las 27 nuevas: temas 7 a 33) |
| Guion de voz + visuales por escena | dentro de cada ficha (`frames`) | 8–9 escenas por video, ~50–59 s |
| Título, descripción y tags de YouTube | dentro de cada ficha (`youtube`) | con `{{DESLINDE}}` y `{{SIGUIENTE}}` |
| Miniatura | dentro de cada ficha (`miniatura`) | escena `hook` en todas |
| Validador de fichas (sin voz ni render) | `node plantilla/validar-fichas.mjs` | 33 fichas · 0 errores (los 3 avisos son de videos viejos ya publicados) |
| Pronunciación de palabras en inglés nuevas | `plantilla/pronunciacion.json` | agregadas, **falta que el dueño las escuche** (ver 2.1) |

Videos 1–6 ya están renderizados y publicados (los archivos están en `salida/subidos/Viejos/`).

---

## 2. Antes de renderizar: 3 cosas para decidir (el dueño del canal)

### 2.1 Escuchar la pronunciación nueva
Audios en `videos/_pronunciacion/` (cada wav = primero la palabra tal cual, después la ajustada):

| Palabra | Ajuste | Aparece en |
|---|---|---|
| whitepaper | uáitpéiper | quien-creo-bitcoin, como-investigar-un-proyecto |
| Satoshis | Satóshis | quien-creo-bitcoin |
| halving / Halving | jálvin | 21-millones-y-halving |
| altcoin / Altcoin | áltcoin | tokens-y-altcoins |
| Stablecoin | Stéibolcoin | que-es-una-stablecoin |
| ether | íter | que-es-ethereum, tokens-y-altcoins |
| pendrive | péndraiv | que-es-una-billetera |
| shopping | shópin | tokens-y-altcoins |
| CBU | ce be u | clave-publica-y-privada |

Números: `videos/_pronunciacion/numeros/assets/voice/n1.wav` (210.000), `n2.wav` (2140), `n3.wav` (10 minutos, 2009, 2015).
Si alguna suena mal: cambiar el valor en `pronunciacion.json`, correr `node plantilla/make-video.mjs --pronunciacion <palabra>`
y volver a escuchar. Si un número suena mal, escribirlo con palabras en el `vo` de la ficha (el subtítulo lo va a mostrar así).

### 2.2 La carpeta `salida/subidos/Viejos/`
El pipeline busca los videos publicados **solo en `salida/subidos/`** (no en subcarpetas). Con los 6 viejos en `Viejos/`,
la próxima vez que corra `make-video` (que regenera el CHECKLIST al final) va a:
- marcar los videos 1–6 como no renderizados y no subidos en `CHECKLIST.md`, y
- volver a crear `salida/<slug>.youtube.txt` de esos 6 en `salida/`.

No rompe nada (sin `.mp4` en `salida/`, el subidor no los toma), pero ensucia. Opciones: volver a poner los 6 en
`salida/subidos/`, o pedir que `make-video.mjs` también mire `subidos/Viejos/` (función `subidoPath`).

### 2.3 Revisión de los guiones
Las fichas siguen las reglas del README (voseo, una idea por video, términos definidos, sin marcas, sin precios ni
consejos de compra). Si el dueño quiere leer los guiones antes de gastar renders, cada ficha tiene la voz completa en
los campos `vo` (en orden). Lo que cambie en `vo` cambia el video; lo que cambie en `youtube` no.

---

## 3. Cómo producir UN video (receta)

Requisitos en la PC: Node, ffmpeg, Python con `piper-tts` y el modelo de Daniela en `plantilla/voces-piper/`
(ver README → Voz). HyperFrames se baja solo con `npx` (versión fija 0.8.150).

Desde la raíz `VideosCripto/`:

```bash
node plantilla/validar-fichas.mjs <clave>         # 1. la ficha está bien (segundos)
node plantilla/make-video.mjs <clave>             # 2. voz + composición + check + snapshots + miniatura
#    → mirar videos/<clave>/snapshots/contact-sheet.jpg y los "⚠" que imprime
node plantilla/make-video.mjs <clave> --render    # 3. render final → salida/<clave>.mp4 (en segundo plano, ~2–3 min)
```

Qué revisar en el contact sheet (paso 2), y dónde se arregla — **siempre en `temas/<clave>.json`, nunca en `videos/`**:

| Si ves… | Arreglo en la ficha |
|---|---|
| Subtítulo de 4 líneas o que toca la barra | acortar ese `vo` (ideal ≤ 120 caracteres) |
| Título que se corta o se pisa con el visual | acortar la línea de `head` (≤ 16 caracteres) o la `sub` |
| Etiquetas / ítems que no entran o quedan muy chicos | textos más cortos o menos ítems (máx. 3 por lado en comparación, 4 en claves) |
| Un elemento aparece antes/después de que la voz lo nombre | ajustar su `cue` (una palabra que esté en ese `vo`) |
| Miniatura floja | `miniatura.head` (título más corto) o `miniatura.escena` |

Después de cambiar la ficha, volver a correr el paso 2 (la voz solo se regenera si cambió el texto).

## 4. Producir en tanda

Lo que mejor funcionó (BITACORA, 10-12): primero todas las composiciones, después todos los renders.

```bash
# a) composiciones + contact sheets de un bloque (ej. Básico 1)
for s in quien-creo-bitcoin que-es-blockchain centralizado-vs-descentralizado por-que-bitcoin-tiene-valor; do
  node plantilla/make-video.mjs "$s" || echo "FALLÓ $s"
done
# b) revisar los contact sheets, corregir fichas, repetir (a) solo con las corregidas
# c) renders en segundo plano
for s in quien-creo-bitcoin que-es-blockchain centralizado-vs-descentralizado por-que-bitcoin-tiene-valor; do
  node plantilla/make-video.mjs "$s" --render || echo "FALLÓ $s"
done
```

Eso es Git Bash. En PowerShell: `foreach ($s in "quien-creo-bitcoin","que-es-blockchain") { node plantilla/make-video.mjs $s }`.

Tandas sugeridas (una por bloque de nivel): **7–10**, **11–15**, **16–19**, **20–23**, **24–28**, **29–33**.

## 5. Revisión y publicación

1. El dueño mira `salida/<clave>.mp4`. Si lo aprueba: `"revisado": true` en la ficha y `node plantilla/make-video.mjs --checklist`.
2. Subir **solo con el skill `youtube-upload`** (ver `SUBIR-A-YOUTUBE.md`): siempre `--dry-run` primero y confirmar.
   El skill mueve mp4 + txt + miniatura a `salida/subidos/` solo. **No mover archivos a mano.**
3. Cuota: ~6 subidas por día. Subir **en el orden del CSV**, uno por uno (así el canal queda en el orden de la serie y
   cada "Siguiente video" ya existe o está por salir).
4. Si YouTube los deja privados (proyecto de Google sin verificar): cambiarlos a público desde los links de Studio que
   imprime el script.

## 6. Los 27 videos pendientes

| # | Clave | Título | Nivel | Esc. | ~s | A tener en cuenta |
|---|---|---|---|---|---|---|
| 7 | quien-creo-bitcoin | ¿Quién creó Bitcoin? | Básico 1 | 8 | 50 | whitepaper, Satoshis |
| 8 | que-es-blockchain | ¿Qué es una blockchain? | Básico 1 | 8 | 51 | |
| 9 | centralizado-vs-descentralizado | Centralizado vs descentralizado | Básico 1 | 8 | 51 | sub del hook larga: mirar que no se pise |
| 10 | por-que-bitcoin-tiene-valor | ¿Por qué Bitcoin tiene valor? | Básico 1 | 8 | 51 | |
| 11 | que-es-una-billetera | ¿Qué es una billetera cripto? | Básico 2 | 8 | 53 | pendrive |
| 12 | clave-publica-y-privada | Clave pública y clave privada | Básico 2 | 8 | 50 | CBU |
| 13 | frase-semilla | ¿Qué es la frase semilla? | Básico 2 | 8 | 51 | |
| 14 | custodia-propia-vs-exchange | ¿Quién tiene tus llaves? | Básico 2 | 8 | 50 | |
| 15 | que-es-un-exchange | ¿Qué es un exchange? | Básico 2 | 8 | 50 | |
| 16 | que-pasa-al-comprar-cripto | ¿Qué pasa cuando comprás cripto? | Básico 2 | 8 | 50 | flujo de 4 nodos |
| 17 | enviar-y-recibir-cripto | Cómo enviar y recibir cripto | Básico 2 | 8 | 49 | glosario de 3 términos |
| 18 | estafas-mas-comunes | Las estafas más comunes en cripto | Básico 2 | 8 | 52 | 3 alertas seguidas |
| 19 | seguridad-basica | Seguridad básica: que no te roben | Básico 2 | 8 | 51 | término largo en glosario (Verificación en dos pasos) |
| 20 | que-es-la-mineria | ¿Qué es la minería? | Básico 3 | 9 | 59 | |
| 21 | 21-millones-y-halving | 21 millones y el halving | Básico 3 | 9 | 56 | halving, números 210.000 y 2140 |
| 22 | que-son-las-comisiones | ¿Qué son las comisiones de red? | Básico 3 | 9 | 56 | |
| 23 | que-es-la-volatilidad | ¿Por qué el precio sube y baja tanto? | Básico 3 | 8 | 50 | |
| 24 | que-es-una-stablecoin | ¿Qué es una stablecoin? | Intermedio 1 | 8 | 51 | Stablecoin |
| 25 | que-es-ethereum | ¿Qué es Ethereum? | Intermedio 1 | 8 | 51 | ether |
| 26 | contratos-inteligentes | ¿Qué es un contrato inteligente? | Intermedio 1 | 8 | 53 | |
| 27 | tokens-y-altcoins | Tokens y altcoins: ¿por qué hay miles? | Intermedio 1 | 8 | 50 | Altcoin, shopping, ether |
| 28 | prueba-de-participacion | Prueba de participación (staking) | Intermedio 1 | 8 | 51 | |
| 29 | que-es-defi | ¿Qué son las finanzas descentralizadas (DeFi)? | Intermedio 2 | 8 | 52 | |
| 30 | que-es-un-nft | ¿Qué es un NFT? | Intermedio 2 | 8 | 49 | |
| 31 | redes-de-segunda-capa | Redes de segunda capa (Lightning) | Intermedio 2 | 8 | 50 | |
| 32 | impuestos-y-normativa | Cripto, impuestos y normativa | Intermedio 2 | 8 | 51 | sin países ni cifras, a propósito |
| 33 | como-investigar-un-proyecto | Cómo investigar un proyecto (DYOR) | Intermedio 2 | 8 | 51 | último: cierre con `proximo` a mano |

Duraciones estimadas por el validador (calibrado con los videos 1–6: error de ±2 s). La real sale al generar la voz.

## 7. Si se agregan temas nuevos

- Sumar la fila a `temas/temas.csv` en su lugar de la progresión (descripciones con `;` → entre comillas).
- Si va después del 33: sacar `"proximo"` del cierre de `como-investigar-un-proyecto` y cambiar su `vo`
  ("En el próximo video: <título nuevo>"). También el `{{SIGUIENTE}}` de YouTube se actualiza solo.
- Ficha nueva: copiar una existente, respetar el README y pasar `validar-fichas.mjs` antes de generar nada.

## 8. Qué NO hacer

- No editar nada dentro de `videos/<clave>/` (se regenera desde la ficha).
- No proponer otras voces: Piper + Daniela es_AR, velocidad 1.0, está aprobada.
- No mover archivos a `salida/subidos/` a mano ni subir videos sin `--dry-run` y confirmación.
- No nombrar marcas reales, no dar precios ni recomendar comprar o vender.
- No servicios pagos ni logins externos: todo local y gratis.
