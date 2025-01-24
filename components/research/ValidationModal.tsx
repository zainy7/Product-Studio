import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (results?: ResearchResponse) => void;
  onBack: () => void;
  conceptOverview?: string;
  researchQuestions?: string;
  productIdea?: string;
}

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

const ResearchStatus = ({ supported }: { supported: boolean }) => (
  <span className={cn(
    "px-2 py-1 rounded-full text-xs font-medium",
    supported 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700"
  )}>
    {supported ? "Validated" : "Challenged"}
  </span>
);

export function ValidationModal({
  isOpen,
  onClose,
  onApprove,
  onBack,
  conceptOverview = '',
  researchQuestions = '',
  productIdea = ''
}: ValidationModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchResults, setResearchResults] = useState<ResearchResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showRevisedConcept, setShowRevisedConcept] = useState(false);

  const researchOptions = [
    {
      title: "Secondary Research",
      description: "Analyze existing market data and research reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Market Research Survey",
      description: "Create and distribute surveys to target customers",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Synthetic Customer Interviews",
      description: "AI-powered customer interview simulations",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Live Customer Interviews",
      description: "Schedule and conduct real customer interviews",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const handleOptionSelect = async (optionTitle: string) => {
    setSelectedOption(optionTitle);
  };

  const handleSecondaryResearch = async () => {
    setResearchLoading(true);
    try {
      const lines = researchQuestions.split('\n').map(line => line.trim()).filter(Boolean);
      let currentSection = null;
      let currentBelief = null;
      const hypotheses = [];

      for (const line of lines) {
        if (/^\d+\./.test(line)) {
          continue;
        } else if (/^[A-Z]\./.test(line)) {
          currentBelief = line.replace(/^[A-Z]\.\s*/, '');
        } else if (line.startsWith('-')) {
          const statement = line.replace(/^-\s*/, '');
          hypotheses.push({
            statement,
            confidence: 'medium'
          });
        }
      }

      console.log('Extracted hypotheses:', hypotheses);

      if (hypotheses.length === 0) {
        throw new Error('No hypotheses found to research. Please ensure research questions are properly generated.');
      }

      const response = await fetch('/api/conduct-secondary-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hypotheses,
          productIdea,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        throw new Error(errorData.message || 'Failed to conduct research');
      }

      const results = await response.json();
      
      // Validate results structure before using
      if (!results.researchResults || !Array.isArray(results.researchResults)) {
        throw new Error('Invalid research results structure');
      }

      console.log('Received research results:', results);
      setResearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error conducting research:", error);
      alert(`Research Error: ${error.message || "Failed to conduct research. Please try again."}`);
    } finally {
      setResearchLoading(false);
    }
  };

  const handleApproveClick = async () => {
    console.log('Research Results Structure Being Saved:', {
      fullStructure: researchResults,
      path: 'research.validation',
      researchResultsArray: researchResults?.researchResults,
      firstHypothesis: researchResults?.researchResults?.[0]
    });
    
    try {
      if (!researchResults) {
        console.error('No research results available');
        return;
      }
      
      await onApprove(researchResults);
    } catch (error) {
      console.error('Error in handleApproveClick:', error);
    }
  };

  const renderResearchResults = () => {
    if (!researchResults) return null;

    return (
      <div className="mt-6 space-y-6">
        <div className="p-4 bg-[#95C2B6]/10 rounded-lg border border-[#95C2B6]/20">
          <h4 className="font-semibold text-[#343541] mb-2">Research Summary</h4>
          <p className="text-[#343541]/70">{researchResults.summary}</p>
        </div>

        <div className="space-y-6">
          {researchResults.researchResults.map((result, index) => (
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

        <div className="flex justify-end">
          <Button
            onClick={handleApproveClick}
            className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
          >
            Continue with Results
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {!showResults ? (
            // Original method selection view
            <>
              <div>
                <h2 className="text-2xl font-serif font-semibold mb-4">Choose Your Research Method</h2>
                <p className="text-[#343541]/70">
                  Select how you'd like to validate your hypotheses. Each method offers different insights.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {researchOptions.map((option) => (
                  <Card
                    key={option.title}
                    className={`cursor-pointer transition-all border-2 hover:shadow-md
                      ${selectedOption === option.title
                        ? "border-[#e36857] bg-[#e36857]/5"
                        : "border-[#343541]/10 bg-white/50 hover:border-[#e36857]/50"
                      }`}
                    onClick={() => handleOptionSelect(option.title)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-[#e36857] ${selectedOption === option.title ? "bg-[#e36857]/10" : ""} p-2 rounded-lg`}>
                          {option.icon}
                        </div>
                        <h3 className="font-semibold text-[#343541]">{option.title}</h3>
                      </div>
                      <p className="text-sm text-[#343541]/70 ml-11">
                        {option.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedOption === "Secondary Research" && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSecondaryResearch}
                    className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
                    disabled={researchLoading}
                  >
                    {researchLoading ? "Conducting Research..." : "Start Secondary Research"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Research results view
            <>
              <div>
                <h2 className="text-2xl font-serif font-semibold mb-4">Research Results</h2>
                <p className="text-[#343541]/70">
                  Review the findings from your secondary research.
                </p>
              </div>
              {renderResearchResults()}
            </>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white hover:bg-gray-100"
            >
              Back
            </Button>
            {selectedOption && selectedOption !== "Secondary Research" && (
              <Button
                onClick={() => onApprove()}
                disabled={researchLoading}
                className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 