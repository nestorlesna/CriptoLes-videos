# Nuevos videos a partir de la charla (`blockchain_criptomonedas.pptx`)

Propuesta para una **segunda tanda** (temas 34 en adelante). Cruzada contra los 33 videos ya hechos: solo entran temas que
la serie **todavía no explica**. Cada video sigue las reglas de `plantilla/README.md`: una idea, voseo, sin marcas, sin precios
ni recomendaciones, ~50–60 s.

Estado (2026-10-31): **26 fichas escritas** en `temas/` y agregadas a `temas/temas.csv` como temas 34 a 59 (validador: 0 errores). Voz y render hechos (59/59 mp4); falta subir y programar. No dar ningún video como el último de la serie: vendrán más.

## Bloque A — Cómo nació y por qué (Básico 3)

| clave | título | idea central | diapos |
|---|---|---|---|
| `doble-gasto` | El problema del doble gasto | Un billete no se puede dar dos veces; un archivo digital se copia infinito. Hasta 2008 la única solución era un banco que lleve la cuenta. | 9 |
| `bloque-genesis` | El primer bloque y su mensaje oculto | 3 de enero de 2009: el bloque 0 lleva un titular de diario sobre el rescate a los bancos. Por qué se lo considera un manifiesto. | 3 |
| `primera-compra-con-bitcoin` | Las pizzas de Bitcoin | 2010: un programador paga dos pizzas con 10.000 bitcoins. Primera compra real, y qué enseña (sin decir cuánto valdrían hoy). | 5 |
| `por-que-intermediarios` | ¿Hacen falta los intermediarios? | Cobran, pueden bloquear, pueden caerse y lo ven todo. Qué propone la red sin intermediarios y qué se pierde. | 10, 11 |
| `es-anonimo-bitcoin` | ¿Bitcoin es anónimo? | Libro público: todos ven todo, pero con direcciones y no con nombres. Seudónimo ≠ anónimo. | 12 |

## Bloque B — Blockchain por dentro (Intermedio 1)

| clave | título | idea central | diapos |
|---|---|---|---|
| `que-es-un-bloque` | ¿Qué hay dentro de un bloque? | Hora, lista de operaciones, huella propia y huella del anterior: como una página del libro contable. | 15 |
| `que-es-un-hash` | ¿Qué es un hash? | Una huella digital: cambia un dato y cambia toda la huella. | 15, 16 |
| `por-que-no-se-puede-borrar` | ¿Por qué no se puede cambiar el pasado? | Si tocás un bloque se rompe la cadena hacia adelante. "Inmutable" = carísimo de falsificar, no imposible. | 16, 18 |
| `nodos-y-red-p2p` | Nodos: quién guarda la copia | Servidor único vs red entre pares: si cae uno, la red sigue. | 17 |
| `minemos-un-bloque` | Minemos un bloque a mano | Juego de aula: reglas inventadas (suma + nonce, divisible por 7) para entender qué hace un minero. Es el ejercicio de la charla. | 21, 22 |
| `blockchain-publica-o-privada` | Blockchain pública vs privada | Abierta a cualquiera vs consorcio cerrado; para qué sirve cada una. Sin nombres de productos. | 19 |
| `trilema-blockchain` | El trilema de las blockchains | Descentralización, seguridad y velocidad: no se logran las tres juntas. | 23 |
| `ataque-del-51` | El ataque del 51 % | Qué necesitaría alguien para reescribir la historia y por qué casi nunca conviene. | 18 |
| `explorador-de-bloques` | Cómo ver una transacción real | Para qué sirve un explorador de bloques y qué se lee (dirección, monto, confirmaciones). Práctico, con captura genérica. | 30 |

## Bloque C — Ecosistema y usos reales (Intermedio 2 / 3)

