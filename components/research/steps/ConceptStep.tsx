import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { BeliefStatement, ParsedConcept, parseConceptOverview as importedParseConceptOverview } from '../concept-utils';

interface ConceptStepProps {
  projectData: any;
  onNext: () => void;
  onPrevious: () => void;
}

export const ConceptStep: React.FC<ConceptStepProps> = ({
  projectData,
  onNext,
  onPrevious,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    0: true,
    1: true,
    2: false,
    3: false
  });

  const conceptOverview = projectData?.research?.concept?.overview;
  console.log('ConceptStep - Project Data Structure:', {
    hasProjectData: !!projectData,
    hasResearch: !!projectData?.research,
    hasConcept: !!projectData?.research?.concept,
    conceptOverview: conceptOverview
  });
  const parsedConcept = conceptOverview ? importedParseConceptOverview(conceptOverview) : null;

  if (!parsedConcept) {
    return <LoadingSkeleton />;
  }

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-foreground text-xl">
            <Lightbulb className="mr-2 text-[#e36857]" size={24} />
            Product Concept
          </CardTitle>
          <CardDescription className="text-[#343541]/70 text-base">
            Review your product concept and the key beliefs that will guide your validation.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Concept Content */}
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

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="bg-white hover:bg-gray-50/80 text-[#343541] border-[#343541]/10 hover:border-[#343541]/20 transition-colors"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#e36857] hover:bg-[#e36857]/90 text-white transition-colors"
        >
          Next <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  );
};

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white/80">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
      </Card>

      <Card className="p-6 bg-white/80">
        <div className="space-y-6">
          <Skeleton className="h-6 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function parseConceptOverview(conceptOverview: string): ParsedConcept {
  // Implement the logic to parse the conceptOverview and return a ParsedConcept object
  const parsedConcept: ParsedConcept = {
    // Populate with actual parsed data
    conceptSummary: "Example summary",
    customer: [],
    problemSolution: [],
    competitiveAdvantage: [],
    businessModel: []
  };
  return parsedConcept;
}

