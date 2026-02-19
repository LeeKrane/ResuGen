/**
 * redactJobText — sanitizes error messages and log strings by removing
 * any occurrence of the job description text (or long substrings of it).
 *
 * Job descriptions are ephemeral and must never appear in logs or error output.
 * This utility is used in all error handlers on the AI Generate page.
 *
 * @param context  The string to sanitize (e.g. an error message)
 * @param jobText  The job description text to redact
 * @returns        The sanitized string with job text replaced by [REDACTED_JOB_TEXT]
 */
export function redactJobText(context: string, jobText: string): string {
  if (!jobText || !context) return context

  // 1. Replace the full job text
  let result = context.split(jobText).join('[REDACTED_JOB_TEXT]')

  // 2. Replace any substring of jobText longer than 20 characters
  // Split into chunks of 21+ chars and redact each one found in context
  const minLen = 21
  for (let i = 0; i <= jobText.length - minLen; i++) {
    for (let j = i + minLen; j <= jobText.length; j++) {
      const chunk = jobText.slice(i, j)
      if (result.includes(chunk)) {
        result = result.split(chunk).join('[REDACTED_JOB_TEXT]')
      }
    }
  }

  return result
}
