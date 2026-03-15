/**
 * Sanitizes a string by removing any occurrence of the job description text.
 * Job descriptions are ephemeral and must never appear in logs or error output.
 */
export function redactJobText(context: string, jobText: string): string {
  if (!jobText || !context) return context

  // Replace the full job text first
  let result = context.split(jobText).join('[REDACTED_JOB_TEXT]')

  // Redact any sequence of 3+ consecutive words from the job text that appears
  // in the context. This catches arbitrary substrings > 20 chars without a
  // fixed-size sliding window that can miss cross-boundary matches.
  const words = jobText.split(/\s+/).filter(Boolean)
  // Build overlapping n-grams of 3 words (minimum ~15 chars for typical words)
  for (let i = 0; i + 2 < words.length; i++) {
    const phrase = words.slice(i, i + 3).join(' ')
    if (phrase.length > 10 && result.includes(phrase)) {
      result = result.split(phrase).join('[REDACTED_JOB_TEXT]')
    }
  }

  return result
}
