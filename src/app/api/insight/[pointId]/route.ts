import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { pointId: string } }) {
  try {
    // Use your OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are an expert in Traditional Chinese Medicine and martial arts pressure points.'
        }, {
          role: 'user',
          content: `Provide a concise insight about meridian point ${params.pointId}, including its effects on internal systems and practical applications. Keep it under 100 words.`
        }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    const insight = data.choices[0].message.content;

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('GPT insight error:', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
}
