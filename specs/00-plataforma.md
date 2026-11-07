# 00 — Cuando cuidas, te descuidas: plataforma

La spec manda. Lo que no está en `specs/` no se construye.

## Qué es

Plataforma mobile web que **visibiliza la economía del cuidado e incentiva a
quienes cuidan**. Dos brazos:

1. **Puntos Cívicos**: certifica las horas de cuidado informal y las convierte
   en vales canjeables por beneficios concretos: subsidios de luz, agua,
   transporte (público y especializado a citas médicas), guarderías, horas de
   relevo certificado y comercios del barrio.
2. **Marketplace de servicios**: conecta a las familias con proveedores de
   cuidado por zona y presupuesto — médicos, terapeutas, fisioterapeutas,
   enfermeras — mezclando oferta privada y servicios públicos. Además, la
   cuidadora accede a formación profesional y alfabetización digital con
   certificados.

Tesis del documento fuente (`docs/fuente-cuando-cuidas-te-descuidas.md`):
"cuando cuidas, te descuidas". El 99% de la HealthTech mira al paciente; esta
plataforma mira a la persona que cuida. No es caridad: es reconocimiento
económico de trabajo no remunerado que hoy es invisible.

Nombre de la unidad de cuenta: **Puntos Cívicos** (pts). El prototipo Stitch usó
`$CARE`; el sistema se migró a Puntos Cívicos para no confundirse con
criptoactivos. No es una criptomoneda: es un vale municipal de contabilidad
doble entrada, respaldado por partida presupuestaria.

## Personas

| Persona | Quién es | Qué necesita |
| --- | --- | --- |
| Cuidadora | ~38 años, certificada o en proceso, "generación sándwich" (cuida hijos/hogar y a un mayor o enfermo). Mayoría mujeres; no exclusivo. | Registrar sin fricción (cero esfuerzo cognitivo), validación sin burócratas, beneficios reales para ella. |
| Beneficiario | Persona cuidada: familiar dependiente, vecino adulto mayor, infancia comunitaria. | Solo atestiguar; sus datos médicos nunca se suben. |
| Veedor comunitario | Vecina acreditada o promotora de salud del nodo barrial. | Confirmar jornadas con un toque; sin papeleo. |
| Familiar ausente | Pariente que no ayuda físicamente pero tiene dinero. | Fondear la cuenta de la cuidadora / mandar propinas. |
| Comercio aliado | Panadería, farmacia, frutería, cooperativa, estética, gimnasio/deportivo, tienda del barrio. | Cobrar vales con QR/folio y liquidar por SPEI en 24h, 0% comisión. |
| Funcionario municipal | Secretaría de Bienestar / alcaldía. | SROI auditable, simulador actuarial, libro mayor trazable. |
| Familia que busca | Núcleo que necesita apoyo profesional para su mayor/enfermo. | Encontrar proveedores por zona y presupuesto, incluida oferta pública. |
| Proveedor de servicios | Médico, terapeuta, fisioterapeuta, enfermera, transporte especializado. | Publicar oferta por zona, recibir solicitudes claras, cobrar. |

## Flujo de valor (4 fases)

1. **Hogar** — la cuidadora registra la jornada (offline, <60s, firma local).
2. **Comunidad** — el oráculo vecinal valida 3-de-3 (cuidadora + beneficiario +
   veedor) y se emiten puntos: 10 pts/hora base × multiplicador de carga.
3. **Salud pública** — cada sesión preventiva ahorra al sistema (~$120 USD por
   jornada de 3.5h vs $450 USD por urgencias evitadas).
4. **Recompensa** — la cuidadora canjea puntos por subsidios reales; el fondo
   municipal liquida a comercios por SPEI.

El diferencial del documento fuente: **los puntos también se ganan por
autocuidado** — registrar tiempo libre, hidratación, asistencia a red de apoyo.
Se ataca el deterioro de la cuidadora, no solo se paga su trabajo. Esto es
obligatorio en el modelo de puntos, no opcional. Y por decisión de diseño
(nota Granola 2026-11-07): **también por completar cursos** — la formación es
la tercera vía de acumulación (tabla `COURSE_POINTS` en `packages/domain`).

