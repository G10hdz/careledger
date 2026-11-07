# 09: Banco de tiempo EntreManos (demo en `apps/landing/public/cuidared/`)

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
  mantenimiento, lo que la comunidad ofrezca). Sin dinero de por medio (doc
  v4). La moneda es la hora de cuidado: una profesión u oficio solo se
  intercambia por horas de cuidado, nunca oficio por oficio.

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-BT-001 | THE unidad de cuenta SHALL ser la hora: 1 hora de cualquier servicio intercambiable por 1 hora de cualquier otro, sin excepciones, incluidos profesionales (un dentista puede intercambiar limpieza dental por horas de cuidado). | Test de paridad |
| REQ-BT-002 | THE app SHALL mostrar un mapa/directorio de servicios disponibles en la localidad de la cuidadora. | Test + screenshot |
| REQ-BT-003 | THE hora de cuidado SHALL acreditarse con verificación básica: confirmación de la familia cuidada o de un tercero (doc v4). **Propuesta del spike, por decidir con el equipo:** doble confirmación por código de quien da y quien recibe, con el tercero solo para desempatar. | Test de confirmación |
| REQ-BT-004 | THE sistema SHALL permitir saldo negativo de hasta 5 horas. **Por decidir:** a quién se le permite (solo identidad validada en el alta, o con aval de la red de apoyo). Sin ancla de identidad, una cuenta nueva recibe servicio y desaparece. | Test de saldo |
| REQ-BT-005 | THE comunidad SHALL formarse de dos vías: red de apoyo propia (familia, amigos, vecinos — REQ-ORA-025) o buscador de cuidadores de la localidad. | Test de alta |
| REQ-BT-006 | THE sistema SHALL NOT permitir que servidores públicos ofrezcan sus servicios como intercambio. | Regla de catálogo |
| REQ-BT-007 | THE inyección de liquidez SHALL tener 3 fuentes: (a) voluntariado estratégico — estudiantes que liberan horas de servicio social/prácticas; (b) B2B, empresas que donan lotes de horas por deducciones o métricas de impacto. La compra de horas con dinero por el familiar ausente (doc v1) queda fuera: el doc v4 fija "sin dinero de por medio". | Test de alta por fuente |
| REQ-BT-008 | THE retiro SHALL cubrir al menos: relevo directo (alguien con nivel N1 o superior cuida al paciente mientras ella descansa) y delegación logística (voluntario hace compras o paga servicios). | Test de flujo |
| REQ-BT-009 | THE catálogo SHALL asignar a cada servicio un nivel mínimo de habilitación: N0 sin requisito (compañía, compras, trámites, aseo, jardinería), N1 capacitación básica (movilización, comida asistida, medicamentos simples), N2 certificado o profesional (enfermería, terapia, odontología, fisioterapia). La hora vale lo mismo en todos los niveles; el nivel solo decide quién puede ofrecer qué. | Test de catálogo |
| REQ-BT-011 | THE sistema SHALL tener dos tipos de membresía (doc v4, opción B): demandante, que necesita cuidado para un familiar dependiente y puede ofrecer su profesión u oficio; y vecino cuidador, sin familiar dependiente, que ofrece horas de cuidado y las intercambia por el oficio o profesión de un demandante. | Test de alta |
| REQ-BT-012 | THE sistema SHALL rechazar un intercambio sin cuidado en ninguno de los dos lados: no hay oficio por oficio. **Interpretación por confirmar con el equipo** (doc v4): cambia si dos profesionales pueden intercambiar entre sí. | Test de intercambio |
| REQ-BT-010 | THE persona cuidada SHALL tener un tier de dificultad 1 a 3 (carga física, cognitiva/emocional y logística, 0 a 2 cada una, medido con escala funcional y validado por un tercero). El tier solo afecta el emparejamiento (nivel mínimo del relevo) y la prioridad en la lista de relevo. SHALL NOT alterar el valor de la hora ni emitir créditos: la dificultad ya se paga en Puntos Cívicos vía `multiplicadorCarga` (REQ-ORA-011). | Test de emparejamiento |

