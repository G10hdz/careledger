# 10: Pitch y evaluación (Build for Her 2026)

Qué se presenta al jurado y con qué evidencia. Fuente: rúbrica oficial del
evento (5 criterios ponderados, puntaje 0 a 100, más un criterio de
desempate).

Esta spec no agrega código. El código está congelado desde la auditoría del
2026-11-07: el producto ya cubre el criterio de solución, y el 55% del puntaje
(impacto + problema) se gana en el pitch.

| # | Criterio | Peso | REQs |
| --- | --- | --- | --- |
| 1 | Impacto en las mujeres y comunidades | 30% | REQ-EVA-001..004 |
| 2 | Comprensión del problema y análisis de políticas | 25% | REQ-EVA-010..013 |
| 3 | Calidad y viabilidad de la solución | 20% | REQ-EVA-019..024 |
| 4 | Presentación y storytelling | 15% | REQ-EVA-030..032 |
| 5 | Uso responsable de la IA | 10% | REQ-EVA-040..043 |
| ★ | Innovación (solo desempate) | 0% | REQ-EVA-050 |

## Requisitos (EARS)

### Impacto (30%)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-EVA-001 | THE pitch SHALL nombrar a la beneficiaria primaria (cuidadora familiar no remunerada de una persona con dependencia, CDMX) y a las secundarias (persona cuidada, veedora, comercio del barrio), y decir qué cambia para cada una. | Slide de beneficiarias |
| REQ-EVA-002 | THE pitch SHALL mostrar cómo llega a mujeres en distintas realidades, citando solo lo que el producto ya cumple: sin datos (REQ-PWA-002), Android de entrada, uso a una mano (REQ-PWA-013), ≤3 pantallas (REQ-PWA-001), WCAG AA y selector ES/NAH (REQ-PWA-010). | Slide + demo |
| REQ-EVA-003 | THE pitch SHALL proponer métricas medibles en un piloto: horas certificadas por cuidadora al mes, porcentaje de puntos ganados por autocuidado, carga de la cuidadora con la escala Zarit (línea base y a 3 meses) y canjes por categoría. | Slide de métricas |
| REQ-EVA-004 | THE pitch SHALL explicar la escala: el nodo barrial es la unidad de despliegue y el modelo se replica en cualquier municipio con fondo o anexo de cuidados. | Slide de escala |

### Problema y políticas (25%)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-EVA-010 | THE pitch SHALL respaldar el problema con al menos 2 cifras de fuentes oficiales, con la fuente al pie (candidatas: INEGI ENASIC 2022, Cuenta Satélite del Trabajo No Remunerado de los Hogares, ENUT). Ninguna cifra va sin fuente ni se cita de memoria; esto incluye el "99% de la HealthTech mira al paciente" del borrador de pitch. | Slide con fuentes |
| REQ-EVA-011 | THE pitch SHALL separar síntoma de causa: el síntoma es el agotamiento de la cuidadora; la causa raíz es que el cuidado informal no se registra, y sin registro el Estado no puede focalizar, pagar ni auditar apoyos. | Slide de causa raíz |
| REQ-EVA-012 | THE pitch SHALL nombrar los programas existentes y la brecha de cada uno: Sistema Público de Cuidados CDMX, transferencia de 6,000 MXN anuales para altísima dependencia, reforma al Art. 4 (derecho al cuidado), anexo transversal de Jalisco, y Chile Cuida como referencia de registro. Montos y vigencia se verifican contra la fuente oficial antes del pitch. | Slide de políticas |
| REQ-EVA-013 | THE pitch SHALL mostrar el mapa de actores: gobierno (alcaldía, Secretaría de Bienestar), comunidad (veedoras, nodo barrial), mercado (comercios, farmacias) y sociedad civil. | Diagrama de actores |

