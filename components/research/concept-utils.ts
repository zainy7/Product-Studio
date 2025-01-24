export interface BeliefStatement {
  baseText: string;
  hypothesis?: string;
}

export interface ParsedConcept {
  conceptSummary: string;
  customer: BeliefStatement[];
  problemSolution: BeliefStatement[];
  competitiveAdvantage: BeliefStatement[];
  businessModel: BeliefStatement[];
}

export function parseConceptOverview(text: string): ParsedConcept {
  const sections: ParsedConcept = {
    conceptSummary: "",
    customer: [],
    problemSolution: [],
    competitiveAdvantage: [],
    businessModel: [],
  };

  if (!text) return sections;

  try {
    // Split by newlines and clean up
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    // Parse Concept Summary - Updated logic
    const summaryStartIdx = lines.findIndex(line => 
      line.toLowerCase().includes('concept summary:')
    );
    
    if (summaryStartIdx !== -1) {
      // Extract the summary from the line itself if it's on the same line
      const summaryLine = lines[summaryStartIdx];
      const summaryContent = summaryLine.split('Concept Summary:')[1];
      
      if (summaryContent) {
        // If summary is on the same line, remove any markdown formatting
        sections.conceptSummary = summaryContent.trim().replace(/\*\*/g, '');
      } else if (summaryStartIdx + 1 < lines.length) {
        // If summary is on the next line, remove any markdown formatting
        sections.conceptSummary = lines[summaryStartIdx + 1].trim().replace(/\*\*/g, '');
      }
    }

    let currentSection: keyof Omit<ParsedConcept, 'conceptSummary'> | null = null;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for section headers
      if (/^1\.\s*CUSTOMER/i.test(line)) {
        currentSection = 'customer';
        continue;
      } else if (/^2\.\s*PROBLEM/i.test(line)) {
        currentSection = 'problemSolution';
        continue;
      } else if (/^3\.\s*COMPETITIVE/i.test(line)) {
        currentSection = 'competitiveAdvantage';
        continue;
      } else if (/^4\.\s*BUSINESS/i.test(line)) {
        currentSection = 'businessModel';
        continue;
      }

      // If we're in a section and the line starts with a letter followed by a period
      if (currentSection && /^[A-Z]\.\s/.test(line)) {
        const lineWithoutLetter = line.replace(/^[A-Z]\.\s*/, '');
        const beliefRegex = /<belief>(.*?)<\/belief>/g;
        const beliefs = Array.from(lineWithoutLetter.matchAll(beliefRegex));
        
        if (beliefs.length > 0) {
          let baseText = lineWithoutLetter.replace(/<belief>.*?<\/belief>/g, '').trim();
          const hypothesis = beliefs[0][1].trim();
          
          sections[currentSection].push({
            baseText,
            hypothesis
          });
        } else {
          sections[currentSection].push({
            baseText: lineWithoutLetter.trim(),
            hypothesis: ''
          });
        }
      }
    }
    
    return sections;
  } catch (error) {
    console.error('Error parsing concept:', error);
    return sections;
  }
};

// Add these interfaces
interface Hypothesis {
  statement: string;
  confidence?: 'high' | 'medium' | 'low';
}

interface Belief {
  belief: string;
  hypotheses: Hypothesis[];
}

interface Section {
  title: string;
  beliefs: Belief[];
}

export function parseConceptAndQuestions(conceptOverview: string, researchQuestions: string): Section[] {
  try {
    // Parse the concept overview
    const conceptData = typeof conceptOverview === 'string' ? JSON.parse(conceptOverview) : conceptOverview;
    
    // Parse the research questions
    const questionsData = typeof researchQuestions === 'string' ? JSON.parse(researchQuestions) : researchQuestions;

    if (!conceptData || !questionsData) {
      console.error('Invalid concept or questions data');
      return [];
    }

    // Map the sections
    const sections: Section[] = [
      {
        title: "Customer",
        beliefs: mapBeliefToHypotheses(
          conceptData.customer || [],
          questionsData.customer || []
        )
      },
      {
        title: "Problem and Solution",
        beliefs: mapBeliefToHypotheses(
          conceptData.problemSolution || [],
          questionsData.problemSolution || []
        )
      },
      {
        title: "Competitive Advantage",
        beliefs: mapBeliefToHypotheses(
          conceptData.competitiveAdvantage || [],
          questionsData.competitive || []
        )
      },
      {
        title: "Business Model",
        beliefs: mapBeliefToHypotheses(
          conceptData.businessModel || [],
          questionsData.businessModel || []
        )
      }
    ];

    return sections;
  } catch (error) {
    console.error("Error parsing concept and questions:", error);
    return [];
  }
}

function mapBeliefToHypotheses(beliefs: any[], hypotheses: any[]): Belief[] {
  return beliefs.map((belief, index) => ({
    belief: typeof belief === 'string' ? belief : belief.baseText || '',
    hypotheses: hypotheses[index] ? [{ 
      statement: hypotheses[index].toString(),
      confidence: 'medium' // Default confidence
    }] : []
  }));
}