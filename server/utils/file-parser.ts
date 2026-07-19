import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

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
    const pdf = new PDFParse({ data: buffer })
    const result = await pdf.getText()
    return result.text
  }

  throw new Error(`Unsupported fileType: ${fileType}`)
}
