import { NextApiRequest, NextApiResponse } from "next";
import fetch from 'node-fetch';

// Define Perplexity API types
interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { hypotheses, productIdea } = req.body;

  if (!hypotheses || !Array.isArray(hypotheses) || hypotheses.length === 0) {
    return res.status(400).json({ message: "No hypotheses provided" });
  }

  if (!productIdea) {
    return res.status(400).json({ message: "No product idea provided" });
  }

  try {
    if (!process.env.PERPLEXITY_API_KEY?.startsWith('pplx-')) {
      throw new Error('Invalid Perplexity API key format. Key should start with "pplx-"');
    }

    console.log("Making request to Perplexity API with key:", process.env.PERPLEXITY_API_KEY ? "Key exists" : "No key found");
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 60000,
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a market research expert. Your response must be valid JSON that can be parsed by JSON.parse(). Do not include any markdown formatting or additional text. Keep responses concise."
          },
          {
            role: "user",
            content: `Research and analyze this product idea and hypotheses using current market data and trends. Return ONLY a JSON response.

Product Idea: ${productIdea}

Hypotheses:
${hypotheses.map((h: any) => `- ${h.statement} (Current confidence: ${h.confidence})`).join('\n')}

Required JSON structure:
{
  "researchResults": [
    {
      "hypothesis": "string",
      "findings": "string",
      "statistics": "string",
      "trends": "string",
      "sources": [
        {
          "title": "string",
          "url": "string",
          "publisher": "string",
          "year": "string",
          "type": "string",
          "keyInsights": "string"
        }
      ],
      "supported": true,
      "recommendedConfidence": "string",
      "explanation": "string"
    }
  ],
  "summary": "string"
}`
          },
        ],
        max_tokens: 4096,
      })
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    // If we get a non-200 response, let's log more details
    if (!response.ok) {
      const responseText = await response.text();
      console.error("Full error response:", responseText);
      console.error("Request details:", {
        url: "https://api.perplexity.ai/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Bearer [REDACTED]"
        },
        model: "llama-3.1-sonar-huge-128k-online"
      });
      throw new Error(`Perplexity API error: Status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Unexpected response type:", contentType);
      console.error("Response body:", text);
      throw new Error("Unexpected response type from Perplexity API");
    }

    const perplexityResponse: PerplexityResponse = await response.json();
    let responseText = perplexityResponse.choices[0].message.content;
    
    // Clean up the response text
    responseText = responseText.trim();
    
    // Remove any markdown code blocks if present
    responseText = responseText.replace(/^```json\s*/g, '').replace(/```$/g, '');
    
    // Remove any invalid characters that might break JSON parsing
    responseText = responseText.replace(/[\u0000-\u0019]+/g, "");
    
    console.log("Cleaned response text:", responseText); // Debug log

    try {
      // Validate JSON structure before parsing
      if (!responseText.startsWith('{') || !responseText.endsWith('}')) {
        throw new Error('Invalid JSON structure');
      }

      const researchResults = JSON.parse(responseText);
      
      // Validate required fields
      if (!researchResults.researchResults || !Array.isArray(researchResults.researchResults)) {
        throw new Error('Missing or invalid researchResults array');
      }

      if (!researchResults.summary || typeof researchResults.summary !== 'string') {
        throw new Error('Missing or invalid summary');
      }

      // Validate each research result
      researchResults.researchResults.forEach((result: any, index: number) => {
        if (!result.hypothesis || !result.findings || !result.statistics || 
            !result.trends || !Array.isArray(result.sources)) {
          throw new Error(`Invalid research result at index ${index}`);
        }
      });

      res.status(200).json(researchResults);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.error("Response text causing error:", responseText);
      
      res.status(500).json({
        message: "Failed to parse research results",
        error: parseError.message,
        rawResponse: responseText.substring(0, 1000), // First 1000 chars for debugging
        parseError: parseError.toString()
      });
    }
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      message: "Error conducting secondary research",
      error: error.message
    });
  }
} 