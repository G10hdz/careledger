export const metrics = { caregivers: 14820, hours: 385000, validation: 99.4, disputes: 0.6, audit: 5 }
export const records = [
  {
    folio: 'CV-2026-0012-MX', type: 'Emisión', date: '2026-06-12', points: 300,
    node: 'Roma-Condesa', account: 'Fondo Municipal de Cuidados', accountCode: 'DEMO-CUID-2026-001',
    signatures: [
      { role: 'Persona cuidadora', hash: 'a19f2d3461b79ea0c5d113e43aa1c0492dd6ce56c9de76f833b52b5ec8778f01' },
      { role: 'Testigo comunitario', hash: 'c28e3a4572c80fb1d6e224f54bb2d1503ee7df67daef87044c63c6fd9889a012' },
      { role: 'Representante del nodo', hash: 'd39f4b5683d910c2e7f335a65cc3e2614ff8e078ebf098155d74d70ea99ab123' },
    ],
  },
  {
    folio: 'CV-2026-0013-MX', type: 'Canje', date: '2026-06-13', points: 150,
    node: 'Coyoacán', account: 'Fondo Municipal de Cuidados', accountCode: 'DEMO-CUID-2026-001',
    signatures: [
      { role: 'Persona cuidadora', hash: 'bf497f8d31a9678e1861aad02a97b0804e63a14b759a9f490d123a92339bd013' },
      { role: 'Testigo comunitario', hash: 'e4a05c6794ea21d3f80446b76dd4f3725009f189fc0199266e85e81fbaabc234' },
      { role: 'Representante del nodo', hash: 'f5b16d78a5fb32e4091557c87ee50483611a029a0d12aa377f96f920cbbcd345' },
    ],
  },
]
