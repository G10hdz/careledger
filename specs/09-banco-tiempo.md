# 09 — Banco de tiempo (`apps/cuidared` prototipo; destino por definir)

Del documento fuente v3: además de los Puntos Cívicos (respaldados por el
municipio, se canjean por beneficios), existe una segunda economía: el
**banco de tiempo**. La hora es la divisa inmutable — "una hora es una hora,
sin importar si es de limpieza o de cuidado médico básico". La cuidadora está
en bancarrota de tiempo: el sistema existe para devolvérselo.

## Dos capas, no una

- **Puntos Cívicos** (specs 01–05): emisión contra validación 3-de-3, canje por
  beneficios públicos/privados, respaldo presupuestario. Dinero social.
- **Banco de tiempo** (esta spec): trueque hora por hora entre personas de la
  comunidad. La cuidadora gana horas cuidando y las gasta en el servicio que
  necesite (terapia, dentista, plomería, estética, jardinería, limpieza,
  mantenimiento — lo que la comunidad ofrezca). La ganancia neta es solo por
  cuidado; el gasto es libre entre servicios disponibles.

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-BT-001 | THE unidad de cuenta SHALL ser la hora: 1 hora de cualquier servicio intercambiable por 1 hora de cualquier otro, sin excepciones, incluidos profesionales (un dentista puede intercambiar limpieza dental por horas de cuidado). | Test de paridad |
| REQ-BT-002 | THE app SHALL mostrar un mapa/directorio de servicios disponibles en la localidad de la cuidadora. | Test + screenshot |
| REQ-BT-003 | THE hora de cuidado SHALL acreditarse con verificación básica: confirmación de la familia cuidada o de un tercero (menos estricto que el oráculo 3-de-3 de `02`; puede reutilizar su atestación). | Test de confirmación |
| REQ-BT-004 | THE sistema SHALL permitir saldo negativo de hasta 5 horas. | Test de saldo |
| REQ-BT-005 | THE comunidad SHALL formarse de dos vías: red de apoyo propia (familia, amigos, vecinos — REQ-ORA-025) o buscador de cuidadores de la localidad. | Test de alta |
| REQ-BT-006 | THE sistema SHALL NOT permitir que servidores públicos ofrezcan sus servicios como intercambio. | Regla de catálogo |
| REQ-BT-007 | THE inyección de liquidez SHALL tener 3 fuentes: (a) voluntariado estratégico — estudiantes que liberan horas de servicio social/prácticas; (b) el familiar ausente que compra "Horas Profesionales" con dinero real y las deposita a la cuidadora; (c) B2B — empresas que donan lotes de horas por deducciones/métricas de impacto. | Test de alta por fuente |
| REQ-BT-008 | THE retiro SHALL cubrir al menos: relevo directo (alguien capacitado cuida al paciente mientras ella descansa) y delegación logística (voluntario hace compras o paga servicios). | Test de flujo |

## Reglas de estandarización de la hora (sesión de diseño 2026-11-07)

| Regla | Valor | Por qué |
| --- | --- | --- |
| Unidad mínima | bloques de 15 min (0.25 h) | evita redondeos y disputas |
| Mínimo por servicio | 30 min | traslados no valen la pena abajo de eso |
| Qué cuenta | tiempo efectivo con check-in y check-out | no cuenta traslado ni espera |
| Prueba | QR o código doble: lo confirman quien da y quien recibe | evita horas inventadas |
| Tope diario por persona | 8 h acreditables | anti-fraude y anti-explotación |
| Tope entre mismas dos cuentas | 20 h/mes | corta colusión de cuentas amigas |
| Caducidad del saldo | 12 a 24 meses | evita acumular sin canjear |
| Disputa | si no coinciden las dos confirmaciones, no acredita y pasa a revisión | simple |

## Piloto

Alcaldía Iztapalapa, ~20 transacciones/día iniciales. Impacto buscado:
romper la idea de que solo las mujeres cuidan (valor comunitario), cualquier
persona/género/idioma ofrece y recibe sin distinción, redes replicables en
cualquier localidad.

## Estado del prototipo

`apps/cuidared/index.html` es un MVP single-file del banco de tiempo
(registrar horas, ganar créditos, pedir apoyo) servido en GitHub Pages como
`docs/cuidared/`. Es demo navegable, no implementación de referencia: las
reglas de arriba son el contrato si se reescribe dentro del monorepo.

## No-goals

- No intercambio de horas por dinero entre pares (la vía monetaria es el
  familiar ausente comprando Horas Profesionales o las propinas de `03`).
- No reputación pública entre miembros en fase inicial.
- No integración contable con el ledger municipal: son economías separadas
  que comparten la atestación de origen, no el libro mayor.
