// pages/api/generate-research-questions.ts

import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";

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

  const { conceptOverview } = req.body;

  if (!conceptOverview) {
    return res.status(400).json({ message: "Concept overview is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that generates research questions based on a concept overview. Your task is to identify 1-2 important research questions for each belief statement in the concept overview.`,
        },
        {
          role: "user",
          content: `Based on the following concept overview, identify what are the 1-2 critical hypotheses that must be true for each belief statement to hold true. Keep the hypotheses short (no more than 1 line) and easily understandable by anyone. Make the hypotheses quantifiable so they can be tested through quantitative or qualitative research.

Concept Overview:
${conceptOverview}

Please structure the response exactly as follows:

1. Customer
A. [Copy the exact belief statement from the concept]
   - [First hypothesis for this belief]
   - [Second hypothesis for this belief]

2. Problem and Solution
A. [Copy the exact belief statement from the concept]
   - [First hypothesis for this belief]
   - [Second hypothesis for this belief]

3. Competitive Advantage
A. [Copy the exact belief statement from the concept]
   - [First hypothesis for this belief]
   - [Second hypothesis for this belief]

4. Business Model
A. [Copy the exact belief statement from the concept]
   - [First hypothesis for this belief]
   - [Second hypothesis for this belief]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const researchQuestions = completion.choices[0].message?.content;

    res.status(200).json({ researchQuestions });
  } catch (error) {
    console.error("Error generating research questions:", error);
    res.status(500).json({
      message: "Error generating research questions",
      error: error.message,
    });
  }
}
