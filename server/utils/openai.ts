import OpenAI from 'openai'

/**
 * Returns a configured OpenAI client using the server-side API key.
 *
 * The key is read from runtimeConfig.openaiApiKey, which maps to the
 * NUXT_OPENAI_API_KEY environment variable. It is NEVER exposed to the client.
 *
 * Deployment note:
 *   - Set NUXT_OPENAI_API_KEY as a secret environment variable in your hosting provider.
 *   - Never use NUXT_PUBLIC_OPENAI_API_KEY — that would expose the key in the browser bundle.
 *   - On Vercel/Railway/Render: add it under "Environment Variables" in the project settings.
 */
export function getOpenAIClient(): OpenAI {
  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey

  if (!apiKey) {
    throw new Error(
      'OpenAI API key is not configured. Set the NUXT_OPENAI_API_KEY environment variable.'
    )
  }

  return new OpenAI({ apiKey })
}
