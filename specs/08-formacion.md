# 08 — Formación y certificados (`apps/pwa`, sección propia)

Del párrafo nuevo del documento fuente: "los cuidadores también podrían
acceder a formación profesional y alfabetización digital con cursos y obtener
certificados". Cierra el círculo con el perfil del doc: la cuidadora es
"persona certificada o busca estarlo" — la plataforma le da el camino.

Decisión de la sesión de diseño (nota Granola 2026-11-07, con Caro / Código de
Mujeres en Tech): **completar cursos también emite Puntos Cívicos** — la
formación es una vía de acumulación al par del cuidado y el autocuidado.
El contenido lo diseña la plataforma (modelo propio, no curaduría de links):
temas iniciales cuidado de infancias, aseo/baño del paciente y jerga del
sector. Caro apoya con dudas de contenido por ~2 meses.

Vive dentro de `apps/pwa` como sección (la cuidadora ya está ahí); no es app
separada. Mismo estándar de fricción: contenido simple, offline-capable.

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-FOR-001 | THE app SHALL mostrar un catálogo de cursos en dos líneas: formación profesional del cuidado (técnica: movilización, signos vitales, medicación segura, cuidado de infancias, aseo/baño, jerga del sector) y alfabetización digital (uso del teléfono, trámites en línea). | Test de catálogo |
| REQ-FOR-002 | THE app SHALL llevar progreso por curso (módulos completados/total) persistente offline. | Test de progreso |
| REQ-FOR-003 | WHEN la cuidadora completa un curso, THE sistema SHALL emitir (a) certificado descargable con folio verificable (`CV-AAAA-NNNN-MX`) y (b) puntos al ledger según la tabla de emisión por curso aprobado, atómico con el certificado. | Test de emisión doble |
| REQ-FOR-004 | THE app SHALL reflejar el estatus de acreditación de la cuidadora (en proceso / acreditada #ID) en su perfil, alimentado por los certificados obtenidos. | Test de perfil |
| REQ-FOR-005 | THE catálogo SHALL poder marcarse por nivel y duración estimada, para que una cuidadora con 20 minutos libres encuentre algo completable. | Test de metadatos |
| REQ-FOR-006 | THE evaluación de cada curso SHALL tener respuestas verificables de forma determinística (opción múltiple/verdadero-falso con clave); cualquier evaluación abierta con modelo SHALL pasar por revisión agéntica con refutador (generator/evaluator) para evitar alucinaciones, y sus criterios viven versionados junto al curso. | Test de evaluaciones + prompt del evaluador en repo |
| REQ-FOR-007 | THE emisión por curso SHALL declararse en `packages/domain` (tabla `COURSE_POINTS`), tope configurable por periodo para evitar farming. | Test de tabla + tope |

## No-goals

- No LMS completo: sin exámenes proctoreados ni foros.
- No certificaciones oficiales del estado en esta fase: el certificado avala
  finalización dentro de la plataforma (la acreditación formal puede venir de
  convenios posteriores).
