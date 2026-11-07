# ADR 0003 — Tarifa por hora uniforme en el marketplace

Estado: aceptado · 2026-11-07

## Contexto

La junta de diseño del programa fijó que los servicios prestados por
cuidadoras acreditadas deben cobrarse por hora y con una tarifa **uniforme**:
la hora de cuidado vale igual sin importar quién la preste (REQ-SER-010,
specs/07). La oferta pública gratuita o subsidiada queda fuera de esa regla.

## Decisión

- Los proveedores acreditados muestran una única tarifa por hora, fijada como
  constante de demostración en **`$120 MXN/h`**.
- El monto es configurable: quien integre el programa real lo ajusta en un
  solo lugar y lo documenta en su ADR; lo que la junta fijó como invariante
  es la uniformidad, no el número.
- La oferta pública mantiene su etiqueta `gratuita` / `subsidiada` y se
  muestra visualmente distinta de la privada (REQ-SER-006).

## Consecuencias

- La familia puede comparar ofertas por zona y horario sin ambigüedad de
  precio entre cuidadoras acreditadas.
- Si el programa aterriza una tarifa distinta (por alcaldía, convenio o
  seniority), este ADR se supersede; la uniformidad por cohorte se mantiene.