## Reglas de estandarización de la hora (sesión de diseño 2026-11-07)

| Regla | Valor | Por qué |
| --- | --- | --- |
| Unidad mínima | bloques de 15 min (0.25 h) | evita redondeos y disputas |
| Mínimo por servicio | 30 min | traslados no valen la pena abajo de eso |
| Qué cuenta | tiempo efectivo con check-in y check-out | no cuenta traslado ni espera |
| Prueba | QR o código doble: lo confirman quien da y quien recibe | evita horas inventadas |
| Tope diario por persona | 8 h acreditables | anti-fraude y anti-explotación |
| Tope entre mismas dos cuentas | 20 h/mes | corta colusión de cuentas amigas |
| Caducidad del saldo | 12 meses (propuesta; antes decía 12 a 24, que no se puede probar) | evita acumular sin canjear |
| Disputa | si no coinciden las dos confirmaciones, no acredita y pasa a revisión. **Por decidir:** quién revisa y en cuánto tiempo | simple |

## Verificación por riesgo

Las horas entre pares suman cero (+1 a quien da, -1 a quien recibe), así que
el incentivo de falsificarlas es bajo. El riesgo está en lo que inyecta
liquidez (REQ-BT-007) y en las cuentas múltiples. Detalle de capas y
descartes en `docs/spike-verificacion-antifraude.md`.

Para el piloto bastan:

- Una cuenta por dispositivo, con identidad validada en el alta.
- Doble confirmación de cada hora (REQ-BT-003).
- Los topes de la tabla.

Play Integrity, NFC en domicilio y liveness se activan al crecer, no antes.

## Por decidir

- **Doble emisión:** si una sesión de cuidado da puntos (spec `02`) y además
  horas, quién financia cada una. La spec dice que comparten la atestación de
  origen pero no aclara si el crédito es doble.
- **BT-004:** a quién se le permite saldo negativo.
- **BT-003:** confirmación de familia o tercero (doc v4) contra doble confirmación por código (spike).
- **BT-012:** si dos profesionales pueden intercambiar entre sí.
- **Pendientes del doc v4:** métodos concretos para verificar dependencia y horas; qué pasa con las horas de quien deja la comunidad; seguro de responsabilidad civil; métrica de éxito del piloto más allá del volumen; tratamiento fiscal y aviso de privacidad para datos de salud.
- **Disputas:** responsable y plazo.
- **BT-006:** cómo se verifica que alguien es servidor público (hoy es
  autodeclaración en el catálogo).

## Piloto

Alcaldía Iztapalapa. El doc v4 del equipo dice ~20 transacciones **al día**
al inicio y deja pendiente qué tan realista es, porque implica un mínimo de
participantes activos; una versión anterior decía por semana. **Por decidir.**
El equipo de 5 personas coordina el grupo piloto. Impacto buscado:
romper la idea de que solo las mujeres cuidan (valor comunitario), cualquier
persona/género/idioma ofrece y recibe sin distinción, redes replicables en
cualquier localidad.

## Nombre

El doc v4 propone **EntreManos** como nombre de la app, adoptado como nombre
de producto (ver spec 00). `CuidaRed` queda como nombre interno del prototipo
del banco de tiempo; el programa madre es "Cuando cuidas, te descuidas".

## Estado del prototipo

La demo pública es la landing EntreManos del equipo, en
`apps/landing/public/cuidared/index.html` (copia en `docs/cuidared/` para
GitHub Pages). Reemplazó al MVP CuidaRed, que sigue en el historial de git.
Es demo navegable, no implementación de referencia: las reglas de arriba son
el contrato si se reescribe dentro del monorepo.

## No-goals

- No hay dinero en el banco de tiempo (doc v4). Los servicios privados con
  precio viven aparte, en el marketplace (spec `07`).
- No reputación pública entre miembros en fase inicial.
- No integración contable con el ledger municipal: son economías separadas
  que comparten la atestación de origen, no el libro mayor.
