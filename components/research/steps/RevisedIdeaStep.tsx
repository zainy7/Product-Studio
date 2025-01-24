import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from 'next/router';
import { useProject } from '@/contexts/ProjectContext';
import { useState, useEffect } from 'react';

interface RevisedIdeaStepProps {
  userName: string;
  onPrevious: () => void;
}

interface RevisedBeliefs {
  "Customer Beliefs": string[];
  "Problem and Solution Beliefs": string[];
  "Competitive Beliefs": string[];
  "Business Model Beliefs": string[];
}

export function RevisedIdeaStep({
  userName,
  onPrevious
}: RevisedIdeaStepProps) {
  const router = useRouter();
  const { currentProject } = useProject();
  const [expandedSections, setExpandedSections] = useState({
    0: true,
    1: true,
    2: false,
    3: false
  });
  const [revisedIdea, setRevisedIdea] = useState<RevisedBeliefs | null>(null);

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

  useEffect(() => {
    if (currentProject?.refinedIdea) {
      setRevisedIdea({
        "Customer Beliefs": currentProject.refinedIdea.customerBeliefs || [],
        "Problem and Solution Beliefs": currentProject.refinedIdea.problemSolutionBeliefs || [],
        "Competitive Beliefs": currentProject.refinedIdea.competitiveBeliefs || [],
        "Business Model Beliefs": currentProject.refinedIdea.businessModelBeliefs || []
      });
    }
  }, [currentProject]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleFinish = async () => {
    try {
      await router.push({
        pathname: '/dashboard/build',
        query: { 
          from: 'revised-idea',
          projectId: currentProject?.id
        }
      });
    } catch (error) {
      console.error("Error in handleFinish:", error);
    }
  };

  if (!revisedIdea) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center text-[#343541]/70">
          No revised concept available yet.
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-foreground text-xl">
          <CheckCircle className="mr-2 text-[#e36857]" size={24} />
          Concept Evolution
        </CardTitle>
        <CardDescription className="text-[#343541]/70 text-base">
          See how your concept has evolved based on research, {userName}.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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

        <div className="flex justify-between pt-4">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="bg-white hover:bg-gray-100"
          >
            Previous
          </Button>
          <Button
            onClick={handleFinish}
            className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
          >
            Move to Build! <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 