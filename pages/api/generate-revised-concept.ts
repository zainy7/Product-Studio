import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

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
    const { originalIdea, conceptOverview, researchResults } = req.body;

    const prompt = `Based on the research results, generate revised beliefs for each section of our concept. If a belief doesn't need to change based on the research, explicitly state "No changes required - [original belief remains valid]". Return the response in this exact JSON format:
{
  "Customer Beliefs": [
    "Revised belief 1 or 'No changes required' statement",
    "Revised belief 2 or 'No changes required' statement"
  ],
  "Problem and Solution Beliefs": [
    "Revised belief 1 or 'No changes required' statement",
    "Revised belief 2 or 'No changes required' statement"
  ],
  "Competitive Beliefs": [
    "Revised belief 1 or 'No changes required' statement",
    "Revised belief 2 or 'No changes required' statement"
  ],
  "Business Model Beliefs": [
    "Revised belief 1 or 'No changes required' statement",
    "Revised belief 2 or 'No changes required' statement"
  ]
}

Original Concept:
${conceptOverview}

Research Summary: ${researchResults.summary}

Key Findings:
${researchResults.researchResults.map((result: any) => `
- Hypothesis: ${result.hypothesis}
- Findings: ${result.findings}
- Supported: ${result.supported}
- Confidence: ${result.recommendedConfidence}
`).join('\n')}

For each belief:
1. If the research validates the original belief, respond with "No changes required - [original belief]"
2. If the research suggests modifications, provide the revised belief
3. Ensure each revision or confirmation is based on specific research findings`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a product strategy expert who helps refine product concepts based on market research. You must return your response in valid JSON format."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const revisedIdea = completion.choices[0]?.message?.content;

    if (!revisedIdea) {
      throw new Error('Failed to generate revised concept');
    }

    // Parse and validate JSON before sending
    const parsedResponse = JSON.parse(revisedIdea);
    return res.status(200).json({ revisedIdea: parsedResponse });
  } catch (error) {
    console.error('Error generating revised concept:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate revised concept'
    });
  }
} 