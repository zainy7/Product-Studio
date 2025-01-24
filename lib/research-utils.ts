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
  const sections = text.split('\n\n');
  
  return {
    conceptSummary: sections[0] || '',
    customer: extractBeliefs(sections[1] || ''),
    problemSolution: extractBeliefs(sections[2] || ''),
    competitiveAdvantage: extractBeliefs(sections[3] || ''),
    businessModel: extractBeliefs(sections[4] || '')
  };
}

function extractBeliefs(text: string): BeliefStatement[] {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => ({
      baseText: line,
      hypothesis: ''
    }));
}

export interface ParsedResearchQuestion {
  title: string;
  beliefs: Array<{
    belief: string;
    hypotheses: Array<{
      statement: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
  }>;
}

export function parseResearchQuestions(text: string): ParsedResearchQuestion[] {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const parsedSections: ParsedResearchQuestion[] = [
    { title: "Customer Research", beliefs: [] },
    { title: "Problem and Solution Research", beliefs: [] },
    { title: "Competitive Advantage Research", beliefs: [] },
    { title: "Business Model Research", beliefs: [] }
  ];
  
  let currentSectionIndex = -1;
  let currentBelief: any = null;

  lines.forEach(line => {
    if (/^1\.\s*Customer/i.test(line)) {
      currentSectionIndex = 0;
    } else if (/^2\.\s*Problem/i.test(line)) {
      currentSectionIndex = 1;
    } else if (/^3\.\s*Competitive/i.test(line)) {
      currentSectionIndex = 2;
    } else if (/^4\.\s*Business/i.test(line)) {
      currentSectionIndex = 3;
    } else if (/^[A-Z]\./.test(line) && currentSectionIndex !== -1) {
      currentBelief = {
        belief: line.replace(/^[A-Z]\.\s*/, ''),
        hypotheses: []
      };
      parsedSections[currentSectionIndex].beliefs.push(currentBelief);
    } else if (line.startsWith('-') && currentBelief) {
      const statement = line.replace(/^-\s*/, '');
      currentBelief.hypotheses.push({
        statement,
        confidence: 'medium' as const
      });
    }
  });

  return parsedSections;
} 