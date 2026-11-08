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
| REQ-BT-013 | WHEN una persona se dé de alta, THE sistema SHALL verificar su identidad y usar esa verificación como ancla anti-sybil. La modalidad de verificación y su uso para habilitar el saldo negativo de REQ-BT-004 quedan por decidir. | Test de alta y rechazo de identidad duplicada |
| REQ-BT-014 | WHEN una membresía declare necesidad de cuidado, THE sistema SHALL exigir que un tercero valide el tier de REQ-BT-010 sin guardar nombres de pacientes, diagnósticos ni fotos. | Test de alta, tier y minimización de datos |

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
- **BT-003:** confirmación de familia o tercero (doc v4) contra doble confirmación por código (spike). El copy debe seguir lo que se decida.
- **BT-004 y BT-013:** a quién se le permite saldo negativo y qué ancla de
  identidad se acepta en el alta.
- **BT-012:** si todo intercambio debe incluir cuidado y si dos profesionales
  pueden intercambiar entre sí. Ver la tabla de la landing pública.
- **Landing pública:** redactar las respuestas de sus cinco preguntas
  frecuentes. La respuesta sobre confianza debe explicar los niveles N0 a N2
  y el relevo habilitado de REQ-BT-009. El aviso de privacidad requiere
  redacción legal y debe publicarse antes de abrir el registro del piloto.
- **Pendientes del doc v4:** qué pasa con las horas de quien deja la comunidad;
  seguro de responsabilidad civil; tratamiento fiscal.
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
del banco de tiempo; el programa madre es "Cuando cuidas, te descuidas". La
landing de revisión usa "Hora por Hora" (ver tabla abajo).

## Landing pública (Hora por Hora)

Copy de revisión: [`docs/hora-por-hora-landing.md`](../docs/hora-por-hora-landing.md).

### Lo que ya resolvió el copy publicado

El copy en línea (landing EntreManos) ya cambió respecto a la versión de
revisión: dice que confirman las dos partes, reemplaza "Todo intercambio
incluye cuidado" por "Se gana cuidando", responde las cinco preguntas
frecuentes, explica los tres niveles de ayuda y dice que solo se guarda
duración y tipo de apoyo. Ojo: publicar la doble confirmación adelanta una
decisión que REQ-BT-003 todavía marca como del equipo.

### Copy contra spec

| Copy o ausencia | Diferencia real | Resolución propuesta |
| --- | --- | --- |
| "Sin dinero. Las horas no se compran ni se venden" | No contradice la versión vigente de REQ-BT-007. Su inciso (b) es B2B y la compra de horas por familiares ya está fuera. La premisa de una compra familiar vigente está desactualizada. | Mantener el copy. REQ-BT-007 dice "3 fuentes", pero solo enumera dos; corregir el número o definir la fuente faltante queda por decidir. |
| "Todo intercambio incluye cuidado" | REQ-BT-001 permite intercambiar cualquier servicio por cualquier otro, mientras la regla REQ-BT-012 exige cuidado en uno de los lados. El copy adopta la regla más estricta antes de decidirla. | Por decidir (interpretación por confirmar, REQ-BT-012). Si se acepta, armonizar REQ-BT-001 y confirmar REQ-BT-014; mientras tanto, marcarla como propuesta en la landing. |
| "Confirmación de la familia cuidada o de una tercera persona" | Coincide con el texto de doc v4 de REQ-BT-003; la propuesta del spike (doble confirmación, tercero solo desempata) sigue por decidir. | Por decidir con REQ-BT-003. Si gana el spike, cambiar a: "Cada hora se confirma: quien da y quien recibe confirman el intercambio. Si no coinciden, una tercera persona revisa el caso." |
| "Verificamos tu identidad" | No existía un requisito de alta con ancla anti-sybil. | Cubierto por REQ-BT-013. El mecanismo y su relación con el saldo negativo de REQ-BT-004 quedan por decidir. |
| "Necesidad de cuidado comprobada" | No existía un requisito explícito de comprobación y el copy no limita los datos recopilados. | Cubierto por REQ-BT-014: un tercero valida el tier de REQ-BT-010 sin guardar nombres de pacientes, diagnósticos ni fotos. |
| "Información de salud y de tu familia solo se usa para el servicio" | Implica recopilar información de salud, pero REQ-BT-014 exige minimizarla y el aviso de privacidad no está redactado. | Cambiar a: "No guardamos nombres de la persona cuidada, diagnósticos ni fotos. Consulta el aviso de privacidad." No abrir el registro hasta publicar el aviso. |
| Saldo de hasta 5 horas por debajo de cero | El copy lo ofrece sin condición; REQ-BT-004 deja por decidir quién puede usarlo. | Ajustar el copy cuando se resuelva REQ-BT-004. |
| Cuidado de niñas y niños | El copy lo incluye, pero REQ-BT-009 no fija su nivel mínimo de habilitación. | Por decidir antes de publicar el catálogo. |
| Cinco preguntas frecuentes sin respuesta | REQ-WEB-005 exige FAQ con copy de confianza. | Redactarlas antes de publicar. "¿Cómo sé que puedo confiar en quien cuida?" debe explicar REQ-BT-009. |
| No menciona niveles N0 a N2 ni relevo habilitado | Omite la regla de confianza para servicios y cuidado de REQ-BT-009. | Incluirla en la respuesta de confianza de la FAQ. |
| Nombre "Hora por Hora" | El equipo adoptó EntreManos como nombre de producto (spec 00); la landing de revisión usa otro. | Por decidir si se unifica. |

## Estado del prototipo

La demo pública es la landing EntreManos en
`apps/landing/public/cuidared/index.html`: diseño del equipo con el copy de
Hora por Hora, sin Puntos Cívicos ni puntos de autocuidado, y sin las partes
interactivas del demo anterior. En `entremanos-mx.vercel.app` la raíz sirve
esta página (rewrite por host en `apps/landing/next.config.ts`); el otro
dominio conserva la landing de Puntos Cívicos. `/hora-por-hora/` sigue en
línea como versión alterna con su propio diseño. La copia de `docs/cuidared/`
para GitHub Pages está desactualizada.

Es demo navegable, no implementación de referencia: las reglas de arriba son
el contrato si se reescribe dentro del monorepo.

## Métrica del piloto

Ver REQ-EVA-003 en spec 10: horas intercambiadas, horas usadas como relevo,
retención, escala Zarit, disputas y saldo negativo sin devolver.

## No-goals

- No hay dinero en el banco de tiempo (doc v4). Los servicios privados con
  precio viven aparte, en el marketplace (spec `07`).
- No reputación pública entre miembros en fase inicial.
- No integración contable con el ledger municipal: son economías separadas
  que comparten la atestación de origen, no el libro mayor.
