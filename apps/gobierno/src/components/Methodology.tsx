import { SROI_DEFAULTS } from '@careledger/domain'

const percent = (value: number) => new Intl.NumberFormat('es-MX', { style: 'percent', maximumFractionDigits: 1 }).format(value)
const deduction = SROI_DEFAULTS.deadweight + SROI_DEFAULTS.displacement + SROI_DEFAULTS.attribution
const stages = [
  ['01', 'Insumo', 'Inversión municipal en la red de cuidados.'],
  ['02', 'Actividad', 'Jornadas de cuidado proyectadas en el territorio.'],
  ['03', 'Producto', 'Horas de cuidado que se propone validar en comunidad.'],
  ['04', 'Resultado', 'Beneficios estimados para salud, familias y comercio local.'],
  ['05', 'Impacto neto', 'Valor social después de las deducciones metodológicas.'],
]

export function Methodology() {
  return <>
    <section id="metodologia" className="section report-section">
      <div className="section-head">
        <div><p className="eyebrow">METODOLOGÍA DE IMPACTO</p><h2>De la inversión al valor social</h2><p>Modelo determinístico de demostración. Cadena de resultados basada en el marco de Social Value International.</p></div>
        <span className="tag">MARCO SROI</span>
      </div>
      <div className="stages">{stages.map(([n, title, description]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      <div className="deductions">
        <div><strong>Deducciones metodológicas</strong><p>Se aplican de forma aditiva al valor bruto.</p></div>
        <div className="deduction-values">
          <span>Peso muerto <b>−{percent(SROI_DEFAULTS.deadweight)}</b></span>
          <span>Desplazamiento <b>−{percent(SROI_DEFAULTS.displacement)}</b></span>
          <span>Atribución externa <b>−{percent(SROI_DEFAULTS.attribution)}</b></span>
          <span>Total <b>−{percent(deduction)}</b></span>
        </div>
      </div>
      <div className="card methodology-formula">
        <h3>Formulación del oráculo</h3>
        <p>Valor social neto = horas × (ΔS por hora + ΔC por hora + ΔE por hora) × Q × (1 − peso muerto − desplazamiento − atribución externa).</p>
        <p>Razón SROI = valor social neto / inversión municipal anual en USD. Con las deducciones actuales se conserva el {percent(1 - deduction)} del valor bruto.</p>
      </div>
    </section>
    <section id="origen" className="section report-section">
      <div className="section-head"><div><p className="eyebrow">PROCEDENCIA Y SUPUESTOS</p><h2>Origen de los datos y limitaciones</h2></div></div>
      <div className="card">
        <p><strong>Datos simulados para la demo.</strong> No hay evaluación de campo ni resultados observados. No existe una muestra real, un periodo de medición fechado ni una fuente empírica asociada a estas cifras.</p>
        <p>Los indicadores operativos, los folios y los resultados de Coyoacán son ilustrativos. El IC 95% de 3.28–3.56 y el comparativo +0.28 son ilustrativos: no se han calculado con una muestra ni con un periodo anterior real.</p>
        <h3>Supuestos del cálculo SROI</h3>
        <p>El simulador usa <code>SROI_DEFAULTS</code> de <code>@careledger/domain</code>. Son parámetros de calibración ilustrativos, sin validación de campo.</p>
        <dl className="assumptions-list">
          <div><dt>ΔS: ahorro en salud por hora</dt><dd>{SROI_DEFAULTS.deltaSPerHour} USD</dd></div>
          <div><dt>ΔC: capital social por hora</dt><dd>{SROI_DEFAULTS.deltaCPerHour} USD</dd></div>
          <div><dt>ΔE: reincorporación laboral por hora</dt><dd>{SROI_DEFAULTS.deltaEPerHour} USD</dd></div>
          <div><dt>Q: factor barrial</dt><dd>{SROI_DEFAULTS.qFactor.toFixed(1)}</dd></div>
          <div><dt>Peso muerto</dt><dd>{percent(SROI_DEFAULTS.deadweight)}</dd></div>
          <div><dt>Desplazamiento</dt><dd>{percent(SROI_DEFAULTS.displacement)}</dd></div>
          <div><dt>Atribución externa</dt><dd>{percent(SROI_DEFAULTS.attribution)}</dd></div>
          <div><dt>Distribución por ecosistema</dt><dd>Salud {percent(SROI_DEFAULTS.shares.health)}, familias {percent(SROI_DEFAULTS.shares.family)}, comercio {percent(SROI_DEFAULTS.shares.commerce)}</dd></div>
        </dl>
        <h3>Qué falta para obtener cifras reales</h3>
        <ul>
          <li>Muestra: tamaño, criterios de selección, población y seguimiento con resguardo de privacidad.</li>
          <li>Periodo: fechas de inicio y cierre, línea de base y periodo de comparación.</li>
          <li>Fuente: registros agregados auditables, método de recolección, cálculo del intervalo de confianza y evaluación de los supuestos de atribución.</li>
        </ul>
        <p>La proyección es lineal con las horas y no incorpora incertidumbre estadística. El resultado no demuestra causalidad ni sustituye una evaluación independiente.</p>
        <button type="button" className="no-print" onClick={() => window.print()}>Descargar reporte metodológico (PDF)</button>
        <p className="note no-print">En el diálogo de impresión elige «Guardar como PDF». Incluye metodología, supuestos y escenario actual en USD.</p>
      </div>
    </section>
  </>
}
