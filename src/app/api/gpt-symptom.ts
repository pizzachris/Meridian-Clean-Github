import type { NextApiRequest, NextApiResponse } from 'next';
import points from '../../../data/points.json';

// You must set OPENAI_API_KEY in your Vercel/Next.js environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symptom } = req.body;
  if (!symptom || typeof symptom !== 'string') {
    return res.status(400).json({ error: 'Missing symptom' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  // Compose a prompt for GPT
  const prompt = `You are an expert in acupuncture and meridian therapy. Given the symptom: "${symptom}", suggest the most relevant acupressure points from this list (use the point id, Korean, English, meridian, and healing function):\n${points.slice(0, 100).map(p => `${p.id}: ${p.korean} (${p.english}) - ${p.meridian}. Healing: ${p.healing}`).join('\n')}\nRespond with a JSON array of objects with keys: id, korean, english, meridian, healing.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful acupuncture and meridian therapy assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.2,
      }),
    });
    const data = await response.json();
    // Try to extract JSON from the response
    let pointsResult = [];
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      // Use a regex compatible with ES2015+ (no /s flag)
      const match = data.choices[0].message.content.match(/\[[\s\S]*\]/);
      if (match) {
        pointsResult = JSON.parse(match[0]);
      }
    }
    return res.status(200).json({ points: pointsResult });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch from OpenAI' });
  }
}
