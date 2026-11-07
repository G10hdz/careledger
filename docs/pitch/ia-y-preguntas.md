# IA responsable

## Contenido del slide

**Dónde no hay IA y por qué**

- Ningún modelo decide si una cuidadora merece apoyo ni cuántos puntos recibe.
- Los puntos salen de horas validadas por personas. La fórmula es determinística y el consenso exige cuidadora, beneficiario o tutor y veedor.
- No usamos scoring de beneficiarios. La carga describe la dificultad de la tarea, no el valor de una persona.

**Riesgos descartados a propósito**

- Biometría y fotos del domicilio: no se construyeron. Una foto no prueba el cuidado, expone el hogar de un tercero y el liveness por defecto sería biometría.
- Datos médicos en servidor: la atestación se limita a duración, categoría, tipos de apoyo, tiempo, nodo y firmas. No se suben nombres, diagnósticos ni fotos.
- Vigilancia por geolocalización: no se plantea guardar coordenadas crudas. La prueba zero-knowledge tampoco existe hoy.
- Dependencia de un proveedor de CareTech: la emisión actual no depende de un modelo ni de un proveedor de IA.
- Venta de datos de fatiga o deterioro y monitoreo automático por wearables: no forman parte del modelo. Cualquier uso de datos agregados para política pública requeriría anonimización y consentimiento.

**El sesgo que sí debemos vigilar**

El `multiplicadorCarga` traduce tres valoraciones de 0 a 5 a un rango de 1.0 a 1.6 (`packages/domain/src/points.ts:13-21`). El factor `Q` modifica la emisión según el nodo y se limita a 0.85-1.15 (`packages/domain/src/points.ts:9-11,31-32`). Aunque no son IA, pueden reproducir sesgos: una tarea puede valorarse distinto según quién la registra y dos cuidadoras pueden recibir puntos distintos por pertenecer a nodos con historiales diferentes.

La mitigación actual es acotar ambos factores, mantener una fórmula visible y determinística, y probar sus límites (`packages/domain/src/domain.test.ts:21-28`). Antes de usarlos en un piloto real, sus criterios y efectos deben revisarse con cuidadoras y responsables humanos; el repositorio todavía no contiene esa calibración ni un mecanismo de apelación.

**IA futura, solo con revisión humana**

La evaluación agéntica de cursos es una posibilidad futura, no una función actual. Solo podría incorporarse con criterios transparentes, explicación de la calificación y revisión humana antes de afectar certificados o puntos.

# Preguntas del jurado

## 1. ¿Cómo evitan el fraude?

Hoy el dominio exige tres firmas y rechaza emisiones duplicadas por hash. En el demo, beneficiario y veedor todavía usan llaves del mismo teléfono; la detección de colusión, la auditoría aleatoria del 5% y la validación entre dispositivos no están implementadas.

## 2. ¿Cómo protegen la privacidad?

No se construyó la verificación con fotos porque exponía el domicilio sin demostrar que hubo cuidado. La atestación usa datos mínimos y no incluye nombres, diagnósticos, fotos ni geolocalización cruda, pero el aviso de privacidad y la definición formal del responsable de los datos siguen pendientes.

## 3. ¿Quién paga los puntos?

La propuesta para un piloto es que los fondee un Fondo Municipal de Cuidados y que el libro registre el débito al fondo y el crédito a la cuidadora. Ese financiamiento no existe todavía y no lo presentamos como comprometido.

## 4. ¿Esto mercantiliza el cuidado?

No se puntúa el valor de la persona cuidada. Se reconocen horas y dificultad de tareas validadas por la comunidad, y los Puntos Cívicos se canjean por apoyos concretos como transporte, luz o relevo; sigue abierta la discusión pública sobre cómo calibrar esa equivalencia.

## 5. ¿Cómo lograrían adopción?

El producto está planteado para Android de entrada, conectividad intermitente, uso a una mano y recorridos de hasta tres pantallas. La confianza no se da por resuelta: la validación entre dispositivos, el alta de identidad y el aviso de privacidad son pendientes antes de un piloto real.

## 6. ¿Por qué puntos y no dinero?

Los puntos permiten asignar beneficios definidos y llevar una contabilidad separada del dinero familiar; el dominio fija una referencia de 10 MXN por punto y mantiene las propinas en un saldo distinto. No afirmamos que sustituyan un salario ni una transferencia pública: son el mecanismo elegido para este piloto.

## 7. ¿Los resultados que muestran son reales?

No. Las cifras de 53% menos caídas, 94% de satisfacción y SROI de 3.42x son proyecciones metodológicas y deben rotularse como simuladas; el demo tampoco usa datos personales reales.

## 8. ¿Dónde usan IA?

Hoy no usamos IA para validar cuidados, asignar puntos ni decidir sobre una cuidadora. La fórmula es código determinístico y la validación es humana; cualquier evaluación futura de cursos tendría que ser transparente y quedar sujeta a revisión humana.
