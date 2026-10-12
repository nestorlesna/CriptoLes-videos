// Íconos del canal: SVG inline, viewBox 0 0 120 120, trazo grueso redondeado y rellenos con los colores de la identidad
// (variables CSS: --line, --plate, --primary, --primary-soft, --gold, --sky, --alert, --leaf, --paper).
// Se usan por nombre en las fichas: "icono": "billetera". Ver todos: node plantilla/make-video.mjs --iconos
// Regla: nada de marcas reales (bancos, exchanges, apps). Los logos de cripto son genéricos y dibujados.
const S = 'stroke="var(--line)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
const T = (x, y, txt, size = 44, fill = "var(--line)") =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="var(--font-display)" font-weight="700" font-size="${size}" fill="${fill}">${txt}</text>`;

export const ICONOS = {
  moneda: `<circle cx="60" cy="60" r="44" fill="var(--gold)" ${S}/><circle cx="60" cy="60" r="31" fill="none" ${S} stroke-width="4"/>${T(60, 62, "$", 40)}`,
  bitcoin: `<circle cx="60" cy="60" r="44" fill="#F7931A" ${S}/>${T(60, 62, "₿", 54, "var(--line)")}`,
  cripto: `<circle cx="60" cy="60" r="44" fill="var(--primary)" ${S}/><path d="M60 30 L84 60 L60 90 L36 60 Z" fill="var(--plate)" ${S} stroke-width="4"/><path d="M36 60 H84" ${S} stroke-width="4"/>`,
  billete: `<rect x="12" y="32" width="96" height="56" rx="8" fill="var(--leaf)" ${S}/><rect x="22" y="42" width="76" height="36" rx="4" fill="none" ${S} stroke-width="3"/><circle cx="60" cy="60" r="12" fill="var(--plate)" ${S} stroke-width="4"/>`,
  billetes: `<rect x="22" y="22" width="86" height="50" rx="8" fill="var(--leaf)" ${S} opacity="0.65"/><rect x="12" y="44" width="86" height="50" rx="8" fill="var(--leaf)" ${S}/><circle cx="55" cy="69" r="11" fill="var(--plate)" ${S} stroke-width="4"/>`,
  billetera: `<rect x="14" y="32" width="88" height="66" rx="12" fill="var(--primary)" ${S}/><path d="M24 32 L80 16 L86 32" fill="var(--paper)" ${S}/><rect x="70" y="52" width="40" height="28" rx="8" fill="var(--plate)" ${S}/><circle cx="84" cy="66" r="5" fill="var(--line)"/>`,
  banco: `<path d="M60 12 L108 38 H12 Z" fill="var(--plate)" ${S}/><rect x="16" y="94" width="88" height="14" rx="3" fill="var(--sky)" ${S}/>${[26, 47, 68, 89].map((x) => `<rect x="${x}" y="46" width="10" height="42" fill="var(--sky)" ${S} stroke-width="4"/>`).join("")}`,
  edificio: `<path d="M30 52 A30 30 0 0 1 90 52 Z" fill="var(--sky)" ${S}/><rect x="22" y="52" width="76" height="54" fill="var(--plate)" ${S}/><path d="M60 22 V8 L76 13 L60 18" fill="var(--alert)" ${S} stroke-width="4"/>${[36, 56, 76].map((x) => `<rect x="${x}" y="64" width="9" height="30" fill="var(--sky)" ${S} stroke-width="3"/>`).join("")}`,
  candado: `<path d="M38 54 V40 a22 22 0 0 1 44 0 V54" fill="none" ${S} stroke-width="8"/><rect x="24" y="52" width="72" height="56" rx="10" fill="var(--gold)" ${S}/><circle cx="60" cy="74" r="8" fill="var(--line)"/><path d="M60 78 V92" ${S} stroke-width="7"/>`,
  llave: `<circle cx="36" cy="60" r="22" fill="var(--gold)" ${S}/><circle cx="36" cy="60" r="8" fill="var(--plate)" ${S} stroke-width="4"/><path d="M58 60 H108 M92 60 V76 M104 60 V72" fill="none" ${S} stroke-width="8"/>`,
  red: `<path d="M60 24 L24 56 L44 98 M60 24 L96 56 L76 98 M24 56 L96 56 M44 98 L76 98 M60 24 L44 98 M60 24 L76 98" fill="none" ${S} stroke-width="4"/>${[[60, 24], [24, 56], [96, 56], [44, 98], [76, 98]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="var(--primary)" ${S} stroke-width="4"/>`).join("")}`,
  bloque: `<path d="M60 14 L102 36 L60 58 L18 36 Z" fill="var(--primary-soft)" ${S}/><path d="M18 36 L60 58 V106 L18 84 Z" fill="var(--primary)" ${S}/><path d="M60 58 L102 36 V84 L60 106 Z" fill="var(--sky)" ${S}/>`,
  cadena: `<rect x="10" y="44" width="56" height="32" rx="16" fill="none" ${S} stroke-width="9"/><rect x="54" y="44" width="56" height="32" rx="16" fill="none" stroke="var(--primary)" stroke-width="9"/><rect x="54" y="44" width="56" height="32" rx="16" fill="none" ${S} stroke-width="3"/>`,
  bloques: `${[[8, 42], [44, 42], [80, 42]].map(([x, y]) => `<rect x="${x}" y="${y}" width="32" height="32" rx="6" fill="var(--primary)" ${S} stroke-width="4"/>`).join("")}<path d="M40 58 H44 M76 58 H80" ${S} stroke-width="6"/>`,
  celular: `<rect x="32" y="10" width="56" height="100" rx="12" fill="var(--plate)" ${S}/><rect x="40" y="24" width="40" height="66" rx="4" fill="var(--sky)" ${S} stroke-width="3"/><circle cx="60" cy="100" r="4" fill="var(--line)"/>`,
  computadora: `<rect x="12" y="18" width="96" height="64" rx="8" fill="var(--plate)" ${S}/><rect x="22" y="28" width="76" height="44" rx="3" fill="var(--sky)" ${S} stroke-width="3"/><path d="M46 82 L42 102 H78 L74 82" fill="var(--plate)" ${S}/>`,
  persona: `<circle cx="60" cy="38" r="20" fill="var(--gold)" ${S}/><path d="M22 106 a38 34 0 0 1 76 0 Z" fill="var(--primary)" ${S}/>`,
  grupo: `<circle cx="32" cy="48" r="13" fill="var(--gold)" ${S} stroke-width="4"/><circle cx="88" cy="48" r="13" fill="var(--gold)" ${S} stroke-width="4"/><path d="M8 100 a24 22 0 0 1 48 0 Z M64 100 a24 22 0 0 1 48 0 Z" fill="var(--sky)" ${S} stroke-width="4"/><circle cx="60" cy="40" r="17" fill="var(--gold)" ${S}/><path d="M30 108 a30 28 0 0 1 60 0 Z" fill="var(--primary)" ${S}/>`,
  manzana: `<path d="M60 36 C40 22 14 32 18 62 C22 92 44 108 60 100 C76 108 98 92 102 62 C106 32 80 22 60 36 Z" fill="var(--alert)" ${S}/><path d="M60 36 C60 26 64 18 70 12" fill="none" ${S}/><path d="M64 24 C74 12 90 14 92 20 C84 30 72 30 64 24 Z" fill="var(--leaf)" ${S} stroke-width="4"/>`,
  pescado: `<path d="M16 60 C34 30 74 30 90 60 C74 90 34 90 16 60 Z" fill="var(--sky)" ${S}/><path d="M88 60 L110 40 V80 Z" fill="var(--sky)" ${S}/><circle cx="36" cy="54" r="5" fill="var(--line)"/>`,
  concha: `<path d="M60 12 C88 12 104 40 100 70 C96 96 78 108 60 108 C42 108 24 96 20 70 C16 40 32 12 60 12 Z" fill="var(--paper)" ${S}/><path d="M60 26 C52 50 52 80 60 98 C68 80 68 50 60 26 Z" fill="var(--gold)" ${S} stroke-width="4"/>${[40, 54, 68, 82].map((y) => `<path d="M53 ${y} H47 M67 ${y} H73" ${S} stroke-width="3"/>`).join("")}`,
  lingote: `<path d="M24 50 H96 L110 94 H10 Z" fill="var(--gold)" ${S}/><path d="M24 50 L34 34 H86 L96 50" fill="var(--gold)" ${S}/><path d="M30 72 H90" ${S} stroke-width="3" opacity="0.5"/>`,
  intercambio: `<path d="M20 44 H92 M76 28 L94 44 L76 60" fill="none" stroke="var(--primary)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 78 H28 M44 62 L26 78 L44 94" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  check: `<circle cx="60" cy="60" r="46" fill="var(--primary)" ${S}/><path d="M36 62 L53 78 L86 44" fill="none" stroke="var(--plate)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
  cruz: `<circle cx="60" cy="60" r="46" fill="var(--alert)" ${S}/><path d="M42 42 L78 78 M78 42 L42 78" fill="none" stroke="var(--plate)" stroke-width="11" stroke-linecap="round"/>`,
  alerta: `<path d="M60 12 L110 100 H10 Z" fill="var(--gold)" ${S} stroke-width="6"/><path d="M60 44 V70" ${S} stroke-width="11"/><circle cx="60" cy="86" r="6" fill="var(--line)"/>`,
  pregunta: `<circle cx="60" cy="60" r="46" fill="var(--sky)" ${S}/>${T(60, 64, "?", 64, "var(--plate)")}`,
  lupa: `<circle cx="50" cy="50" r="30" fill="var(--paper)" ${S} stroke-width="8"/><path d="M72 72 L104 104" ${S} stroke-width="14"/>`,
  grafico: `<path d="M16 16 V104 H108" fill="none" ${S} stroke-width="6"/><path d="M24 80 L42 52 L56 70 L72 30 L86 62 L102 40" fill="none" stroke="var(--primary)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  escudo: `<path d="M60 10 L100 24 V56 C100 82 82 100 60 110 C38 100 20 82 20 56 V24 Z" fill="var(--primary)" ${S}/><path d="M42 60 L55 73 L80 46" fill="none" stroke="var(--plate)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  foco: `<path d="M60 12 C36 12 24 32 26 50 C28 66 40 72 42 86 H78 C80 72 92 66 94 50 C96 32 84 12 60 12 Z" fill="var(--gold)" ${S}/><rect x="42" y="86" width="36" height="12" rx="3" fill="var(--plate)" ${S} stroke-width="4"/><path d="M48 106 H72" ${S} stroke-width="6"/>`,
  libro: `<path d="M60 26 C46 18 26 18 12 22 V98 C26 94 46 94 60 102 Z" fill="var(--plate)" ${S}/><path d="M60 26 C74 18 94 18 108 22 V98 C94 94 74 94 60 102 Z" fill="var(--primary-soft)" ${S}/>`,
  reloj: `<circle cx="60" cy="60" r="46" fill="var(--plate)" ${S}/><path d="M60 30 V60 L80 72" fill="none" ${S} stroke-width="7"/>`,
  mundo: `<circle cx="60" cy="60" r="46" fill="var(--sky)" ${S}/><ellipse cx="60" cy="60" rx="20" ry="46" fill="none" ${S} stroke-width="4"/><path d="M14 60 H106 M22 36 H98 M22 84 H98" ${S} stroke-width="4"/>`,
  semilla: `<rect x="18" y="10" width="84" height="100" rx="8" fill="var(--paper)" ${S}/>${[28, 50, 72].map((y) => `<rect x="28" y="${y}" width="28" height="12" rx="6" fill="var(--primary)"/><rect x="64" y="${y}" width="28" height="12" rx="6" fill="var(--primary)"/>`).join("")}<path d="M60 104 V90 M60 94 C52 88 50 82 52 80 C58 82 60 88 60 94 C60 86 66 80 70 82 C70 88 66 92 60 94" fill="var(--leaf)" ${S} stroke-width="3"/>`,
  alcancia: `<ellipse cx="56" cy="64" rx="42" ry="32" fill="var(--alert)" ${S}/><path d="M92 54 L108 48 V66 L96 70" fill="var(--alert)" ${S}/><path d="M34 36 L30 22 L46 32" fill="var(--alert)" ${S}/><path d="M34 92 V106 M74 92 V106" ${S} stroke-width="9"/><path d="M46 44 H66" ${S} stroke-width="6"/><circle cx="80" cy="56" r="4" fill="var(--line)"/>`,
  etiqueta: `<path d="M14 54 L54 14 H104 V64 L64 104 Z" fill="var(--gold)" ${S}/><circle cx="84" cy="34" r="8" fill="var(--plate)" ${S} stroke-width="4"/>${T(58, 66, "$", 34)}`,
  carrito: `<path d="M8 20 H26 L40 80 H96 L106 38 H32" fill="none" ${S} stroke-width="7"/><path d="M34 38 H104 L96 80 H42 Z" fill="var(--sky)" ${S}/><circle cx="48" cy="98" r="9" fill="var(--plate)" ${S}/><circle cx="88" cy="98" r="9" fill="var(--plate)" ${S}/>`,
  corazon: `<path d="M60 102 C20 74 10 52 14 38 C18 22 38 14 50 24 C55 28 58 32 60 36 C62 32 65 28 70 24 C82 14 102 22 106 38 C110 52 100 74 60 102 Z" fill="var(--alert)" ${S}/>`,
  apreton: `<path d="M8 44 L30 34 L58 46 L46 58 C42 62 48 70 54 66 L70 56 L98 80 C102 84 98 92 92 88 M8 44 V82 L34 96 C40 100 46 98 50 94 L58 98 C64 100 70 96 72 92 L80 94 C86 96 92 92 92 88" fill="var(--gold)" ${S}/><path d="M112 44 L90 34 L70 40 M112 44 V80 L98 80" fill="var(--sky)" ${S}/>`,
  nube: `<path d="M30 92 C14 92 8 80 12 70 C16 60 26 58 32 60 C32 44 46 32 62 34 C76 36 84 46 86 56 C100 54 112 64 110 78 C108 88 100 92 92 92 Z" fill="var(--paper)" ${S}/>`,
  cohete: `<path d="M60 10 C80 26 86 52 80 82 H40 C34 52 40 26 60 10 Z" fill="var(--plate)" ${S}/><circle cx="60" cy="46" r="10" fill="var(--sky)" ${S} stroke-width="4"/><path d="M40 70 L24 92 L42 88 M80 70 L96 92 L78 88" fill="var(--alert)" ${S}/><path d="M50 84 L60 108 L70 84" fill="var(--gold)" ${S}/>`,
  regalo: `<rect x="16" y="44" width="88" height="24" rx="4" fill="var(--alert)" ${S}/><rect x="24" y="68" width="72" height="40" rx="4" fill="var(--alert)" ${S}/><path d="M60 44 V108" ${S} stroke-width="8"/><path d="M60 44 C48 24 30 30 36 40 C40 46 52 44 60 44 C68 44 80 46 84 40 C90 30 72 24 60 44 Z" fill="var(--gold)" ${S} stroke-width="4"/>`,
  mensaje: `<path d="M14 22 H106 V82 H52 L30 102 V82 H14 Z" fill="var(--plate)" ${S}/><path d="M30 44 H90 M30 62 H72" ${S} stroke-width="6"/>`,
  anzuelo: `<path d="M70 12 V72 C70 92 54 104 40 98 C26 92 24 76 34 66" fill="none" ${S} stroke-width="8"/><path d="M34 66 L28 82 L44 74" fill="var(--line)" ${S} stroke-width="4"/><circle cx="70" cy="12" r="6" fill="var(--alert)" ${S} stroke-width="3"/>`,
  balanza: `<path d="M60 18 V100 M34 106 H86 M20 34 H100" fill="none" ${S} stroke-width="7"/><path d="M20 34 L8 66 H32 Z M100 34 L88 66 H112 Z" fill="var(--gold)" ${S} stroke-width="4"/><circle cx="60" cy="18" r="7" fill="var(--primary)" ${S} stroke-width="3"/>`,
  pizza: `<circle cx="60" cy="60" r="48" fill="var(--gold)" ${S}/><circle cx="60" cy="60" r="38" fill="#FFE08A" ${S} stroke-width="3"/><path d="M60 22 V98 M22 60 H98 M33 33 L87 87 M87 33 L33 87" ${S} stroke-width="3"/>${[[46, 40], [76, 48], [44, 76], [74, 78], [60, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="var(--alert)"/>`).join("")}`,
  play:`<circle cx="60" cy="60" r="46" fill="var(--primary)" ${S}/><path d="M50 38 L84 60 L50 82 Z" fill="var(--plate)" ${S} stroke-width="4"/>`,
};

export const ICON_NAMES = Object.keys(ICONOS);

// <svg> listo para insertar. Si el nombre no existe devuelve el signo de pregunta (y el builder avisa).
export function icono(name, cls = "ico", extra = "") {
  const body = ICONOS[name] || ICONOS.pregunta;
  return `<svg class="${cls}" viewBox="0 0 120 120"${extra} aria-hidden="true">${body}</svg>`;
}
