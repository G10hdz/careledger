# 08 — Formación y certificados (`apps/pwa`, sección propia)

Del párrafo nuevo del documento fuente: "los cuidadores también podrían
acceder a formación profesional y alfabetización digital con cursos y obtener
certificados". Cierra el círculo con el perfil del doc: la cuidadora es
"persona certificada o busca estarlo" — la plataforma le da el camino.

Vive dentro de `apps/pwa` como sección (la cuidadora ya está ahí); no es app
separada. Mismo estándar de fricción: contenido simple, offline-capable.

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-FOR-001 | THE app SHALL mostrar un catálogo de cursos en dos líneas: formación profesional del cuidado (técnica: movilización, signos vitales, medicación segura) y alfabetización digital (uso del teléfono, trámites en línea). | Test de catálogo |
| REQ-FOR-002 | THE app SHALL llevar progreso por curso (módulos completados/total) persistente offline. | Test de progreso |
| REQ-FOR-003 | WHEN la cuidadora completa un curso, THE sistema SHALL emitir un certificado descargable con folio verificable, nombre del curso y fecha — mismo mecanismo de folio que los vales (`CV-AAAA-NNNN-MX`). | Test de certificado + PDF |
| REQ-FOR-004 | THE app SHALL reflejar el estatus de acreditación de la cuidadora (en proceso / acreditada #ID) en su perfil, alimentado por los certificados obtenidos. | Test de perfil |
| REQ-FOR-005 | THE catálogo SHALL poder marcarse por nivel y duración estimada, para que una cuidadora con 20 minutos libres encuentre algo completable. | Test de metadatos |

## No-goals

- No producción propia de contenido educativo en esta fase: el catálogo enlaza
  o embebe contenido existente; el certificado avala la finalización.
- No puntos por completar cursos en fase inicial (la recompensa es el
  certificado y la acreditación; si se decide después ligarlo a emisión,
  entra por spec update).
- No LMS completo: sin exámenes proctoreados ni foros.
