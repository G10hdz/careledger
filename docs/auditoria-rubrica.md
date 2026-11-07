# Auditoría contra la rúbrica de Build for Her 2026

Fecha: 2026-11-07. Fuente: `Rúbrica (participantes y mentoras).xlsx` (5 criterios
ponderados, escala 0 a 10, puntaje final = promedio ponderado x 10).
Contrastada con `specs/`, `docs/` y `apps/landing` en `main`.

`specs/10-pitch-y-evaluacion.md` ya traduce la rúbrica a REQ-EVA. Este
documento no lo repite: estima el puntaje, marca qué sigue sin cubrir y
separa lo que entra al pitch de lo que es trabajo posterior.

## Estimación

| Criterio | Peso | Hoy | Meta | REQ |
| --- | --- | --- | --- | --- |
| Impacto | 30% | 7 | 8 | EVA-001..004 |
| Problema y políticas | 25% | 5 | 8 | EVA-010..013 |
| Solución y viabilidad | 20% | 7 | 8 | EVA-019..024 |
| Storytelling | 15% | 6 | 8 | EVA-030..032 |
| IA responsable | 10% | 4 | 7 | EVA-040..043 |
| Total | | ~60 | ~77 | |

Las notas son juicio del revisor sobre lo escrito, no una medición.

## Huecos que spec 10 no cubre

1. La landing promete "Auditoría del 5%" (`faq.tsx`, `route-timeline.tsx`) y
   REQ-ORA-020 no tiene código. Rotularla como siguiente paso o quitarla.
2. La landing y REQ-ORA-022 hablan de prueba de proximidad zero-knowledge. El
   spike antifraude la declara inviable en el dispositivo objetivo.
3. No hay análisis de sesgo del `multiplicadorCarga` ni del factor `Q` del
   nodo (REQ-ORA-011 y 012). REQ-EVA-041 nombra otros riesgos, pero no este.
   Una jueza de IA puede preguntarlo.
4. Los ids de catálogo siguen distintos entre la PWA (`cfe-30`) y la terminal
   (`despensa-basica`). El cobro del flujo de demo funciona; los fixtures no
   comparten catálogo.
5. REQ-ORA-005 (colusión) no tiene implementación ni test.
6. No hay aviso de privacidad ni ADR de datos personales.

## Backlog de producto (después del 2026-11-07)

El código sigue congelado hasta el pitch. Orden sugerido al descongelar, cada
punto en su territorio y en un PR chico:

| Criterio | Cambio | Territorio |
| --- | --- | --- |
| Solución | Catálogo único en `packages/domain`, consumido por PWA y comercios | domain, pwa, comercios |
| Solución | Rótulo "Demo" visible en el oráculo y la liquidación SPEI simulados | pwa, comercios |
| Solución | REQ-ORA-005: detección de terna repetida, con umbral en config y test | domain |
| IA | Test que acota `Q` a [0.85, 1.15] y prueba que no usa variables socioeconómicas | domain |
| IA | Pantalla "Cómo se calculan tus puntos" con la fórmula y el multiplicador | pwa |
| Problema | Tarjeta de brecha en el panel, con fuente visible por cifra | gobierno |
| Impacto | Contadores reales del flujo (horas, puntos, vales) en el panel | gobierno |
| Impacto | Alto contraste y texto grande; registro asistido por promotora | pwa |
| Storytelling | Modo demo con datos de una cuidadora ficticia precargados | pwa |
| Viabilidad | Llaves ligadas al hardware, 3 de 3 entre dispositivos, Play Integrity | pwa, domain |
| IA | Auditoría muestral REQ-ORA-020 y ADR de datos personales | domain, docs |

## Para el pitch (sin código)

Lo pendiente está en la tabla del roadmap. Prioridad por puntaje:

1. Cifras oficiales y programas con su brecha (REQ-EVA-010 y 012). Mayor peso.
2. Slide de IA responsable, incluido el sesgo de `multiplicadorCarga` y `Q`.
3. Métricas de piloto y slide de escala.
4. Historia de una cuidadora, ensayo cronometrado y banco de 8 preguntas.
5. Video de respaldo del demo.

