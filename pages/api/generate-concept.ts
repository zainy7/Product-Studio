import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { productIdea, customerProfile } = req.body;

  if (!productIdea) {
    return res.status(400).json({ message: "Product idea is required" });
  }

  try {
    const systemPrompt = `You are a product expert that generates concept overviews for product ideas. 
    Always respond with a complete concept overview following the exact format provided, including all sections.
    Make sure to wrap belief statements in <belief></belief> tags.`;

    let userPrompt = `Generate a concept overview for this product idea: "${productIdea}"`;

    // Add customer profile information if available and valid
    if (customerProfile && 
        typeof customerProfile.description === 'string' && 
        Array.isArray(customerProfile.painPoints) && 
        Array.isArray(customerProfile.goals)) {
      
      userPrompt += `\n\nTarget Customer Profile:
- Description: ${customerProfile.description}
- Pain Points: ${customerProfile.painPoints.join(', ')}
- Goals: ${customerProfile.goals.join(', ')}`;
    }

    userPrompt += `\n\nProvide a complete concept overview using this exact format:

Concept Summary: [Write a clear 1-2 line summary]

1. CUSTOMER
A. Our first customer for this idea or feature will be <belief>[customer description]</belief>

2. PROBLEM AND SOLUTION
A. Our customer has a need to <belief>[primary need]</belief>
B. This is hard today because there's <belief>[key challenge]</belief>
C. We solve this by providing <belief>[solution]</belief>

3. COMPETITIVE ADVANTAGE
A. Our primary competitors are <belief>[competitors]</belief>
B. We are better than competitors because <belief>[differentiator]</belief>

4. BUSINESS MODEL
A. We will acquire customers by <belief>[acquisition strategy]</belief>
B. We will make money by <belief>[monetization strategy]</belief>`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    const conceptOverview = completion.choices[0]?.message?.content;

    if (!conceptOverview) {
      throw new Error('No concept overview generated');
    }

    // Log the response for debugging
    console.log('Generated concept overview:', conceptOverview);

    res.status(200).json({ conceptOverview });
  } catch (error) {
    console.error("Error generating concept overview:", error);
    res.status(500).json({
      message: "Error generating concept overview",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