| clave | título | idea central | diapos |
|---|---|---|---|
| `tipos-de-stablecoin` | ¿Cómo se sostiene una stablecoin? | Tres mecanismos: respaldo en dólares, respaldo en cripto con sobrecolateral, algorítmica. Por qué la tercera es la más frágil (caso de 2022, sin nombres). | 29, 41 |
| `que-es-quemar-cripto` | ¿Qué es "quemar" monedas? | Destruir parte de lo que se paga en comisiones y cómo eso puede reducir la oferta. | 28 |
| `cobrar-en-dolares-digitales` | Cobrar en dólares digitales | Por qué en Latinoamérica las stablecoins se usan en la práctica: inflación, restricciones, costo y velocidad. Descriptivo, sin recomendar. | 6, 33, 46 |
| `remesas-y-pagos-internacionales` | Mandar plata al exterior | Banco: días y varios intermediarios. Stablecoin: minutos y 24/7. Cualitativo, sin tarifas. | 33 |
| `activos-tokenizados` | Tokenizar un edificio | Dividir un activo real en partes digitales y qué cambia para quien quiere invertir poco. | 34 |
| `trazabilidad-con-blockchain` | Seguir un producto de la chacra a la mesa | Cada eslabón firma su parte: el origen no se puede falsificar. | 35 |
| `prestamos-con-garantia-cripto` | Préstamos con garantía y liquidación | Pedís prestado dejando cripto como garantía; si baja demasiado, el contrato vende solo. "El código no negocia, ejecuta." | 41 |
| `billetera-caliente-y-fria` | Billetera caliente y billetera fría | Conectada a internet vs guardada fuera de línea: comodidad vs seguridad. | 30 |
| `que-es-kyc` | ¿Por qué te piden documentos? (KYC) | Qué es conocer al cliente, por qué lo exige la regulación y qué hacen con tus datos. | 42 |
| `monedas-digitales-de-banco-central` | Monedas digitales de bancos centrales | Dinero digital emitido por el Estado: en qué se parece y en qué se diferencia de una cripto. | 44 |
| `cripto-e-inteligencia-artificial` | Cuando una IA paga sola | Programas con billetera propia que pagan por servicios, micropagos entre máquinas. Tendencia, no promesa. | 44 |
| `cinco-ideas-para-llevarte` | Cinco ideas para llevarte | Cinco ideas: blockchain no es cripto, sin intermediarios, Latam adopta por necesidad, regulación en camino, "no es si, es cuándo". | 46 |

## Orden aplicado en `temas.csv`

Temas 34 a 41: los 8 de la recomendación. 42 a 59: el resto en el orden de las tablas de arriba (`primera-compra-con-bitcoin` es el 42 y `cinco-ideas-para-llevarte` el 59). Niveles: 34–42 «Intermedio 3», 43–59 «Intermedio 4».

La recomendación original:

`doble-gasto` → `bloque-genesis` → `que-es-un-bloque` → `por-que-no-se-puede-borrar` → `minemos-un-bloque` → `tipos-de-stablecoin` → `prestamos-con-garantia-cripto` → `cobrar-en-dolares-digitales`.

Razón: el doble gasto explica *por qué* existe todo; los tres de bloque/cadena/pasado llenan el hueco técnico que hoy solo cubre `que-es-blockchain`; los tres últimos usan lo más fuerte de la charla (casos reales y lecciones propias).

## Lo que de la charla **no** pasa al canal (y por qué)

- **Precios y valores en dólares** (valor de los 10.000 BTC de la pizza, costo del ataque, porcentajes del mercado, rendimientos de DeFi): regla del canal, nada de cifras que caduquen.
- **Marcas** (exchanges, wallets, apps, bancos, empresas, plataformas de DeFi): regla del canal. Los casos se cuentan sin nombrarlas.
- **La rutina personal** (compra mensual fija, ahorro en dólares digitales, rendimiento por staking, ETH en préstamos): es práctica propia y roza la recomendación. Solo entra la parte conceptual (liquidación de un préstamo) y siempre con el deslinde.
- **Mapa operativo con servicios concretos** (diapo 31) y **casos por país** (diapo 38): son marcas y compañías puntuales.
- **Ejemplos políticos** (diapo 11, bloqueos de cuentas y restricciones cambiarias): tocan temas sensibles y nombran hechos concretos. En `por-que-intermediarios` quedan en genérico: "un intermediario puede decidir bloquear".
- **Regulación por país** (diapo 42): cambia rápido y ya está cubierta de forma general en `impuestos-y-normativa`; solo se retoma el KYC.
- **Tendencias institucionales** (ETFs, grandes gestoras) y **marco mental para empresas** (diapo 45): público de la charla (directivos), no del canal.

## Verificado antes de escribir las fichas

- Bloque génesis: 3 de enero de 2009, con el titular del diario de Londres sobre el rescate a los bancos (confirmado en búsqueda web).
- Pizzas: mayo de 2010, 10.000 bitcoins por dos pizzas (confirmado; la cadena de pizzería está discutida, por eso no se nombra).
- Caída de la stablecoin algorítmica: mayo de 2022 (confirmado). Cambio de Ethereum a prueba de participación: septiembre de 2022 (confirmado).
- Quema de comisiones en Ethereum desde 2021 y halving de 2024: no salieron en la búsqueda; son datos conocidos, pero conviene una segunda mirada del dueño.
- Primer mensaje de Satoshi en la lista de correo: 31 de octubre de 2008 (no confirmado en búsqueda, no se usa en ninguna ficha).

## Pendiente antes de renderizar

- Escuchar la pronunciación nueva (agregada a `plantilla/pronunciacion.json`): KYC («kei uái sí»), selfie («sélfi»), Pizza Day («Déi»), tokenizar («toquenizar»), Hash con mayúscula («Jash»).
- `node plantilla/make-video.mjs <slug>` por cada ficha y revisar los contact sheets (varias tienen títulos de dos líneas y pocas etiquetas).
