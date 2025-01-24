import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productIdea } = req.body;

    if (!productIdea) {
      return res.status(400).json({ message: 'Product idea is required' });
    }

    const prompt = `Given the following product idea: "${productIdea}"

Generate 3 distinct customer profiles that would be most interested in this product. For each profile, include:
1. A brief description of the demographic
2. 2-3 key pain points they experience
3. 2-3 main goals they want to achieve

Format the response as a JSON object with a 'profiles' array containing objects with 'description', 'painPoints' (array), and 'goals' (array) properties.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(response);
    const profiles = Array.isArray(parsedResponse.profiles) 
      ? parsedResponse.profiles 
      : Array.isArray(parsedResponse) 
        ? parsedResponse 
        : [];
    
    return res.status(200).json({
      profiles: profiles
    });

  } catch (error) {
    console.error('Error in generate-profiles:', error);
    return res.status(500).json({ 
      message: 'Error generating profiles',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 