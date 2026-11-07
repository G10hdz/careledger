# 04 — Panel de gobierno: SROI, simulador y auditoría (`apps/gobierno`)

Panel para la Secretaría de Bienestar / alcaldía: prueba que cada peso invertido
retorna valor social medible. Referencia:
`design/stitch/metodolog_a_de_impacto_sroi_y_auditor_a_c_vica/` y
`design/stitch/flujo_completo_del_cuidado_c_vico_paso_a_paso/` (sección SROI).

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-GOB-001 | THE panel SHALL mostrar el ratio SROI consolidado con intervalo de confianza 95% y comparativo vs periodo anterior. Valor de diseño: 3.42x (rango 3.28–3.56, +0.28 vs 2024). | Test de render + datos simulados |
| REQ-GOB-002 | THE panel SHALL desglosar el retorno por ecosistema: sistema de salud 48%, economía de cuidados/familias 32%, comercio local 20%. | Test de composición (suma = 100%) |
| REQ-GOB-003 | THE metodología SHALL seguir la cadena Insumo → Actividad → Producto → Resultado → Impacto neto (modelo Social Value International), con deducciones explícitas: peso muerto −18%, desplazamiento −12%, atribución externa −24%. | Test de la fórmula en `packages/domain` |
| REQ-GOB-004 | THE simulador actuarial SHALL aceptar como inputs (sliders): inversión municipal anual y horas de cuidado proyectadas; y SHALL mostrar valor social neto estimado + ratio resultante aplicando los descuentos del REQ-GOB-003. | Test E2E con sliders |
| REQ-GOB-005 | THE panel SHALL mostrar comparativa directa: costo de hospitalización reactiva (1 día cama, $450 USD) vs sesión domiciliaria EntreManos ($35 USD) → ahorro neto por intervención ($120 USD referencia). | Test de UI |
| REQ-GOB-006 | THE panel SHALL mostrar métricas operativas: cuidadoras activas, horas voluntarias registradas, % de atestaciones sin fraude (objetivo ≥99.4%), disputas a asamblea (<0.6%), cobertura de auditoría muestral 5%. | Test con fixtures |
| REQ-GOB-007 | THE libro mayor SHALL ser consultable por folio: cada emisión/canje traza a partida presupuestaria, nodo y hashes de firmas. | Test de consulta |
| REQ-GOB-008 | THE panel SHALL exportar reporte metodológico en PDF (whitepaper) con la formulación econométrica del oráculo. | Test de export |
| REQ-GOB-009 | THE acceso SHALL requerir rol de funcionario autenticado; una cuidadora nunca ve datos agregados de otras ni el libro mayor completo. | Test de autorización |

## Fórmula del oráculo (referencia Stitch V3.82, determinística)

```
Vcívico = [(ΔS_prev + ΔC_barrio + ΔE_fam) × Q_barrial] × (1 − δ_dw − δ_disp − δ_atrib)
```

- ΔS: ahorro en admisiones hospitalarias y ambulancias evitadas
- ΔC: proxy de capital social y seguridad vecinal
- ΔE: reincorporación laboral parcial de cuidadoras
- Q: factor de reputación del nodo [0.85–1.15]
- δ: peso muerto 18%, desplazamiento 12%, atribución 24% (46% agregado)

La implementación vive en `packages/domain/src/sroi.ts` y la comparten el
panel y el comprobante cívico de la PWA.

## No-goals

- No datos individuales de pacientes: el panel solo lee agregados y folios.
- No predicción ML en esta fase: el simulador es determinístico.
