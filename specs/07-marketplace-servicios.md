# 07 — Marketplace de servicios de cuidado (`apps/servicios`)

Del párrafo nuevo del documento fuente: la plataforma "conecta proveedores de
servicios de cuidado con familias, de acuerdo a tu zona". La familia encuentra
ayuda profesional dentro de su presupuesto, mezclada con la oferta pública.
Es la otra cara de la moneda: la cuidadora gana puntos cuidando, y la familia
también encuentra quién la releva.

## Actores nuevos

- **Familia que busca**: necesita a alguien para su mayor/enfermo; filtra por
  zona y presupuesto.
- **Proveedor de servicios**: médico, terapeuta, fisioterapeuta, enfermera,
  transporte especializado. Publica su oferta por zona con tarifa.
- **Oferta pública**: servicios gratuitos o subsidiados del municipio, listados
  junto a los privados y distinguibles.

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-SER-001 | THE directorio SHALL listar proveedores por zona (colonia/nodo barrial) con cobertura declarada por el propio proveedor. | Test de filtro por zona |
| REQ-SER-002 | THE catálogo SHALL clasificar servicios al menos en: médicos, terapeutas, fisioterapeutas, enfermeras, transporte especializado a citas médicas (adultos mayores / personas con discapacidad). | Test de taxonomía |
| REQ-SER-003 | THE familia SHALL filtrar por presupuesto: declara su rango y el listado muestra primero lo que cabe en él, incluyendo opciones públicas gratuitas. | Test E2E |
| REQ-SER-004 | THE listado SHALL distinguir visualmente oferta pública (gratuita o subsidiada) de privada, sin mezclarlas ambiguamente. | Screenshot |
| REQ-SER-005 | THE perfil de proveedor SHALL mostrar: tipo de servicio, zona de cobertura, tarifa, disponibilidad y certificaciones verificadas por la plataforma. | Test de perfil |
| REQ-SER-006 | WHEN la familia solicita un servicio, THE sistema SHALL enviar la solicitud con tipo de necesidad, zona, presupuesto y horario deseado — sin datos médicos ni diagnósticos. | Test de payload |
| REQ-SER-007 | THE proveedor SHALL poder aceptar o rechazar la solicitud; la familia ve el estado (enviada, aceptada, agendada, completada). | Test de ciclo |
| REQ-SER-008 | WHEN un servicio contratado se completa, THE sistema SHALL poder registrarlo como jornada de cuidado en el ledger si quien lo prestó es cuidadora acreditada (reutiliza `02`). | Test de integración |
| REQ-SER-009 | THE marketplace SHALL ser mobile web (misma PWA base o `apps/servicios`), con la misma exigencia de baja fricción que `01`. | Lighthouse + E2E |
| REQ-SER-010 | THE tarifa de servicios prestados por cuidadoras acreditadas SHALL ser por hora y uniforme en toda la plataforma, sin excepciones ("la hora vale igual para todos los servicios"). La oferta pública mantiene su etiqueta gratuita/subsidiada y no entra a esta regla. | Test de tarifa uniforme |

## Cómo se conecta con la economía

- La contratación de un **asistente de relevo certificado** (beneficio del
  catálogo de `03`, 40 pts) se resuelve por este marketplace: el vale canjeado
  se traduce en una solicitud de servicio a un relevo afiliado.
- Los servicios públicos listados aquí son los mismos nodos que validan
  atestaciones en `02`: coherencia territorial por nodo barrial.

## No-goals

- No pagos entre familia y proveedor dentro de la app en esta fase: se
  solicita y agenda; el cobro queda fuera o vía propinas de `03`.
- No reseñas públicas ni ranking social en fase inicial (evita dinámicas de
  reputación tóxica antes de que haya volumen).
- No bolsa de trabajo generalista: solo servicios de cuidado.
