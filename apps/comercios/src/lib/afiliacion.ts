import type { Comercio, ComercioStore } from './types'
import { clabeValida } from './clabe'

/** Nombre del distintivo mientras el directorio real no exista. */
export const NOMBRE_PLACA = 'Comercio Solidario'

/** REQ-COM-001: solo 3 campos — identificación oficial, comprobante de
 *  domicilio y CLABE. De los archivos solo se guarda el nombre local. */
export type AfiliacionDatos = {
  clabe: string
  idOficialName: string
  domicilioName: string
}

export type AfiliacionResult =
  | { ok: true; comercio: Comercio }
  | { ok: false; reason: 'clabe_invalida' | 'documentos_faltantes' }

/** Folio del distintivo: CS-AAAA-NNNN-MX. Prototipo: secuencia 1 por local. */
export function placaFolio(year: number, seq: number): string {
  return `CS-${year}-${String(seq).padStart(4, '0')}-MX`
}

/**
 * Afiliación express REQ-COM-001: pura y determinística, sin red ni storage.
 * Meta: alta en ≤5 minutos, sin trámites notariados.
 */
export function registrarComercio(
  store: ComercioStore,
  datos: AfiliacionDatos,
  now = new Date(),
): AfiliacionResult {
  if (!datos.idOficialName.trim() || !datos.domicilioName.trim()) {
    return { ok: false, reason: 'documentos_faltantes' }
  }
  if (!clabeValida(datos.clabe)) return { ok: false, reason: 'clabe_invalida' }

  const comercio: Comercio = {
    nombre: NOMBRE_PLACA,
    clabe: datos.clabe.trim(),
    idOficialName: datos.idOficialName.trim(),
    domicilioName: datos.domicilioName.trim(),
    afiliadoAt: now.toISOString(),
    estado: 'afiliado',
    placaFolio: placaFolio(now.getFullYear(), store.comercio ? 2 : 1),
  }
  store.comercio = comercio
  return { ok: true, comercio }
}
