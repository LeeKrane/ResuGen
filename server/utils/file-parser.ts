import mammoth from 'mammoth'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>

/**
 * Extracts plain text from an uploaded resume file buffer.
 *
 * @param buffer   Raw file bytes
 * @param fileType 'pdf' | 'docx' | 'txt'
 * @returns Extracted plain text string
 */
export async function extractText(buffer: Buffer, fileType: 'pdf' | 'docx' | 'txt'): Promise<string> {
  if (fileType === 'txt') {
    return buffer.toString('utf-8')
  }

  if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (fileType === 'pdf') {
    const result = await pdfParse(buffer)
    return result.text
  }

  throw new Error(`Unsupported fileType: ${fileType}`)
}
