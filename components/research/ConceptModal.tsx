import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BeliefStatement, ParsedConcept, parseConceptOverview } from './concept-utils';

interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onBack: () => void;
  conceptOverview: string;
  loading: boolean;
}

export function ConceptModal({
  isOpen,
  onClose,
  onApprove,
  onBack,
  conceptOverview,
  loading
}: ConceptModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    0: true,
    1: true,
    2: false,
    3: false
  });

  const parsedConcept = parseConceptOverview(conceptOverview);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderBeliefStatements = (beliefs: BeliefStatement[]) => {
    if (!beliefs || beliefs.length === 0) {
      return <p className="text-gray-500 italic">No beliefs defined for this section</p>;
    }

    return (
      <div className="space-y-4">
        {beliefs.map((belief, index) => (
          <div key={index} className="group">
            <div className="flex items-center gap-2 mb-2 text-sm text-[#343541]/50">
              <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                <span className="text-[#e36857]">{String.fromCharCode(65 + index)}</span>
              </div>
              <span>Belief Statement</span>
            </div>

            <div className="bg-white rounded-lg border border-[#343541]/10 p-4 shadow-sm">
              <p className="text-[#343541]/70 leading-relaxed">
                {belief.baseText}
                {belief.hypothesis && (
                  <span className="text-[#e36857]"> {belief.hypothesis}</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
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
            <h2 className="text-2xl font-serif font-semibold mb-4">Review Your Product Concept</h2>
            <p className="text-[#343541]/70">
              We've developed a comprehensive concept based on your idea and target customer. 
              Review each section and approve to continue.
            </p>
          </div>

          {loading ? (
            <ConceptSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Concept Summary */}
              <Card className="bg-white/80 border-[#343541]/10 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-[#e36857]/10 text-[#e36857] p-2 rounded-lg">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#343541] mb-2">
                      Concept Summary
                    </h3>
                    <p className="text-[#343541]/70 leading-relaxed">
                      {parsedConcept.conceptSummary}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Sections */}
              {[
                { title: "Customer", icon: <Users size={20} />, data: parsedConcept.customer },
                { title: "Problem & Solution", icon: <Lightbulb size={20} />, data: parsedConcept.problemSolution },
                { title: "Competitive Advantage", icon: <Rocket size={20} />, data: parsedConcept.competitiveAdvantage },
                { title: "Business Model", icon: <BarChart size={20} />, data: parsedConcept.businessModel }
              ].map((section, index) => (
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
                      {renderBeliefStatements(section.data)}
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
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 