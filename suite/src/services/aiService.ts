/* ── Generic AI JSON-completion utility (setting-agnostic) ── */

export interface CompleteJSONOptions {
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * Calls an OpenAI-compatible chat-completions endpoint with
 * `response_format: json_object` and returns the parsed JSON payload.
 *
 * This helper is intentionally free of any setting-specific vocabulary,
 * prompts, or response schemas. Setting packs supply their own prompt
 * builders and response normalizers on top of this primitive.
 */
export async function completeJSON(options: CompleteJSONOptions): Promise<unknown> {
  const {
    systemPrompt,
    userPrompt,
    apiKey,
    baseUrl = 'https://api.openai.com/v1',
    model = 'gpt-4o-mini',
  } = options;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (error: unknown) {
    throw new Error('Failed to parse AI response as JSON.', { cause: error });
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
