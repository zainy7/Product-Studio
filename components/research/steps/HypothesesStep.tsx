import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';

interface Belief {
  belief: string;
  risks: Array<{
    statement: string;
    status: 'unvalidated' | 'validated' | 'invalidated';
  }>;
}

interface Section {
  title: string;
  icon: React.ReactNode;
  beliefs: Belief[];
}

interface HypothesesStepProps {
  userName: string;
  projectData: {
    productIdea: string;
    conceptOverview: string;
    researchQuestions: string;
    selectedResearchOption: string;
    revisedIdea: string;
    research?: {
      keyRisks: any[];
    };
  };
  onUpdateProject: (data: Partial<HypothesesStepProps['projectData']>) => Promise<void>;
  onNext: () => void;
  onPrevious: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

const parseKeyRisks = (keyRisks: any[]): Section[] => {
  const sections: Section[] = [
    {
      title: "Customer Research",
      icon: <Users className="h-5 w-5 text-[#e36857]" />,
      beliefs: []
    },
    {
      title: "Problem and Solution Research",
      icon: <Lightbulb className="h-5 w-5 text-[#e36857]" />,
      beliefs: []
    },
    {
      title: "Competitive Advantage Research",
      icon: <Rocket className="h-5 w-5 text-[#e36857]" />,
      beliefs: []
    },
    {
      title: "Business Model Research",
      icon: <BarChart className="h-5 w-5 text-[#e36857]" />,
      beliefs: []
    }
  ];

  const categoryMap: { [key: string]: number } = {
    "Customer Research": 0,
    "Problem and Solution Research": 1,
    "Competitive Advantage Research": 2,
    "Business Model Research": 3
  };

  keyRisks?.forEach(risk => {
    const sectionIndex = categoryMap[risk.category];
    if (sectionIndex !== undefined) {
      // Find or create the belief statement
      let belief = sections[sectionIndex].beliefs.find(b => b.belief === risk.statement);
      if (!belief) {
        belief = { belief: risk.statement, risks: [] };
        sections[sectionIndex].beliefs.push(belief);
      }
      belief.risks.push({
        statement: risk.statement,
        status: risk.status
      });
    }
  });

  return sections;
};

const SectionHeader = ({ icon, title, number }: { icon: React.ReactNode; title: string; number: string }) => (
  <div className="flex items-center gap-3">
    <div className="bg-[#e36857]/10 text-[#e36857] p-2 rounded-lg">
      {icon}
    </div>
    <h4 className="text-lg font-semibold text-[#343541] flex items-center gap-2">
      <span className="text-[#e36857]">{number}.</span>
      {title}
    </h4>
  </div>
);

const CollapsibleSection = ({ 
  section, 
  index,
  isExpanded,
  onToggle
}: { 
  section: Section; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <Card className={cn(
      "bg-white/80 backdrop-blur border-[#343541]/10 transition-all duration-200",
      isExpanded && "ring-1 ring-[#e36857]/20"
    )}>
      <CardHeader 
        className="cursor-pointer hover:bg-[#FAF3EB]/50 transition-colors rounded-t-lg" 
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <SectionHeader 
            icon={section.icon} 
            title={section.title} 
            number={(index + 1).toString()} 
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-[#343541]/70 hover:text-[#343541] hover:bg-[#e36857]/10"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-6 border-t border-[#343541]/10">
          <div className="space-y-8">
            {section.beliefs.map((belief, beliefIndex) => (
              <div key={beliefIndex} className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#343541]/60">
                    <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                      <span className="text-[#e36857]">{String.fromCharCode(65 + beliefIndex)}</span>
                    </div>
                    <span>Belief Statement</span>
                  </div>
                  <div className="text-[#343541] pl-7 leading-relaxed">
                    {belief.belief}
                  </div>
                </div>

                {belief.risks.length > 0 && (
                  <div className="space-y-4 pl-7">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-[#343541]/50" />
                      <h5 className="text-sm font-medium text-[#343541]/60">
                        Key Risks
                      </h5>
                    </div>
                    <div className="grid gap-3">
                      {belief.risks.map((risk, riskIndex) => (
                        <div 
                          key={riskIndex} 
                          className="p-4 rounded-lg bg-white border border-[#343541]/10"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-[#343541] text-sm leading-relaxed flex-1">
                              {risk.statement}
                            </p>
                            <span className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
                              risk.status === 'validated' && 'bg-green-50 text-green-700 ring-1 ring-green-200',
                              risk.status === 'invalidated' && 'bg-red-50 text-red-700 ring-1 ring-red-200',
                              risk.status === 'unvalidated' && 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
                            )}>
                              {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

interface SectionState {
  [key: number]: boolean;
}

export function HypothesesStep({
  userName,
  projectData,
  onNext,
  onPrevious
}: HypothesesStepProps) {
  const [expandedSections, setExpandedSections] = useState<SectionState>({ 0: true });
  const sections = parseKeyRisks(projectData.research?.keyRisks || []);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-foreground text-xl">
            <Search className="mr-2 text-[#e36857]" size={24} />
            Key Risks
          </CardTitle>
          <CardDescription className="text-[#343541]/70 text-base">
            Here are the key risks we need to validate, {userName}. Each risk has a status indicating whether it has been validated.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <CollapsibleSection
            key={index}
            section={section}
            index={index}
            isExpanded={!!expandedSections[index]}
            onToggle={() => toggleSection(index)}
          />
        ))}
      </div>

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
}