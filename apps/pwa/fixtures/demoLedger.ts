/**
 * Llavero DEMO del prototipo. Simula el llavero municipal del
 * despliegue real: el emisor (PWA) firma y el terminal (comercios)
 * verifica con la parte pública embebida en su app.
 *
 * NO es un secreto real: es una clave de demostración sin valor.
 * En producción esta clave se reemplaza por el llavero municipal
 * distribuido fuera de banda; la privada jamás se embebe en un
 * cliente.
 */
export const DEMO_LEDGER_PUBLIC_JWK: JsonWebKey = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: '7BGxaJvxMCV6V6lGospqiUKRT8rqR2dulyQzuLrPQ78',
}

/**
 * Simula al ledger emisor dentro del demo (app.ts, redeem). En producción
 * la firma la hace el servidor y esta llave no existe en el cliente.
 */
export const DEMO_LEDGER_PRIVATE_JWK: JsonWebKey = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: '7BGxaJvxMCV6V6lGospqiUKRT8rqR2dulyQzuLrPQ78',
  d: 'Wra_Lx3LKqPSDa-D_FpfHvf2-YNCMv3Znb-eKqG83Wg',
}
