import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type LegalDocument = {
  content: string
  effectiveDateLabel: string | null
}

async function readMarkdownFile(fileName: string) {
  const filePath = path.join(process.cwd(), 'lib', fileName)
  return readFile(filePath, 'utf8')
}

function extractEffectiveDateLabel(content: string) {
  const effectiveLine = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('2026') && (line.includes('시행') || line.includes('적용')))
    .at(-1)

  return effectiveLine ?? null
}

export async function readLegalDocument(fileName: string): Promise<LegalDocument> {
  const content = await readMarkdownFile(fileName)

  return {
    content,
    effectiveDateLabel: extractEffectiveDateLabel(content),
  }
}