Doc v3 agrega una segunda economía en paralelo: el **banco de tiempo**
(spec `09`) — trueque hora por hora entre la comunidad, donde la cuidadora
gasta su saldo en relevo directo o delegación logística. Comparte la
atestación de origen con el ledger municipal pero no el libro mayor.

## Modelo de capital

- Fondo Municipal de Cuidados (partida presupuestaria) respalda cada punto.
- Comisión transaccional sobre propinas de la red familiar.
- CPA/afiliados B2B: farmacias e insumos compran acceso a demanda segmentada.
- Licencias corporativas: RRHH compra la plataforma como prestación anti-burnout.
- Proyección 5a: aseguradoras pagan suscripciones; el ranking de dificultad se
  vuelve estándar. 10a: integración con wearables; data para política pública.

## Territorios de producto (un agente por territorio)

| Spec | App | Qué cubre |
| --- | --- | --- |
| `01-pwa-cuidadora.md` | `apps/pwa` | Registro offline, autocuidado, cola de sync, accesibilidad |
| `02-oraculo-vecinal.md` | `packages/domain` + `apps/pwa` | Consenso 3-firmas, emisión de puntos, anti-fraude |
| `03-billetera-canje.md` | `apps/pwa` | Saldo, catálogo, vales QR offline, propinas |
| `04-panel-gobierno.md` | `apps/gobierno` | SROI, simulador actuarial, libro mayor |
| `05-comercios.md` | `apps/comercios` | Afiliación, terminal de cobro, liquidación SPEI |
| `06-landing.md` | `apps/landing` | Narrativa pública, matriz de canje, FAQ |
| `07-marketplace-servicios.md` | `apps/servicios` | Directorio por zona, presupuesto, oferta pública+privada |
| `08-formacion.md` | `apps/pwa` (sección) | Cursos, progreso, certificados con folio |
| `09-banco-tiempo.md` | `apps/cuidared` | Trueque hora por hora, red de apoyo, liquidez externa |

`packages/domain` es el contrato compartido (tipos + matemática de puntos y
SROI). `packages/design-tokens` es el tema Tailwind v4 sacado de
`design/DESIGN.md`. Referencia visual: `design/stitch/*/code.html` + `screen.png`.

## Definición de "hecho" por fase

Ver `specs/roadmap.md`. Una fase está hecha cuando sus REQs tienen evidencia:
tests del dominio + QA de la app + screenshots por pantalla.

## No-goals

- **NG-1** No blockchain público ni exchange de puntos. Los puntos son vales
  de contabilidad doble entrada, no tokens especulativos.
- **NG-2** No datos médicos en servidores. Solo se certifica tiempo y tipo de
  apoyo; nunca diagnósticos, nombres de pacientes ni fotos íntimas.
- **NG-3** No vigilancia. La geolocalización se usa como prueba de proximidad
  agregada (zero-knowledge), no tracking continuo.
- **NG-4** No nómina ni relación laboral con el gobierno; es reconocimiento
  cívico, no empleo.
- **NG-5** No app nativa: es PWA. Entry-level Android con plan de datos
  intermitente es el dispositivo objetivo.
- **NG-6** No mensajería entre usuarias en fase inicial.

## Riesgos del documento fuente (hay que responder en specs)

- **Fricción:** si reclamar puntos exige muchos clics, desinstalan día uno →
  REQ-PWA-001 fija ≤60s y ≤3 pantallas por registro.
- **Fraude:** si mentir es fácil, el punto colapsa → `02-oraculo-vecinal.md`
  fija consenso 3-firmas + auditoría muestral 5% + anti-colusión.
- **Sostenibilidad:** los descuentos cuestan dinero → `00` fija el modelo de
  capital mixto; `04` hace el SROI auditable para justificar la partida.
