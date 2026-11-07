'use client'
import { useState } from 'react'
import { computePoints } from '@careledger/domain'
import { providers } from '../lib/fixtures'
import {
  CAREGIVER_HOURLY_RATE_MXN,
  DEMO_SESSION_MINUTES,
  STATUS_FLOW,
  categories,
  createRequest,
  filterProviders,
  offerLabel,
  toCareSession,
  transition,
  zones,
  type Provider,
  type Request,
  type Status,
} from '../lib/marketplace'

const money = (n: number) => (n === 0 ? 'Gratis' : `$${n} MXN`)

function Stepper({ status }: { status: Status }) {
  if (status === 'rechazada') return <p className="rejected">El proveedor rechazó esta solicitud.</p>
  const current = STATUS_FLOW.indexOf(status)
  return (
    <ol className="stepper" aria-label="Avance de la solicitud">
      {STATUS_FLOW.map((step, i) => (
        <li key={step} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
          {step}
        </li>
      ))}
    </ol>
  )
}

type CardProps = {
  request: Request
  view: 'familia' | 'proveedor'
  registeredPoints: number | undefined
  onUpdate: (id: string, status: Status) => void
  onRegister: (request: Request) => void
}

function RequestCard({ request: r, view, registeredPoints, onUpdate, onRegister }: CardProps) {
  const provider = providers.find(item => item.id === r.providerId)
  const registered = registeredPoints !== undefined
  return (
    <article className="card">
      <div className="card-top">
        <span className={`badge ${r.status}`}>{r.status}</span>
      </div>
      <h3>{provider?.name}</h3>
      <p>{r.category} · {r.zone}</p>
      <p>Horario: {r.schedule}</p>
      <p>Presupuesto: {money(r.budgetMin)} a {money(r.budgetMax)}</p>
      <Stepper status={r.status} />
      {view === 'proveedor' && (
        <div className="actions">
          {r.status === 'enviada' && (
            <>
              <button className="button" onClick={() => onUpdate(r.id, 'aceptada')}>Aceptar</button>
              <button className="button outline" onClick={() => onUpdate(r.id, 'rechazada')}>Rechazar</button>
            </>
          )}
          {r.status === 'aceptada' && <button className="button" onClick={() => onUpdate(r.id, 'agendada')}>Marcar agendada</button>}
          {r.status === 'agendada' && <button className="button" onClick={() => onUpdate(r.id, 'completada')}>Marcar completada</button>}
        </div>
      )}
      {r.status === 'completada' && provider?.accredited && (
        registered
          ? <p className="registered">✓ Jornada registrada en el ledger cívico · {DEMO_SESSION_MINUTES} min · {registeredPoints} Puntos Cívicos</p>
          : view === 'proveedor'
            ? <button className="button" onClick={() => onRegister(r)}>Registrar jornada en el ledger</button>
            : <p className="registered">Completada. La cuidadora acreditada registra esta jornada en el ledger cívico.</p>
      )}
    </article>
  )
}

