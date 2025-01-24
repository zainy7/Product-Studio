import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RevisedConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onBack: () => void;
  revisedIdea: any;
  loading: boolean;
}

export function RevisedConceptModal({
  isOpen,
  onClose,
  onApprove,
  onBack,
  revisedIdea,
  loading
}: RevisedConceptModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    0: true,
    1: true,
    2: false,
    3: false
  });

  const sections = [
    {
      title: "Customer Beliefs",
      icon: <Users className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedIdea?.["Customer Beliefs"] || []
    },
    {
      title: "Problem and Solution Beliefs",
      icon: <Lightbulb className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedIdea?.["Problem and Solution Beliefs"] || []
    },
    {
      title: "Competitive Beliefs",
      icon: <Rocket className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedIdea?.["Competitive Beliefs"] || []
    },
    {
      title: "Business Model Beliefs",
      icon: <BarChart className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedIdea?.["Business Model Beliefs"] || []
    }
  ];

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const ConceptSkeleton = () => (
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold mb-4">Review Refined Concept</h2>
            <p className="text-[#343541]/70">
              Based on the research findings, we've refined your concept. Review the updated beliefs for each section.
            </p>
          </div>

          {loading ? (
            <ConceptSkeleton />
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
                  
                  {expandedSections[index] && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#343541]/10">
                      {section.beliefs.map((belief: string, beliefIndex: number) => (
                        <div key={beliefIndex} className="mt-4">
                          <div className="bg-white rounded-lg border border-[#343541]/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                                <span className="text-[#e36857]">{String.fromCharCode(65 + beliefIndex)}</span>
                              </div>
                              <span className="text-sm font-medium text-[#343541]/60">
                                Revised Belief
                              </span>
                            </div>
                            <p className="text-[#343541]/70 pl-7">
                              {belief.includes("No changes required") ? (
                                <span className="text-green-600">{belief}</span>
                              ) : (
                                belief
                              )}
                            </p>
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
              onClick={onBack}
              className="bg-white hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={onApprove}
              disabled={loading}
              className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
            >
              Complete Research
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 