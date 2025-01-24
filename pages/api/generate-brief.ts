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
    const { concept } = req.body;
    
    console.log('Received concept:', concept);

    if (!concept) {
      return res.status(400).json({ 
        message: 'No concept data provided',
        error: 'Concept is required'
      });
    }

    // Format the concept into a structured brief
    const formattedConcept = `
Product Concept Overview:
${concept.summary}

Original Customer Understanding:
${concept.customer.map(b => `- ${b.baseText} ${b.hypothesis}`).join('\n')}

Revised Customer Understanding:
${concept.revisedBeliefs["Customer Beliefs"]?.map(b => `- ${b}`).join('\n') || 'No revisions'}

Original Problem and Solution:
${concept.problemSolution.map(b => `- ${b.baseText} ${b.hypothesis}`).join('\n')}

Revised Problem and Solution:
${concept.revisedBeliefs["Problem and Solution Beliefs"]?.map(b => `- ${b}`).join('\n') || 'No revisions'}

Original Competitive Advantage:
${concept.competitiveAdvantage.map(b => `- ${b.baseText} ${b.hypothesis}`).join('\n')}

Revised Competitive Advantage:
${concept.revisedBeliefs["Competitive Beliefs"]?.map(b => `- ${b}`).join('\n') || 'No revisions'}

Original Business Model:
${concept.businessModel.map(b => `- ${b.baseText} ${b.hypothesis}`).join('\n')}

Revised Business Model:
${concept.revisedBeliefs["Business Model Beliefs"]?.map(b => `- ${b}`).join('\n') || 'No revisions'}
`;

    console.log('Formatted concept:', formattedConcept);

    const prompt = `Based on the following validated concept, create a structured product brief:

${formattedConcept}

Please format your response exactly as shown below, using the exact section markers:

[CONCEPT_SUMMARY]
Write a 2-3 line summary of the core product concept.

[GOALS]
- Goal 1
- Goal 2
- Goal 3

[TARGET_AUDIENCE]
- Primary audience description
- Secondary audience (if applicable)
- Key characteristics/demographics

[OVERALL_FEATURES]
- Feature 1
- Feature 2
- Feature 3
- Feature 4
- Feature 5 (max)

[MVP_GOAL]
One clear sentence describing the minimum viable product goal.

[MVP_USER_FLOW]
1. First step (usually landing page/signup)
2. Second step
3. Third step
4. Final step (completing core value action)

Ensure each section directly reflects the validated beliefs from the research. Keep the response concise and focused on validated insights only.`;

    console.log('Sending prompt to OpenAI');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional product manager who specializes in creating clear, structured product briefs. Always maintain the exact section markers in your response and ensure each section is clearly separated."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const brief = completion.choices[0]?.message?.content || 'Error generating brief';
    
    // Parse the sections
    const sections = {
      conceptSummary: extractSection(brief, 'CONCEPT_SUMMARY'),
      goals: extractSection(brief, 'GOALS'),
      targetAudience: extractSection(brief, 'TARGET_AUDIENCE'),
      overallFeatures: extractSection(brief, 'OVERALL_FEATURES'),
      mvpGoal: extractSection(brief, 'MVP_GOAL'),
      mvpUserFlow: extractSection(brief, 'MVP_USER_FLOW')
    };

    console.log('Parsed brief sections:', sections);

    return res.status(200).json({ brief: sections });
    
  } catch (error) {
    console.error('Error in generate-brief API:', error);
    return res.status(500).json({ 
      message: 'Error generating brief',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

// Helper function to extract sections from the response
function extractSection(text: string, sectionName: string): string {
  const sectionRegex = new RegExp(`\\[${sectionName}\\]\\s*([\\s\\S]*?)(?=\\[|$)`);
  const match = text.match(sectionRegex);
  return match ? match[1].trim() : '';
}