### Solución (20%)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-EVA-019 | THE equipo SHALL elegir una sola economía como historia principal: Puntos Cívicos (specs 00 a 05) o banco de tiempo (spec 09, nombre propuesto EntreManos). La otra va en una slide de visión. | Decisión escrita en el guion |
| REQ-EVA-020 | THE demo SHALL recorrer en vivo un solo flujo en ≤90 s sobre URL pública. Para Puntos Cívicos: registro, validación 3 de 3, saldo, vale QR y cobro en la terminal de comercios (verificado de punta a punta en PR #18). Para banco de tiempo: el prototipo de GitHub Pages (`docs/cuidared/`). | Ensayo cronometrado |
| REQ-EVA-021 | IF la red o el deploy fallan durante el pitch, THEN el equipo SHALL mostrar un video o capturas del mismo flujo grabados antes. | Video en la carpeta del pitch |
| REQ-EVA-022 | THE pitch SHALL decir quién paga: Fondo Municipal de Cuidados en un piloto, sin afirmar que ese financiamiento ya existe. El modelo mixto de `00` va en una línea. | Slide de modelo |
| REQ-EVA-023 | THE pitch SHALL anticipar barreras de adopción y su respuesta: conectividad (offline), confianza (sin datos médicos, REQ-PWA-011), fraude (oráculo 3 de 3 y `docs/spike-verificacion-antifraude.md`) y alfabetización digital (≤3 pantallas). | Slide de barreras |
| REQ-EVA-024 | THE pitch SHALL cerrar con un próximo paso concreto: piloto de 3 meses en un nodo de una alcaldía, medido con REQ-EVA-003. Servicios, formación, WhatsApp y la economía no elegida en REQ-EVA-019 aparecen como máximo en una slide de visión. | Slide de cierre |

### Storytelling (15%)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-EVA-030 | THE pitch SHALL contar la historia de una sola cuidadora ficticia (sin datos de personas reales), con inicio, desarrollo y cierre, y usar "Cuando cuidas, te descuidas" como hilo. | Guion |
| REQ-EVA-031 | THE pitch SHALL respetar el tiempo que fije la organización, con al menos un ensayo cronometrado completo. | Ensayo |
| REQ-EVA-032 | THE equipo SHALL llevar respuesta preparada a por lo menos 8 preguntas del jurado: fraude, privacidad, quién paga, si mercantiliza el cuidado, adopción, por qué puntos y no dinero, datos simulados, uso de IA. | Banco de preguntas |

### IA responsable (10%)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-EVA-040 | THE pitch SHALL decir dónde no hay IA y por qué: ningún modelo decide sobre la cuidadora; los puntos salen de horas validadas por personas (oráculo vecinal), no de una puntuación algorítmica. | Slide de IA |
| REQ-EVA-041 | THE pitch SHALL nombrar los riesgos descartados a propósito y su mitigación: biometría y fotos del domicilio (spike antifraude), datos médicos en servidor (NG-2), vigilancia por geolocalización (NG-3), escenario de apagón de un proveedor de CareTech (forecast del taller). | Slide de IA |
| REQ-EVA-042 | WHERE la IA entre en fases futuras (evaluación agéntica de cursos, REQ-FOR-006), THE pitch SHALL condicionarla a revisión humana y a transparencia sobre cómo califica. | Slide de visión |
| REQ-EVA-043 | THE pitch SHALL NOT presentar la venta de datos de fatiga o deterioro de la cuidadora a aseguradoras o gobiernos, ni el monitoreo automático por wearables, como modelo de negocio. Los datos agregados y anónimos para política pública sí, con consentimiento. | Revisión del guion |

### Desempate

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-EVA-050 | THE pitch SHALL nombrar los diferenciadores: se ganan puntos por autocuidado, la validación es vecinal y no burocrática, y la plataforma mira a quien cuida, no al paciente. | Slide de propuesta de valor |

## Integridad de datos

- Los datos simulados se rotulan como proyección metodológica: −53% caídas,
  94% satisfacción y SROI 3.42x (ver roadmap).
- Ni las slides ni el demo llevan nombres, direcciones ni folios de personas
  reales.

## Fuera de alcance

- Cambios de código para el pitch. Si el demo falla, se aplica REQ-EVA-021 y
  no se parcha en vivo.
- Features nuevas en cualquier app hasta después del 2026-11-07.
