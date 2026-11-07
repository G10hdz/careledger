const WIN: Record<string, number> = {
  á: 0xe1,
  é: 0xe9,
  í: 0xed,
  ó: 0xf3,
  ú: 0xfa,
  Á: 0xc1,
  É: 0xc9,
  Í: 0xcd,
  Ó: 0xd3,
  Ú: 0xda,
  ñ: 0xf1,
  Ñ: 0xd1,
  ü: 0xfc,
  Ü: 0xdc,
  '¿': 0xbf,
  '¡': 0xa1,
}

function pdfLiteral(text: string): string {
  let out = ''
  for (const char of text) {
    if (char === '(' || char === ')' || char === '\\') {
      out += `\\${char}`
      continue
    }
    const code = WIN[char]
    if (code !== undefined) {
      out += `\\${code.toString(8).padStart(3, '0')}`
      continue
    }
    out += char.charCodeAt(0) > 126 ? '?' : char
  }
  return out
}

export function wrapLine(text: string, width = 78): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > width && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

/** PDF de una página, sin dependencia. El folio queda en texto plano para buscarlo. */
export function simplePdf(lines: string[]): Uint8Array {
  const wrapped = lines.flatMap((line) => (line === '' ? [''] : wrapLine(line)))
  const commands = ['BT', '/F1 12 Tf', '48 760 Td']
  wrapped.forEach((line, index) => {
    if (index > 0) commands.push('0 -16 Td')
    commands.push(`(${pdfLiteral(line)}) Tj`)
  })
  commands.push('ET')
  const stream = commands.join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefAt = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`
  return Uint8Array.from(pdf, (char) => char.charCodeAt(0))
}

export function pdfIncludes(pdf: Uint8Array, text: string): boolean {
  return new TextDecoder('latin1').decode(pdf).includes(text)
}
