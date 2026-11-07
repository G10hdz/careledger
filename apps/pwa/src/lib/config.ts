/** Constantes de la PWA. Los umbrales de fraude viven aquí, no en la pantalla. */

export const NODE_ID = 'nodo-roma-condesa'
export const NODE_NAME = 'Roma-Condesa'

/** El oráculo simulado suelta las dos firmas externas después de este plazo. */
export const ORACLE_DELAY_MS = 10_000

/** REQ-ORA-003: sin las 3 firmas, a las 72 h la atestación se rechaza. */
export const ATTESTATION_TTL_MS = 72 * 60 * 60 * 1000

/** REQ-ORA-005: misma terna más de N veces se marca para auditoría. */
export const COLLUSION_REPEAT_LIMIT = 5

export const VEEDORES = ['veedor-1', 'veedor-2', 'veedor-3'] as const

export const MIN_MINUTES = 5
export const MAX_MINUTES = 24 * 60

export const ISSUER = 'Fondo Municipal de Cuidados'
