import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hypotheses } = req.body;

    const prompt = `Act as a market research analyst. For each of the following hypotheses, provide evidence that either supports or challenges it based on current market data, trends, and industry reports. Format your response as JSON with "hypothesis", "evidence" (array of supporting points), and "counterEvidence" (array of challenging points) for each hypothesis.

Hypotheses to analyze:
${hypotheses.join('\n')}

Ensure your analysis includes:
- Market size and growth data
- Competitor analysis
- Industry trends
- Consumer behavior patterns
- Economic factors
- Technological developments`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a skilled market research analyst with access to current market data and trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const researchResults = JSON.parse(completion.choices[0].message?.content || '{}');
    
    return res.status(200).json(researchResults);
  } catch (error) {
    console.error('Secondary research error:', error);
    return res.status(500).json({ message: 'Error conducting secondary research' });
  }
} 