import { generateText, Output, type LanguageModel } from 'ai'
import { z } from 'zod'

export const SUGGEST_MODEL = 'anthropic/claude-haiku-5.5'

const kind = z.enum(['cuidado', 'oficio'])
const level = z.enum(['N0', 'N1', 'N2'])
const text = z.string().trim().min(3).max(280)

const catalogItem = z.object({
  id: z.string().max(64),
  title: z.string().max(80),
  kind,
  minLevel: level,
})

const requestSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('pedido'), text, catalog: z.array(catalogItem).min(1).max(50) }),
  z.object({ mode: z.literal('servicio'), text }),
])

export type SuggestRequest = z.infer<typeof requestSchema>
type CatalogItem = z.infer<typeof catalogItem>

export type Suggestion =
  | { mode: 'pedido'; serviceId: string | null; hours: number | null }
  | { mode: 'servicio'; title: string; kind: z.infer<typeof kind>; minLevel: z.infer<typeof level> }

const pedidoSchema = z.object({ serviceId: z.string().nullable(), hours: z.number().nullable() })
const servicioSchema = z.object({ title: z.string(), kind, minLevel: level })

export function parseSuggestRequest(body: unknown): SuggestRequest | null {
  const parsed = requestSchema.safeParse(body)
  return parsed.success ? parsed.data : null
}

/** La salida del modelo no es confiable: solo pasan ids del catálogo y
 *  horas en bloques de 15 min entre 0.5 y 8. Las reglas del dominio
 *  vuelven a validar al pedir. */
export function normalizePedido(raw: z.infer<typeof pedidoSchema>, catalog: CatalogItem[]) {
  const serviceId = catalog.some((item) => item.id === raw.serviceId) ? raw.serviceId : null
  const snapped = raw.hours === null ? Number.NaN : Math.round(raw.hours * 4) / 4
  const hours = snapped >= 0.5 && snapped <= 8 ? snapped : null
  return { serviceId, hours }
}

export function normalizeServicio(raw: z.infer<typeof servicioSchema>) {
  const title = raw.title.trim().slice(0, 80)
  return title ? { title, kind: raw.kind, minLevel: raw.minLevel } : null
}

const PRIVACY =
  'Nunca incluyas nombres de personas, diagnósticos ni datos de salud en tu respuesta. Responde solo con los campos pedidos.'

export async function suggest(request: SuggestRequest, model: LanguageModel = SUGGEST_MODEL): Promise<Suggestion | null> {
  if (request.mode === 'pedido') {
    const { output } = await generateText({
      model,
      output: Output.object({ schema: pedidoSchema }),
      system: `Eres el asistente de un banco de tiempo de cuidados. Elige del catálogo el servicio que mejor responde a la necesidad y estima las horas (bloques de 15 min, de 0.5 a 8). Si ninguno encaja, serviceId es null; si no se mencionan horas, hours es null. ${PRIVACY}`,
      prompt: `Catálogo:\n${request.catalog.map((item) => `${item.id}: ${item.title} (${item.kind}, nivel ${item.minLevel})`).join('\n')}\n\nNecesidad: ${request.text}`,
      maxOutputTokens: 200,
    })
    return { mode: 'pedido', ...normalizePedido(output, request.catalog) }
  }

  const { output } = await generateText({
    model,
    output: Output.object({ schema: servicioSchema }),
    system: `Eres el asistente de un banco de tiempo de cuidados. Convierte la descripción en un servicio: título corto (máximo 8 palabras), tipo "cuidado" si atiende a una persona o "oficio" si es una profesión u oficio, y nivel mínimo: N0 sin requisito (compañía, compras, trámites, aseo, jardinería), N1 capacitación básica (movilización, comida asistida, medicamentos simples), N2 certificado o profesional (enfermería, terapia, odontología, fisioterapia). Ante la duda, elige el nivel más alto. ${PRIVACY}`,
    prompt: request.text,
    maxOutputTokens: 200,
  })
  const servicio = normalizeServicio(output)
  return servicio ? { mode: 'servicio', ...servicio } : null
}
