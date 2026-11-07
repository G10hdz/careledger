# 02 — Oráculo vecinal y emisión de puntos (`packages/domain` + `apps/pwa`)

El oráculo reemplaza auditorías estatales lentas por convalidación por pares de
proximidad. Referencia: `design/stitch/validaci_n_c_vica_y_motor_de_impacto/`
y `design/stitch/metodolog_a_de_impacto_sroi_y_auditor_a_c_vica/`
(sección "Gobernanza del Oráculo Barrial").

## Consenso

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-ORA-001 | THE sistema SHALL emitir puntos solo cuando la atestación junta 3 de 3 firmas: cuidadora + beneficiario (o tutor) + veedor comunitario colegiado del nodo barrial. | Test unitario de consenso |
| REQ-ORA-002 | THE sistema SHALL usar firma tripartita Ed25519 sobre el payload canónico {duración, categoría, tipos, sello de tiempo, nodo}; cada firma verificable de forma independiente. | Test de verificación |
| REQ-ORA-003 | WHILE falte una firma, THE atestación SHALL permanecer en estado `pendiente` sin emitir puntos; a las 72h expira a `rechazada` con motivo visible para la cuidadora. | Test de ciclo de vida |
| REQ-ORA-004 | THE sistema SHALL asignar veedores por rotación dentro del nodo barrial; la cuidadora no elige a su veedor. | Test de asignación |
| REQ-ORA-005 | THE sistema SHALL marcar para auditoría atestaciones con patrón de colusión (misma terna repetida >N veces, proximidad imposible, ráfagas de registros). Umbrales N en config, no hardcode. | Test con fixtures de fraude |

## Emisión de puntos

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-ORA-010 | THE emisión SHALL ser determinística: `puntos = horas × 10 × multiplicadorCarga × Q`, redondeado a entero. Base observable en Stitch: 1h→10 pts, 3.5h→35 pts, 14h/semana→140 pts. | Test con casos de oro |
| REQ-ORA-011 | THE `multiplicadorCarga` SHALL computarse de la bitácora de dificultad del beneficiario en 3 ejes: carga física (aseo, movilización), cognitiva/emocional (demencia, terminal, crisis), logística (medicamentos, traslados, burocracia). Rango inicial 1.0–1.6, anclado en `packages/domain`. | Test de matriz 3×3 |
| REQ-ORA-012 | THE `Q` (factor de reputación del nodo) SHALL estar en [0.85, 1.15] y derivarse del historial de validación del nodo, no de auto-reporte. | Test de rango |
| REQ-ORA-013 | THE sistema SHALL emitir puntos por **autocuidado** con la misma fórmula y tope configurable por semana (default 10 pts/semana): hora libre registrada, hidratación/descanso, asistencia a red de apoyo. | Test de emisión + tope |
| REQ-ORA-013b | THE sistema SHALL emitir puntos por **cursos completados** (ver `08`): tabla `COURSE_POINTS` en `packages/domain`, atómica con el certificado, tope por periodo configurable. La base del modelo sigue siendo por hora (10 pts/h) para cuidado y autocuidado; los cursos usan monto fijo por curso aprobado. | Test de emisión por curso |
| REQ-ORA-014 | WHEN el consenso se completa, THE sistema SHALL acreditar en el libro mayor de doble entrada: débito a la partida del Fondo Municipal de Cuidados, crédito a la billetera de la cuidadora, en una sola transacción. | Test de ledger |
| REQ-ORA-015 | THE sistema SHALL generar comprobante con folio único (`CARE-AAAA-NNNN-MX` migrar a `CV-AAAA-NNNN-MX`), hash sha256, sello de tiempo y nodo; verificable offline. | Test de folio/hash |

## Anti-fraude y auditoría

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-ORA-020 | THE sistema SHALL sostener una auditoría muestral aleatoria del 5% de atestaciones por nodo/mes, administrada por la alcaldía. | Test de muestreo determinístico con semilla |
| REQ-ORA-021 | THE sistema SHALL resolver disputas por asamblea del nodo; tasa de disputa objetivo <0.6% de atestaciones. | Métrica en `04` |
| REQ-ORA-022 | THE sistema SHALL NOT almacenar geolocalización cruda; solo prueba de proximidad agregada/zero-knowledge entre los 3 firmantes. | Revisión de esquema de datos |
| REQ-ORA-023 | THE sistema SHALL rechazar emisión duplicada: mismo payload firmado dos veces produce un solo crédito (idempotencia por hash). | Test de idempotencia |
| REQ-ORA-024 | (Diferido, spike pendiente) Verificación foto antes/después de la acción, procesada 100% en el dispositivo: solo sale un hash numérico hacia la base de datos en México (cumplimiento de ley de protección de datos). Bloqueada por complejidad — primero investigar si existe solución ligera disponible (spike de investigación documentado en `docs/`). | Documento del spike |
| REQ-ORA-025 | THE app SHALL dejar que la cuidadora arme su propia red de apoyo registrando a familiares/amigos como posibles firmantes ("forma tu propia comunidad"). Si su red no alcanza, THE app SHALL ofrecer un buscador de comunidad/nodo cercano como primera adhesión. | Test de alta de red + buscador |

## Valor social (SROI por evento)

Cada atestación validada calcula `valorSocial = ahorroClínico + Δbarrio +
Δfamilia` ajustado por descuentos metodológicos (ver `04`). Default por sesión
de 3.5h: $120 USD estimados, visible en el comprobante.

## No-goals

- No consenso público ni minería; el veedor es un rol comunitario acreditado.
- No scoring de beneficiarios: la bitácora de carga mide la tarea, no juzga
  a la persona.