export default function Home() {
  const [zone, setZone] = useState('Roma-Condesa')
  const [category, setCategory] = useState('')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(500)
  const [selected, setSelected] = useState<Provider | null>(null)
  const [schedule, setSchedule] = useState('')
  const [requests, setRequests] = useState<Request[]>([])
  const [registered, setRegistered] = useState<Record<string, number>>({})
  const [view, setView] = useState<'directorio' | 'familia' | 'proveedor'>('directorio')
  const results = filterProviders(providers, zone, min, max, category)
  function update(id: string, status: Status) { setRequests(items => items.map(item => item.id === id ? transition(item, status) : item)) }
  function register(request: Request) {
    const provider = providers.find(p => p.id === request.providerId)
    const session = provider ? toCareSession(request, provider) : null
    if (!session) return
    setRegistered(items => ({ ...items, [request.id]: computePoints({ minutes: session.minutes }) }))
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || max < min) return
    setRequests(items => [createRequest({ id: crypto.randomUUID(), provider: selected, zone, budgetMin: min, budgetMax: max, schedule }), ...items])
    setSelected(null); setSchedule(''); setView('familia')
  }
  return (
    <>
      <header>
        <div className="shell header">
          <a href="#inicio" className="brand"><span className="mark">✳</span> EntreManos <small> / servicios</small></a>
          <nav aria-label="Navegación principal">
            <button onClick={() => setView('directorio')} aria-current={view === 'directorio' ? 'page' : undefined}>Directorio</button>
            <button onClick={() => setView('familia')} aria-current={view === 'familia' ? 'page' : undefined}>Mis solicitudes</button>
            <button onClick={() => setView('proveedor')} aria-current={view === 'proveedor' ? 'page' : undefined}>Soy proveedor</button>
          </nav>
        </div>
      </header>
      <main id="inicio" className="shell">
        {view === 'directorio' ? (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">CUIDADO CERCA DE TI</span>
                <h1>Encontrar apoyo<br /><em>también es cuidar.</em></h1>
                <p>Conecta con servicios de cuidado en tu barrio, según lo que necesitas y tu presupuesto.</p>
              </div>
              <div className="hero-note">
                <span>✳</span>
                <strong>Tu red de cuidado empieza aquí.</strong>
                <p>Explora opciones públicas y privadas en un mismo lugar.</p>
              </div>
            </section>
            <section className="search" aria-label="Filtros del directorio">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ENCUENTRA APOYO</span>
                  <h2>Busca a tu manera</h2>
                </div>
                <p>Elige tu zona y el rango que puedes pagar.</p>
              </div>
              <div className="filters">
                <label>Colonia o nodo
                  <select value={zone} onChange={e => setZone(e.target.value)}>
                    {zones.map(z => <option key={z.name}>{z.name}</option>)}
                  </select>
                </label>
                <label>Tipo de servicio
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Todos los servicios</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label>Desde (MXN)<input type="number" min="0" value={min} onChange={e => setMin(Number(e.target.value))} /></label>
                <label>Hasta (MXN)<input type="number" min="0" value={max} onChange={e => setMax(Number(e.target.value))} /></label>
              </div>
              {max < min && <p role="alert">El máximo debe ser mayor o igual al mínimo.</p>}
            </section>
            {(['public', 'private'] as const).map(group => {
              const list = results.filter(p => p.public === (group === 'public'))
              return (
                <section className="results" key={group}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">{group === 'public' ? 'APOYO MUNICIPAL' : 'RED DE PROFESIONALES'}</span>
                      <h2>{group === 'public' ? 'Servicios públicos' : 'Servicios privados'}</h2>
                    </div>
                    <p>{group === 'public' ? 'Opciones gratuitas o subsidiadas' : 'Opciones de cuidado en tu zona'}</p>
                  </div>
                  <div className="cards">
                    {list.map(p => (
                      <article className="card" key={p.id}>
                        <div className="card-top">
                          <div className="badges">
                            <span className={p.public ? 'badge public' : 'badge'}>{offerLabel(p)}</span>
                            {p.accredited && <span className="badge acred">Acreditada {p.accreditationId}</span>}
                          </div>
                          <span className="price">{money(p.price)}{p.accredited ? '/h' : ''}</span>
                        </div>
                        <span className="category">{p.category}</span>
                        <h3>{p.name}</h3>
                        <p>⌖ {p.zones.join(' · ')}</p>
                        <p>◷ {p.availability}</p>
                        <p className="verified">✓ {p.certification}</p>
                        {p.accredited && <p className="uniform">La hora vale igual para todas las cuidadoras acreditadas: {money(CAREGIVER_HOURLY_RATE_MXN)}/h.</p>}
                        <div className="card-footer">
                          <span>{p.price >= min && p.price <= max ? 'Dentro de tu presupuesto' : 'Fuera de tu presupuesto'}</span>
                          <button className="button outline" onClick={() => setSelected(p)}>Solicitar <span aria-hidden="true">→</span></button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {list.length === 0 && <p>No hay opciones para esta búsqueda.</p>}
                </section>
              )
            })}
          </>
        ) : (
          <section className="results">
            <span className="eyebrow">{view === 'familia' ? 'SEGUIMIENTO' : 'BANDEJA DE PROVEEDOR'}</span>
            <h1>{view === 'familia' ? 'Mis solicitudes' : 'Solicitudes recibidas'}</h1>
            <p>Esta demostración guarda los cambios solo mientras la página permanezca abierta.</p>
            <div className="cards">
              {requests.map(r => (
                <RequestCard
                  key={r.id}
                  request={r}
                  view={view}
                  registeredPoints={registered[r.id]}
                  onUpdate={update}
                  onRegister={register}
                />
              ))}
            </div>
            {requests.length === 0 && <p>Aún no hay solicitudes.</p>}
          </section>
        )}
      </main>
      <footer><div className="shell">EntreManos · Una comunidad que cuida</div></footer>
      {selected && (
        <div className="overlay">
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <button className="close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
            <span className="eyebrow">SOLICITUD DE SERVICIO</span>
            <h2 id="dialog-title">Solicitar a {selected.name}</h2>
            <p>{selected.category} · {zone} · {money(selected.price)}{selected.accredited ? ' por hora' : ''}</p>
            <p>Comparte solo los datos necesarios para coordinar el servicio. No incluyas diagnósticos ni datos médicos.</p>
            <form onSubmit={submit}>
              <label>Necesidad<input value={selected.category} readOnly /></label>
              <label>Zona<input value={zone} readOnly /></label>
              <label>Presupuesto<input value={`${money(min)} a ${money(max)}`} readOnly /></label>
              <label>Horario deseado
                <select required value={schedule} onChange={e => setSchedule(e.target.value)}>
                  <option value="">Selecciona un horario</option>
                  <option>Mañana</option>
                  <option>Tarde</option>
                  <option>Noche</option>
                </select>
              </label>
              <button className="button" disabled={max < min}>Enviar solicitud</button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
