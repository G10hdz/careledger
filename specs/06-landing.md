# 06 — Sitio público y narrativa (`apps/landing`)

La cara pública: explica en lenguaje llano cómo el tiempo de cuidado se
convierte en beneficios. Referencia:
`design/stitch/infograf_a_c_mo_tu_tiempo_se_convierte_en_beneficios/` y
`design/stitch/infograf_a_sistema_de_puntos_c_vicos_de_bienestar/`
(variante con naming "Puntos Cívicos" — es la que manda).

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-WEB-001 | THE landing SHALL contar la ruta del tiempo en 4 fases: Hogar (registro en 40s, 100% sin internet) → Comunidad (vecinas + promotora validan con un toque) → Salud pública (ahorro medible) → Recompensa (beneficios reales a elegir). | Screenshot de secciones |
| REQ-WEB-002 | THE landing SHALL incluir la matriz pedagógica de canje con calculadora: input de horas semanales → puntos estimados, ahorro social evitado y horas de descanso ganadas. Niveles: Básico 1h/10pts, Cotidiano 3.5h/35pts, Integral 14h-semana/140pts. | Test de calculadora |
| REQ-WEB-003 | THE landing SHALL segmentar en 3 audiencias con CTA propio: para cuidadoras (lenguaje sencillo), para familias y comercios, para gobiernos y funcionarios. | Test de navegación |
| REQ-WEB-004 | THE landing SHALL fijar las 3 garantías innegociables: "Cuidar no es favor, es trabajo" / "Tu privacidad es sagrada" (ZK, nada médico en servidores) / "Respaldo municipal real" (suficiencia presupuestaria por vale). | Screenshot |
| REQ-WEB-005 | THE landing SHALL incluir FAQ con copy de confianza y contacto; y descargable "Folleto Barrial" en PDF. | Test de assets |
| REQ-WEB-006 | THE landing SHALL usar el naming público "Puntos Cívicos" (no `$CARE` ni "token") en todo el copy orientado a ciudadanía; `Cuando cuidas, te descuidas` solo como nombre de producto. | Revisión de copy |
| REQ-WEB-007 | THE landing SHALL ser responsive mobile-first, LCP <2.5s en 4G, y cumplir WCAG 2.1 AA. | Lighthouse |

## Tono

Del pitch del documento fuente: dignidad, no caridad. "No estamos diseñando
una app de caridad; estamos construyendo la infraestructura financiera y de
datos para sostener la economía del cuidado." Sin frases de AI-slop ni
promesas vagas: números del piloto (3.42x SROI, −53% caídas, 94% satisfacción)
van con su fuente metodológica.
