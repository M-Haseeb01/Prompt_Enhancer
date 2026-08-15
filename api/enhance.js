const SYSTEM_INSTRUCTION = [
  'You are an expert prompt engineer.',
  "Rewrite the user's prompt into a clearer, more specific, and more effective prompt for an AI model.",
  'Add useful context, constraints, and structure where helpful, but preserve the original intent and language.',
  'Return only the enhanced prompt as plain text.',
  'Do not add a preamble, an explanation, labels, or surrounding quotation marks.',
].join(' ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'A non-empty "prompt" string is required.' });
  }

  if (prompt.length > 6000) {
    return res.status(400).json({ error: 'Prompt is too long. Please keep it under 6000 characters.' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GROQ_API_KEY. Set it in your environment variables.' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt.trim() },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errorBody = await groqRes.text();
      return res.status(groqRes.status).json({
        error: 'The Groq API returned an error.',
        detail: errorBody,
      });
    }

    const data = await groqRes.json();
    const enhancedPrompt = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content.trim()
      : '';

    if (!enhancedPrompt) {
      return res.status(502).json({ error: 'Groq returned an empty response. Please try again.' });
    }

    return res.status(200).json({ enhancedPrompt });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error.', detail: error.message });
  }
}
