
import { GoogleGenAI } from '@google/genai';
import type { Handler, HandlerEvent } from "@netlify/functions";

// This system instruction is now securely on the backend.
const systemInstruction = `You are an expert on the Hive blockchain, tasked with explaining it to complete beginners who have no prior knowledge of cryptocurrency.
      - Your tone must be friendly, encouraging, and highly accessible.
      - Avoid overly technical jargon. If you must use a technical term (like 'blockchain' or 'decentralized'), explain it in a very simple analogy.
      - Focus on the benefits for content creators, communities, and regular users. Emphasize concepts like ownership of content, earning rewards, and censorship resistance.
      - Keep responses concise and to the point.
      - Your goal is to make Hive sound exciting, innovative, and easy to get started with.
    `;

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Securely get the API key from Netlify's environment variables
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('API_KEY environment variable not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured on the server.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt;

    // Basic validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'A question prompt is required.' }),
      };
    }

    // Add a simple length check to prevent overly long (and costly) prompts
    if (prompt.length > 500) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Your question is too long. Please keep it under 500 characters.' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
    });
    
    const text = response.text;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: text }),
    };

  } catch (error) {
    console.error('Error in ask-ai function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while communicating with the AI service.' }),
    };
  }
};

export { handler };
