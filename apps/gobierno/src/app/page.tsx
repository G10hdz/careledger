'use client'

import { useEffect, useState } from 'react'
import { SROI_DEFAULTS } from '@careledger/domain'
import { Ledger } from '../components/Ledger'
import { Methodology } from '../components/Methodology'
import { metrics } from '../lib/fixtures'
import { parseScenario, SCENARIO_LIMITS, sessionSavings, simulate } from '../lib/simulator'

const number = new Intl.NumberFormat('es-MX')
const usd = (value: number) => '$' + number.format(Math.round(value))
const initialScenario = parseScenario('')
const reference = simulate(initialScenario.investment, initialScenario.hours)
const sections = [
  ['inicio', 'Resumen ejecutivo'],
  ['metodologia', 'Metodología SROI'],
  ['origen', 'Origen de los datos'],
  ['simulador', 'Simulador actuarial'],
  ['ledger', 'Libro mayor'],
] as const

export default function Home() {
  const [scenario, setScenario] = useState(initialScenario)
  const [ready, setReady] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('inicio')
  const [copyStatus, setCopyStatus] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const { investment, hours } = scenario
  const result = simulate(investment, hours)
  const ecosystems = [
    ['Sistema de salud', SROI_DEFAULTS.shares.health, result.breakdown.health, 'health'],
    ['Familias y cuidados', SROI_DEFAULTS.shares.family, result.breakdown.family, 'family'],
    ['Comercio local', SROI_DEFAULTS.shares.commerce, result.breakdown.commerce, 'commerce'],
  ] as const

  useEffect(() => {
    const readLocation = () => setScenario(parseScenario(window.location.search))
    readLocation()
    setReady(true)
    window.addEventListener('popstate', readLocation)
    return () => window.removeEventListener('popstate', readLocation)
  }, [])

  useEffect(() => {
    if (!ready) return
    const url = new URL(window.location.href)
    url.searchParams.set('inversion', String(investment))
    url.searchParams.set('horas', String(hours))
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    setCopyStatus('')
  }, [investment, hours, ready])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = simulate(investment, hours)
      setAnnouncement('Escenario simulado: inversión ' + usd(investment) + ' USD, ' + number.format(hours) +
        ' horas. Valor social neto estimado ' + usd(current.net) + ' USD. Razón SROI ' + current.ratio.toFixed(2) + ' por dólar invertido.')
    }, 500)
    return () => window.clearTimeout(timer)
  }, [investment, hours])

  useEffect(() => {
    let frame = 0
    const trackVisibleSection = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const visible = [...sections].reverse().find(([id]) => {
          const element = document.getElementById(id)
          return element && element.getBoundingClientRect().top <= 140
        })
        const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
        setActiveSection(atEnd ? 'ledger' : visible?.[0] ?? 'inicio')
      })
    }
    const readHash = () => {
      const id = window.location.hash.slice(1)
      if (sections.some(([section]) => section === id)) setActiveSection(id)
      else trackVisibleSection()
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    window.addEventListener('scroll', trackVisibleSection, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', readHash)
      window.removeEventListener('scroll', trackVisibleSection)
    }
  }, [])

  async function copyScenario() {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('inversion', String(investment))
      url.searchParams.set('horas', String(hours))
      await navigator.clipboard.writeText(url.href)
      setCopyStatus('Enlace del escenario copiado.')
    } catch {
      setCopyStatus('No se pudo copiar. Copia el enlace desde la barra de direcciones.')
    }
  }

  return <div className="app">
    <aside className="sidebar">
      <a href="#inicio" className="brand"><span className="brand-icon">✳</span><span>EntreManos<small>INTELIGENCIA CÍVICA</small></span></a>
      <div className="side-label">PANEL DE GOBIERNO</div>
      <nav aria-label="Secciones del panel">{sections.map(([id, title]) =>
        <a key={id} href={'#' + id} aria-current={activeSection === id ? 'location' : undefined}>{title}</a>
      )}</nav>
      <div className="side-bottom">Secretaría de Bienestar<br/><strong>Panel de demostración</strong></div>
    </aside>
    <main>
      <header className="topbar"><span>SECRETARÍA DE BIENESTAR <b>/</b> IMPACTO PÚBLICO</span><span className="demo">DATOS SIMULADOS</span></header>
      <div className="content">
        <div id="inicio" className="intro">
          <div><p className="eyebrow">ESCENARIOS PARA DECISIONES PÚBLICAS</p><h1>El valor del cuidado,<br/><span>visible para todos.</span></h1><p>Proyecciones y trazabilidad de demostración. Ninguna cifra representa un resultado observado.</p></div>
          <div className="period"><span>PERIODO ILUSTRATIVO</span><strong>Demo municipal</strong><small>Sin evaluación de campo</small></div>
        </div>
        <section aria-label="Indicadores principales" className="kpis">
          <article className="card featured">
            <div className="card-label">RETORNO SOCIAL DE REFERENCIA</div>
            <div className="big">{reference.ratio.toFixed(2)}<span>x</span></div>
            <p>Escenario simulado: {usd(initialScenario.investment)} USD y {number.format(initialScenario.hours)} horas.</p>
            <div className="card-foot"><span>Ilustrativo: IC 95% · 3.28–3.56</span><strong>Ilustrativo: +0.28 vs. periodo anterior</strong></div>
          </article>
          <article className="card"><div className="card-label">CUIDADORAS ACTIVAS · ILUSTRATIVO</div><div className="metric">{number.format(metrics.caregivers)}</div><p>Participación ficticia en la red de cuidados.</p><div className="card-foot">ALCANCE ILUSTRATIVO</div></article>
          <article className="card"><div className="card-label">HORAS REGISTRADAS · ILUSTRATIVO</div><div className="metric">{number.format(metrics.hours)}</div><p>Horas ficticias de cuidado en la demo.</p><div className="card-foot">ACTIVIDAD ILUSTRATIVA</div></article>
          <article className="card"><div className="card-label">VALIDACIÓN SIN FRAUDE · ILUSTRATIVO</div><div className="metric">{metrics.validation}%</div><p>Porcentaje de demostración, sin medición de fraude.</p><div className="card-foot">OBJETIVO ILUSTRATIVO ≥ 99.4%</div></article>
        </section>
        <Methodology/>
        <section id="simulador" className="section">
          <div className="section-head">
            <div><p className="eyebrow">PLANEACIÓN PRESUPUESTARIA</p><h2>Simulador actuarial</h2><p>Explora un escenario determinístico. Inversión y valor social en dólares estadounidenses (USD).</p></div>
            <span className="tag">PROYECCIÓN</span>
          </div>
          <div className="simulation">
            <div className="card controls">
              <h3>Parámetros de inversión</h3><p>Ajusta las variables para estimar el valor social neto.</p>
              <div className="scenario-sticky" aria-label="Resultado del escenario actual">
                <span>Valor social neto estimado <strong>{usd(result.net)} USD</strong></span>
                <span>Razón SROI <strong>{result.ratio.toFixed(2)}x</strong></span>
              </div>
              <label htmlFor="investment"><span>Inversión municipal anual</span><strong>{usd(investment)} USD</strong></label>
              <input id="investment" type="range" min={SCENARIO_LIMITS.investment.min} max={SCENARIO_LIMITS.investment.max} step={SCENARIO_LIMITS.investment.step} value={investment} disabled={!ready} aria-valuetext={usd(investment) + ' USD'} onChange={e => setScenario({ ...scenario, investment: Number(e.target.value) })}/>
              <div className="range"><span>$100 mil USD</span><span>$5 millones USD</span></div>
              <label htmlFor="hours"><span>Horas de cuidado proyectadas</span><strong>{number.format(hours)} h</strong></label>
              <input id="hours" type="range" min={SCENARIO_LIMITS.hours.min} max={SCENARIO_LIMITS.hours.max} step={SCENARIO_LIMITS.hours.step} value={hours} disabled={!ready} aria-valuetext={number.format(hours) + ' horas'} onChange={e => setScenario({ ...scenario, hours: Number(e.target.value) })}/>
              <div className="range"><span>0 horas</span><span>200 mil horas</span></div>
              <div className="scenario-actions">
                <button type="button" disabled={!ready} onClick={copyScenario}>Copiar enlace del escenario</button>
                <button type="button" disabled={!ready} onClick={() => { setScenario(initialScenario); setCopyStatus('') }}>Restablecer</button>
              </div>
              <p role="status">{copyStatus}</p>
              <div className="assumption">El modelo aplica los supuestos de SROI_DEFAULTS descritos en <a href="#origen">Origen de los datos y limitaciones</a>. Es una estimación, sin evaluación de campo.</div>
            </div>
            <div className="simulation-right">
              <div className="result">
                <span>VALOR SOCIAL NETO ESTIMADO</span><strong>{usd(result.net)} <small>USD</small></strong>
                <div><span>RETORNO POR DÓLAR INVERTIDO</span><b>{result.ratio.toFixed(2)}x</b></div>
              </div>
              <div className="card ecosystem">
                <h3>Distribución por ecosistema</h3><p>Participación según los supuestos ilustrativos del modelo.</p>
                <div className="bar" aria-hidden="true">{ecosystems.map(([name, share, , style]) => <span key={name} className={style} style={{ width: share * 100 + '%' }}/>)}</div>
                {ecosystems.map(([name, share, value, style]) => <div className="ecosystem-row" key={name}><span><i className={style}/>{name}</span><strong>{Math.round(share * 100)}% <small>{usd(value)} USD</small></strong></div>)}
              </div>
            </div>
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
        </section>
        <section className="report-section print-scenario">
          <h2>Escenario actual simulado</h2>
          <p>Inversión municipal anual: {usd(investment)} USD.</p>
          <p>Horas de cuidado proyectadas: {number.format(hours)} h.</p>
          <p>Valor social neto estimado: {usd(result.net)} USD. Razón SROI: {result.ratio.toFixed(2)}x.</p>
          <p>Datos simulados para la demo. No hay evaluación de campo ni resultados observados.</p>
        </section>
        <section className="section">
          <div className="section-head"><div><p className="eyebrow">PREVENCIÓN Y CUIDADO</p><h2>Una comparación de referencia</h2><p>Ilustrativo: costos de referencia y ahorro del modelo por una intervención de 3.5 horas.</p></div></div>
          <div className="comparison">
            <article><span>HOSPITALIZACIÓN REACTIVA · ILUSTRATIVO</span><strong>$450 <small>USD / día cama</small></strong></article>
            <article><span>SESIÓN DOMICILIARIA · ILUSTRATIVO</span><strong>$35 <small>USD / sesión</small></strong></article>
            <article><span>AHORRO CLÍNICO ESTIMADO DEL MODELO</span><strong>{usd(sessionSavings)} <small>USD / intervención</small></strong></article>
          </div>
          <p className="note">El ahorro de referencia es una estimación del modelo para 3.5 horas; no es la resta directa de los costos mostrados ni una medición de campo.</p>
        </section>
        <section className="section cohort">
          <div><p className="eyebrow">COYOACÁN · ILUSTRATIVO</p><h2>Ejemplo de seguimiento</h2><p>Ilustrativo: horizonte de 18 meses. No se realizó una evaluación longitudinal.</p></div>
          <div><strong>−53%</strong><span>caídas · Ilustrativo</span></div>
          <div><strong>94%</strong><span>satisfacción · Ilustrativo</span></div>
          <div><strong>{metrics.audit}%</strong><span>auditoría muestral · Ilustrativo</span></div>
          <div><strong>&lt;{metrics.disputes}%</strong><span>objetivo de disputas · Ilustrativo</span></div>
        </section>
        <Ledger/>
        <footer>EntreManos · Panel de demostración con datos simulados. No contiene registros reales.</footer>
      </div>
    </main>
  </div>
}
