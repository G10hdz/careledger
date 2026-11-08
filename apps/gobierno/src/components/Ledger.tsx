import { Fragment, useState } from 'react'
import { pointsToMxn } from '@careledger/domain'
import { records } from '../lib/fixtures'

const number = new Intl.NumberFormat('es-MX')

export function Ledger() {
  const [folio, setFolio] = useState('')
  const [selectedFolio, setSelectedFolio] = useState<string | null>(null)
  const matches = records.filter(record => record.folio.toLowerCase().includes(folio.trim().toLowerCase()))

  return <section id="ledger" className="section">
    <div className="section-head">
      <div><p className="eyebrow">TRAZABILIDAD PRESUPUESTARIA</p><h2>Libro mayor</h2><p>Ilustrativo: emisiones y canjes ficticios. No son registros observados.</p></div>
      <span className="tag">ILUSTRATIVO</span>
    </div>
    <div className="card ledger">
      <label htmlFor="folio">Buscar por folio</label>
      <input id="folio" type="search" placeholder="Ej. CV-2026-0012-MX" value={folio} onChange={e => setFolio(e.target.value)}/>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">Folio</th><th scope="col">Movimiento</th><th scope="col">Nodo</th><th scope="col">Partida</th><th scope="col">Detalle</th></tr></thead>
        <tbody>{matches.map(record => {
          const open = selectedFolio === record.folio
          const detailId = 'detalle-' + record.folio
          return <Fragment key={record.folio}>
            <tr>
              <td>{record.folio}</td><td>{record.type}</td><td>{record.node}</td><td>{record.account}</td>
              <td><button type="button" aria-expanded={open} aria-controls={detailId} aria-label={'Ver detalle de ' + record.folio} onClick={() => setSelectedFolio(open ? null : record.folio)}>Ver detalle</button></td>
            </tr>
            <tr hidden={!open}><td colSpan={5}>
              <section id={detailId} className="folio-detail" aria-labelledby={detailId + '-titulo'}>
                <h3 id={detailId + '-titulo'}>Detalle del folio {record.folio}</h3>
                <p>Ilustrativo. Datos de demostración, sin verificación criptográfica.</p>
                <dl>
                  <div><dt>Folio</dt><dd>{record.folio}</dd></div>
                  <div><dt>Tipo</dt><dd>{record.type}</dd></div>
                  <div><dt>Fecha</dt><dd><time dateTime={record.date}>{record.date.split('-').reverse().join('/')}</time></dd></div>
                  <div><dt>Monto</dt><dd>{number.format(record.points)} Puntos Cívicos · {'$' + number.format(pointsToMxn(record.points))} MXN</dd></div>
                  <div><dt>Partida presupuestaria</dt><dd>{record.accountCode} · {record.account}</dd></div>
                  <div><dt>Nodo</dt><dd>{record.node}</dd></div>
                </dl>
                <p>Equivalencia ilustrativa del registro: 1 Punto Cívico = $1 MXN. No representa una conversión del escenario SROI en USD.</p>
                <h3>Firmas del oráculo</h3>
                <ul className="signatures">{record.signatures.map(signature => <li key={signature.role}>
                  <strong>{signature.role}</strong>
                  <span>hash de ejemplo, no verificable</span>
                  <code>{signature.hash}</code>
                </li>)}</ul>
              </section>
            </td></tr>
          </Fragment>
        })}</tbody>
      </table></div>
      {matches.length === 0 && <p>No hay movimientos para ese folio.</p>}
    </div>
  </section>
}
