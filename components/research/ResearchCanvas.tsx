import React, { useState } from 'react';
import { Lightbulb, Users, Rocket, BarChart, ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BeliefStatement, ParsedConcept, parseConceptOverview as importedParseConceptOverview } from './concept-utils';

interface ValidationResults {
  method: string;
  results: {
    summary: string;
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
    date: Date;
  };
}

interface ResearchCanvasProps {
  customerProfile: {
    description: string;
    painPoints: string[];
    goals: string[];
  };
  conceptOverview: string;
  hypotheses: Array<{
    category: string;
    statement: string;
    status: 'unvalidated' | 'validated' | 'invalidated';
  }>;
  researchResults?: ValidationResults;
}

interface BeliefSectionProps {
  section: {
    title: string;
    icon: React.ReactNode;
    data: BeliefStatement[];
  };
  selectedBelief: string | null;
  onBeliefSelect: (beliefId: string) => void;
}

const BeliefSection = ({ section, selectedBelief, onBeliefSelect }: BeliefSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="bg-white/80 border-[#343541]/10">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#e36857]/10 text-[#e36857] p-2 rounded-lg">
            {section.icon}
          </div>
          <h3 className="text-lg font-semibold text-[#343541]">
            {section.title}
          </h3>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-[#343541]/10">
          <div className="space-y-3">
            {section.data.map((belief, index) => {
              const beliefId = `${section.title}-${index}`;
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer",
                    selectedBelief === beliefId
                      ? "border-[#e36857] bg-white shadow-sm"
                      : "border-[#343541]/10 bg-white/80 hover:border-[#e36857]/50"
                  )}
                  onClick={() => onBeliefSelect(beliefId)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                      <span className="text-[#e36857]">{String.fromCharCode(65 + index)}</span>
                    </div>
                    <span className="text-sm text-[#343541]/50">
                      {beliefHeadings[selectedSection]?.[index] || 'Belief Statement'}
                    </span>
                  </div>
                  <p className="text-[#343541]/70 leading-relaxed">
                    {belief.baseText}
                    {belief.hypothesis && (
                      <span className="text-[#e36857]"> {belief.hypothesis}</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

interface EvidencePanelProps {
  belief: string;
  conceptOverview: string;
  hypotheses: Array<{
    category: string;
    statement: string;
    status: 'unvalidated' | 'validated' | 'invalidated';
  }>;
  researchResults?: ValidationResults;
}

const EvidencePanel = ({ 
  belief, 
  conceptOverview, 
  hypotheses,
  researchResults
}: EvidencePanelProps) => {
  // Extract section and index from beliefId (e.g., "Customer-0")
  const [section, indexStr] = belief?.split('-') || [];
  const index = parseInt(indexStr);

  // Map section names to research categories
  const categoryMap = {
    "IdealCustomer": "Customer Research",
    "Problem & Solution": "Problem and Solution Research",
    "Competitive Advantage": "Competitive Advantage Research",
    "Business Model": "Business Model Research"
  };

  // Get the research category for this belief
  const researchCategory = categoryMap[section];

  // Filter hypotheses for this belief's category
  const categoryHypotheses = hypotheses?.filter(h => 
    h.category === researchCategory
  ) || [];

  // Get the specific hypothesis for this belief
  const beliefHypothesis = categoryHypotheses[index];

  // Find the research result at the same index as the hypothesis
  const hypothesisIndex = hypotheses?.findIndex(h => h === beliefHypothesis);
  const researchResult = researchResults?.results?.researchResults?.[hypothesisIndex];

  // Detailed logging
  console.log('EvidencePanel Matching:', {
    belief,
    section,
    index,
    researchCategory,
    hypothesesCount: hypotheses?.length,
    categoryHypothesesCount: categoryHypotheses.length,
    beliefHypothesis,
    hypothesisIndex,
    researchResultFound: !!researchResult,
    allResearchResults: researchResults?.results?.researchResults,
    matchDetails: {
      hypothesisStatement: beliefHypothesis?.statement,
      researchResultHypothesis: researchResult?.hypothesis,
      indexMatch: hypothesisIndex
    }
  });

  // Early return if no belief is selected
  if (!belief) {
    return (
      <div className="text-[#343541]/50 italic">
        Select a belief to see evidence
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#343541]">Evidence</h3>
        {beliefHypothesis && (
          <span className="text-sm text-[#343541]/50">
            {researchResult ? 'Research Available' : 'No Research Available'}
          </span>
        )}
      </div>

      {beliefHypothesis ? (
        <Card className="bg-white">
          <div className="p-6">
            {/* Hypothesis Section */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    researchResult?.supported ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                  <span className="text-sm font-medium text-[#343541]/60">Minimum Criteria</span>
                </div>
                <p className="text-[#343541]/70 leading-relaxed">
                  {beliefHypothesis.statement}
                </p>
              </div>
              {researchResult && (
                <span className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                  researchResult.supported ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {researchResult.supported ? 'Supported' : 'Not Supported'}
                </span>
              )}
            </div>

            {/* Research Evidence */}
            {researchResult ? (
              <div className="space-y-6">
                {/* Key Findings */}
                <div>
                  <h6 className="font-medium text-[#343541] mb-2">Key Findings</h6>
                  <div className="p-3 bg-[#faf3eb]/50 rounded-lg text-sm text-[#343541]/70">
                    {researchResult.findings}
                  </div>
                </div>

                {/* Statistics */}
                {researchResult.statistics && (
                  <div>
                    <h6 className="font-medium text-[#343541] mb-2">Statistics</h6>
                    <div className="p-3 bg-[#faf3eb]/50 rounded-lg text-sm text-[#343541]/70">
                      {researchResult.statistics}
                    </div>
                  </div>
                )}

                {/* Trends */}
                {researchResult.trends && (
                  <div>
                    <h6 className="font-medium text-[#343541] mb-2">Market Trends</h6>
                    <div className="p-3 bg-[#faf3eb]/50 rounded-lg text-sm text-[#343541]/70">
                      {researchResult.trends}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {researchResult.sources && researchResult.sources.length > 0 && (
                  <div>
                    <h6 className="font-medium text-[#343541] mb-2">Sources</h6>
                    <div className="space-y-2">
                      {researchResult.sources.map((source, sourceIdx) => (
                        <div key={sourceIdx} className="p-4 bg-[#faf3eb]/50 rounded-lg">
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
                )}

                {/* Confidence Level & Explanation */}
                <div className="mt-4 pt-4 border-t border-[#343541]/10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      researchResult.recommendedConfidence === 'high' 
                        ? "bg-green-100 text-green-700"
                        : researchResult.recommendedConfidence === 'medium'
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    )}>
                      {researchResult.recommendedConfidence.charAt(0).toUpperCase() + 
                       researchResult.recommendedConfidence.slice(1)} Confidence
                    </span>
                  </div>
                  <p className="text-sm text-[#343541]/70 italic">
                    {researchResult.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-[#343541]/50 italic">
                No research evidence available for this hypothesis
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="text-[#343541]/50 italic">
          No hypothesis found for this belief
        </div>
      )}
    </div>
  );
};

// Update the belief headings mapping with sub-questions
const beliefHeadings = {
  "IdealCustomer": ["Who is our first customer?"],
  "Problem & Solution": [
    "What problem is our customer trying to solve?",
    "Why is this hard today?",
    "How do we solve this problem?"
  ],
  "Competitive Advantage": [
    "Who are our competitors?",
    "How is our solution better?"
  ],
  "Business Model": [
    "How will we get customers?",
    "How will we make money?"
  ]
};

export function ResearchCanvas({ 
  customerProfile, 
  conceptOverview, 
  hypotheses,
  researchResults
}: ResearchCanvasProps) {
  const [selectedBelief, setSelectedBelief] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>("IdealCustomer");
  
  // Use the imported parse function instead of a local one
  const parsedConcept = importedParseConceptOverview(conceptOverview);

  // Add logging for props and state
  console.log('ResearchCanvas Component Data:', {
    selectedBelief,
    selectedSection,
    hypothesesCount: hypotheses?.length,
    researchResultsExists: !!researchResults,
    validationData: researchResults,
    hypotheses: hypotheses
  });

  const sections = [
    { 
      id: "IdealCustomer",
      title: "Ideal Customer", 
      icon: <Users size={20} />,
      data: parsedConcept.customer,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      hoverColor: "hover:bg-blue-50/50",
      lightColor: "bg-blue-50/30",
      iconBg: "bg-blue-100",
      type: "research",
      description: "Review customer insights"
    },
    { 
      id: "Problem & Solution",
      title: "Problem & Solution",
      icon: <Lightbulb size={20} />,
      data: parsedConcept.problemSolution,
      color: "bg-green-50 text-green-700 border-green-200",
      hoverColor: "hover:bg-green-50/50",
      lightColor: "bg-green-50/30",
      iconBg: "bg-green-100",
      type: "research",
      description: "Review problem and solution insights"
    },
    { 
      id: "Competitive Advantage",
      title: "Competitive Advantage",
      icon: <Rocket size={20} />,
      data: parsedConcept.competitiveAdvantage,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      hoverColor: "hover:bg-purple-50/50",
      lightColor: "bg-purple-50/30",
      iconBg: "bg-purple-100",
      type: "research",
      description: "Review competitive insights"
    },
    { 
      id: "Business Model",
      title: "Business Model",
      icon: <BarChart size={20} />,
      data: parsedConcept.businessModel,
      color: "bg-orange-50 text-orange-700 border-orange-200",
      hoverColor: "hover:bg-orange-50/50",
      lightColor: "bg-orange-50/30",
      iconBg: "bg-orange-100",
      type: "research",
      description: "Review business model insights"
    }
  ];

  const currentSection = sections.find(s => s.id === selectedSection);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
      {/* Concept Overview Bar */}
      <div className="border-b border-[#343541]/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#e36857]/10 text-[#e36857] p-2 rounded-lg">
              <Lightbulb size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#343541] mb-2">
                Concept Overview
              </h2>
              <p className="text-[#343541]/70 leading-relaxed max-w-4xl">
                {parsedConcept.conceptSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* "Research Summary" Header */}
      <div className="border-b border-[#343541]/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <h2 className="text-xl font-semibold text-[#343541]">
            Research Summary
          </h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="w-72 border-r border-[#343541]/10 bg-[#faf3eb]/30 overflow-y-auto">
          <div className="px-6 py-4 space-y-2.5">
            {/* Navigation Items */}
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id);
                  setSelectedBelief(null);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all border",
                  selectedSection === section.id
                    ? `${section.color} ${section.borderColor} border-2 shadow-sm`
                    : `border-transparent ${section.hoverColor} text-[#343541]/70`
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", section.iconBg)}>
                    {section.icon}
                  </div>
                  <div>
                    <span className="font-medium block">{section.title}</span>
                    {section.type === 'research' && (
                      <span className="text-xs text-[#343541]/50">
                        {section.data.length} beliefs
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column - Beliefs List */}
        <div className="w-[460px] border-r border-[#343541]/10 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            {selectedSection && (
              <>
                {sections.find(s => s.id === selectedSection)?.type === 'research' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-[#343541]/60">
                        {sections.find(s => s.id === selectedSection)?.data.length} beliefs
                      </h3>
                    </div>
                    {sections
                      .find(s => s.id === selectedSection)
                      ?.data.map((belief, index) => (
                        <Card
                          key={index}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedBelief === `${selectedSection}-${index}`
                              ? "border-[#e36857] bg-[#e36857]/5"
                              : "border-[#343541]/10 hover:border-[#e36857]/50"
                          )}
                          onClick={() => {
                            console.log('Selected belief:', `${selectedSection}-${index}`);
                            setSelectedBelief(`${selectedSection}-${index}`);
                          }}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                                <span className="text-[#e36857]">{String.fromCharCode(65 + index)}</span>
                              </div>
                              <span className="text-sm text-[#343541]/50">
                                {beliefHeadings[selectedSection]?.[index] || 'Belief Statement'}
                              </span>
                            </div>
                            <p className="text-[#343541]/70">
                              {belief.baseText}
                              {belief.hypothesis && (
                                <span className="text-[#e36857]"> {belief.hypothesis}</span>
                              )}
                            </p>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column - Evidence Panel */}
        <div className="flex-1 bg-[#faf3eb]/20 overflow-y-auto min-w-0">
          {selectedBelief ? (
            <div className="py-4 px-12 max-w-4xl mx-auto">
              <EvidencePanel
                belief={selectedBelief}
                conceptOverview={conceptOverview}
                hypotheses={hypotheses}
                researchResults={researchResults}
              />
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-white/50 rounded-2xl p-8 border border-[#343541]/10">
                  <Search className="h-12 w-12 mb-4 mx-auto text-[#343541]/30" />
                  <p className="text-lg text-[#343541]/70">
                    Select a belief to see evidence needed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Continue with BeliefSection and EvidencePanel components as updated above 