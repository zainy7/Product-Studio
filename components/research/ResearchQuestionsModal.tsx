import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ResearchQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onBack: () => void;
  researchQuestions: string;
  loading: boolean;
}

interface Section {
  title: string;
  icon: React.ReactNode;
  beliefs: Array<{
    belief: string;
    hypotheses: Array<{
      statement: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
  }>;
}

export function ResearchQuestionsModal({
  isOpen,
  onClose,
  onApprove,
  onBack,
  researchQuestions,
  loading
}: ResearchQuestionsModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    0: true,
    1: true,
    2: false,
    3: false
  });

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

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const parseResearchQuestions = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    const parsedSections: any[] = [
      { title: "Customer Research", beliefs: [] },
      { title: "Problem and Solution Research", beliefs: [] },
      { title: "Competitive Advantage Research", beliefs: [] },
      { title: "Business Model Research", beliefs: [] }
    ];
    
    let currentSectionIndex = -1;
    let currentBelief: any = null;

    const finalizeBelief = () => {
      if (currentBelief && currentSectionIndex !== -1) {
        parsedSections[currentSectionIndex].beliefs.push(currentBelief);
        currentBelief = null;
      }
    };

    lines.forEach(line => {
      // Match section headers
      if (/^1\.\s*Customer/i.test(line)) {
        finalizeBelief(); // Add previous belief before changing section
        currentSectionIndex = 0;
      } else if (/^2\.\s*Problem/i.test(line)) {
        finalizeBelief();
        currentSectionIndex = 1;
      } else if (/^3\.\s*Competitive/i.test(line)) {
        finalizeBelief();
        currentSectionIndex = 2;
      } else if (/^4\.\s*Business/i.test(line)) {
        finalizeBelief();
        currentSectionIndex = 3;
      }
      // Match belief statements
      else if (/^[A-Z]\./i.test(line) && currentSectionIndex !== -1) {
        finalizeBelief(); // Add previous belief before starting new one
        currentBelief = { 
          belief: line.replace(/^[A-Z]\.\s*/i, ''), 
          hypotheses: [] 
        };
      } 
      // Match hypotheses
      else if (line.trim().startsWith('-') && currentBelief && currentSectionIndex !== -1) {
        const statement = line.replace(/^-\s*/, '').trim();
        const confidenceLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
        currentBelief.hypotheses.push({
          statement,
          confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)]
        });
      }
    });

    // Don't forget the last belief
    finalizeBelief();

    return parsedSections;
  };

  const parsedSections = parseResearchQuestions(researchQuestions);
  console.log('Customer section:', parsedSections[0]);
  console.log('Problem section:', parsedSections[1]);

  const ConfidenceBadge = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
    const colors = {
      high: 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-200',
      low: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200'
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors[level]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Confidence
      </span>
    );
  };

  const QuestionsSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const handleApprove = async (e: React.MouseEvent) => {
    console.log('1. handleApprove clicked'); // Debug log
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('2. Before calling onApprove'); // Debug log
      // Call the onApprove handler
      await onApprove();
      console.log('3. After calling onApprove'); // Debug log
      
      // Only close if onApprove succeeds
      onClose();
      console.log('4. Modal closed'); // Debug log
    } catch (error) {
      console.error('Error in handleApprove:', error);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onBack();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white max-h-[80vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-serif font-semibold mb-4">
          Review Research Questions
        </DialogTitle>
        
        <div className="space-y-6">
          <div>
            <p className="text-[#343541]/70">
              We've identified key hypotheses to test for your product concept. 
              Review each section and approve to continue.
            </p>
          </div>

          {loading ? (
            <QuestionsSkeleton />
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <Card key={index} className="bg-white/80 border-[#343541]/10">
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#e36857]/10 text-[#e36857] p-2 rounded-lg">
                        {section.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-[#343541]">
                        {section.title}
                      </h3>
                    </div>
                    {expandedSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  
                  {expandedSections[index] && parsedSections[index] && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#343541]/10">
                      {parsedSections[index].beliefs?.map((item: any, beliefIndex: number) => (
                        <div key={beliefIndex} className="mt-6">
                          <div className="flex items-center gap-2 mb-2 text-sm text-[#343541]/50">
                            <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                              <span className="text-[#e36857]">{String.fromCharCode(65 + beliefIndex)}</span>
                            </div>
                            <span>Belief Statement</span>
                          </div>
                          <div className="bg-white rounded-lg border border-[#343541]/10 p-4 mb-4">
                            <p className="text-[#343541]/70">{item.belief}</p>
                          </div>
                          
                          <div className="space-y-3 pl-7">
                            {item.hypotheses?.map((hypothesis: any, hIndex: number) => (
                              <div 
                                key={hIndex}
                                className="p-4 rounded-lg bg-white border border-[#343541]/10"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <p className="text-[#343541]/70 text-sm">
                                    {hypothesis.statement}
                                  </p>
                                  <ConfidenceBadge level={hypothesis.confidence} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-white hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
            >
              Continue with Results
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 