## Revisión tras la conciliación con EntreManos (2026-11-07, tarde)

Contexto: el equipo adoptó EntreManos (banco de tiempo, doc v4) como
historia y su landing quedó como demo en `/cuidared`. Esta sección parte de
la estimación de arriba y solo anota lo que cambió.

### Lo que ya no aplica de arriba

- Hueco 4: comercios ya carga el catálogo de `packages/domain`
  (`apps/comercios/src/lib/catalogo.ts:2`), así que acepta `cfe-30`. Quedan
  ids extra solo de comercios.
- Hueco 5: REQ-ORA-005 sí tiene marca local y test
  (`apps/pwa/src/lib/app.ts:355`, `flow.test.ts:250`). Falta el cruce entre
  dispositivos.
- Problema y políticas e IA: `docs/pitch/problema-y-politicas.md` y
  `docs/pitch/ia-y-preguntas.md` cubren REQ-EVA-010, 012, 013, 032 y 040 a 043.

### Estimación con la historia EntreManos

| Criterio | Peso | Ahora | Por qué | Qué lo sube |
| --- | --- | --- | --- | --- |
| Impacto | 30% | 7 | "Cuidar no tiene género" redistribuye el cuidado; no exige dinero; el rol de vecino cuidador suma a quien no tiene dependiente | Métrica de éxito del piloto, que el propio doc v4 deja pendiente (REQ-EVA-003); decir cómo llega a mujeres sin identificación oficial o que no hablan español |
| Problema y políticas | 25% | 7 | Cifras INEGI con fuente y brechas reales (Ciudad que Cuida: 1,000 apoyos frente a 3,080,632 personas) | La causa raíz escrita es "el cuidado no se registra", que sirve para Puntos Cívicos. Para el banco de tiempo falta un puente: pobreza de tiempo y cuidado concentrado en mujeres dentro del hogar (ENUT: 28.8 h contra 12.9 h) |
| Solución y viabilidad | 20% | 7 | Demo interactiva honesta (rotula lo simulado); sin dinero, el piloto no depende de presupuesto | Responder confianza y seguridad: métodos de verificación, seguro de responsabilidad civil y realismo de 20 transacciones al día, los tres pendientes del doc v4 |
| Storytelling | 15% | 6 | La landing ya trae a Ana y Luis como historia | `docs/pitch-borrador.md` cuenta Puntos Cívicos; hay que reescribirlo para EntreManos y ensayarlo |
| IA responsable | 10% | 6 | El slide existe y es bueno | Su sesgo central (`multiplicadorCarga`, `Q`) es de Puntos Cívicos. Para EntreManos el riesgo es otro: la verificación de identidad puede excluir a mujeres sin documentos, y el tier de dificultad (REQ-BT-010) usa una escala que valida un tercero |
| Total | | ~68 | | ~80 con lo de la última columna |

### Conflictos que siguen abiertos entre documentos del equipo

| Tema | Dice una fuente | Dice otra | Decide |
| --- | --- | --- | --- |
| Venta de datos de fatiga y wearables | Doc fuente v4 (proyección 5 y 10 años), `specs/00` (modelo de capital), `docs/pitch-borrador.md` §5 | `docs/pitch/ia-y-preguntas.md`: no forman parte del modelo; REQ-EVA-043 | Equipo. Si se queda, baja IA responsable |
| Confirmación de horas | Doc v4 y landing: familia cuidada o un tercero | Spike antifraude: doble confirmación por código | Equipo (REQ-BT-003) |
| Volumen del piloto | Doc v4: ~20 transacciones al día | Versión anterior: por semana | Equipo (spec 09) |
| Anexo de Jalisco | PDF del taller de futuros: 20 mil millones | `problema-y-politicas.md`: 118,337,680 MXN para Yo Jalisco, con fuente | Usar la cifra con fuente |
| Nombre | EntreManos (doc v4, landing, URL) | Artefacto "Hora por Hora"; título "CuidaRed" en specs viejos | EntreManos |
