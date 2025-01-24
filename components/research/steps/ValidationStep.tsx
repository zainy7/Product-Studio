import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Lightbulb, Rocket, BarChart } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

interface ResearchResponse {
  researchResults: Array<{
    hypothesis: string;
    findings: string;
    statistics: string;
    trends: string;
    sources: Array<{
      title: string;
      url: string;
      publisher: string;
      year: string;
      type: string;
      keyInsights: string;
    }>;
    supported: boolean;
    recommendedConfidence: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  summary: string;
}

const parseValidationResults = (projectData: any): ResearchResponse => {
  const sections = [
    {
      title: "Customer Research",
      icon: <Users className="h-5 w-5 text-[#e36857]" />,
    },
    {
      title: "Problem and Solution Research",
      icon: <Lightbulb className="h-5 w-5 text-[#e36857]" />,
    },
    {
      title: "Competitive Advantage Research",
      icon: <Rocket className="h-5 w-5 text-[#e36857]" />,
    },
    {
      title: "Business Model Research",
      icon: <BarChart className="h-5 w-5 text-[#e36857]" />,
    }
  ];

  // Get the validation and secondary research data
  const secondaryResearch = projectData?.secondaryResearch || {};
  const keyRisks = projectData?.keyRisks || [];
  const findings = secondaryResearch.findings || [];
  const sources = secondaryResearch.sources || [];

  // Format the research results
  const researchResults = keyRisks.map((risk: any, index: number) => ({
    hypothesis: risk.statement,
    findings: findings[index] || '',
    statistics: '',
    trends: '',
    sources: sources.map((source: string) => {
      const [title, details] = source.split(' (');
      const [publisher, year] = details?.replace(')', '').split(', ') || ['', ''];
      return {
        title,
        url: '',
        publisher,
        year,
        type: 'research_paper',
        keyInsights: findings[index] || ''
      };
    }),
    supported: risk.status === 'validated',
    recommendedConfidence: risk.status === 'validated' ? 'high' : 
                          risk.status === 'invalidated' ? 'low' : 'medium',
    explanation: findings[index] || ''
  }));

  return {
    summary: secondaryResearch.summary || 'Research findings based on secondary market research.',
    researchResults
  };
};

export function ValidationStep() {
  const { currentProject } = useProject();
  const [researchResponse, setResearchResponse] = useState<ResearchResponse | null>(null);

  useEffect(() => {
    if (currentProject) {
      const parsedResults = parseValidationResults(currentProject);
      setResearchResponse(parsedResults);
    }
  }, [currentProject]);

  const ResearchStatus = ({ supported }: { supported: boolean }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      supported 
        ? "bg-green-100 text-green-700" 
        : "bg-red-100 text-red-700"
    }`}>
      {supported ? "Validated" : "Challenged"}
    </span>
  );

  if (!researchResponse?.researchResults?.length) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center text-[#343541]/70">
          No research results available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#343541] mb-4">Research Results</h1>
        <p className="text-[#343541]/70">
          Review the findings from your secondary research and validation efforts.
        </p>
      </div>

      {researchResponse.summary && (
        <div className="p-4 bg-[#95C2B6]/10 rounded-lg border border-[#95C2B6]/20 mb-6">
          <h4 className="font-semibold text-[#343541] mb-2">Research Summary</h4>
          <p className="text-[#343541]/70">{researchResponse.summary}</p>
        </div>
      )}

      <div className="space-y-6">
        {researchResponse.researchResults.map((result, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg border border-[#343541]/10"
          >
            <h5 className="font-semibold text-[#343541] mb-3">
              Hypothesis {index + 1}
            </h5>
            <p className="text-[#343541]/70 mb-6">{result.hypothesis}</p>
            
            <div className="grid gap-6">
              <div>
                <h6 className="font-medium text-[#343541] mb-2">Key Findings</h6>
                <p className="text-[#343541]/70">{result.findings}</p>
              </div>
              <div>
                <h6 className="font-medium text-[#343541] mb-2">Statistics</h6>
                <p className="text-[#343541]/70">{result.statistics}</p>
              </div>
              <div>
                <h6 className="font-medium text-[#343541] mb-2">Trends</h6>
                <p className="text-[#343541]/70">{result.trends}</p>
              </div>

              {/* Sources Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-medium text-[#343541] mb-3">Sources</h6>
                <div className="grid gap-4">
                  {result.sources.map((source, sourceIndex) => (
                    <div key={sourceIndex} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e36857] hover:text-[#e36857]/80 font-medium"
                          >
                            {source.title}
                          </a>
                          <div className="text-sm text-[#343541]/60 mt-1">
                            {source.publisher} • {source.year}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-[#343541]/5 text-[#343541]/70 rounded text-xs">
                          {source.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-[#343541]/70 mt-2">
                        {source.keyInsights}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="font-medium text-[#343541]">Conclusion:</span>
                <ResearchStatus supported={result.supported} />
                <span className={`px-2 py-1 rounded-full text-sm ${
                  result.recommendedConfidence === 'high' 
                    ? 'bg-green-100 text-green-700'
                    : result.recommendedConfidence === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {result.recommendedConfidence.charAt(0).toUpperCase() + 
                   result.recommendedConfidence.slice(1)} Confidence
                </span>
              </div>

              <div className="mt-2">
                <p className="text-sm text-[#343541]/70 italic">
                  {result.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 