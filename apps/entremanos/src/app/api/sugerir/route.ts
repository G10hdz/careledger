import { parseSuggestRequest, suggest } from '@/lib/suggest'

// El texto de la persona no se guarda ni se registra: solo viaja al modelo.
export async function POST(request: Request) {
  const body = parseSuggestRequest(await request.json().catch(() => null))
  if (!body) return Response.json({ error: 'entrada' }, { status: 400 })
  try {
    const suggestion = await suggest(body)
    return suggestion ? Response.json(suggestion) : Response.json({ error: 'sin_sugerencia' }, { status: 422 })
  } catch {
    return Response.json({ error: 'modelo' }, { status: 502 })
  }
}
