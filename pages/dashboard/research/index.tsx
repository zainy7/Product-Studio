import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Search, Users, PenTool, CheckCircle, Target } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { InterstitialScreen } from "@/components/transitions/InterstitialScreen";
import { ResearchCanvas } from '@/components/research/ResearchCanvas';
import { useProject } from '@/contexts/ProjectContext';

// Import step components
import { IdeaStep } from "@/components/research/steps/IdeaStep";
import { ConceptStep } from "@/components/research/steps/ConceptStep";
import { HypothesesStep } from "@/components/research/steps/HypothesesStep";
import { ValidationStep as BaseValidationStep } from "@/components/research/steps/ValidationStep";
import { RevisedIdeaStep } from "@/components/research/steps/RevisedIdeaStep";
import { CustomerProfileStep } from "@/components/research/steps/CustomerProfileStep";

// Add this interface before the researchSteps array
interface StepProps {
  userName: string;
  projectData: ProjectData;
  projectId: string;
  onNext: () => void;
  onPrevious: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentStep: number;
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
}

const researchSteps = [
  { 
    name: "Initial Idea", 
    icon: <Lightbulb size={20} />, 
    component: IdeaStep 
  },
  { 
    name: "Ideal Customer", 
    icon: <Target size={20} />, 
    component: CustomerProfileStep 
  },
  { 
    name: "Concept", 
    icon: <PenTool size={20} />, 
    component: ConceptStep 
  },
  { 
    name: "Key Risks", 
    icon: <Search size={20} />, 
    component: HypothesesStep 
  },
  { 
    name: "Validation", 
    icon: <Users size={20} />, 
    component: (props: StepProps) => {
      const handleValidationComplete = async (results: ValidationResults) => {
        try {
          console.log('Saving validation results:', results);
          
          if (!props.currentProject?.id) {
            console.error('No project ID available');
            return;
          }

          // Save complete research data
          await updateResearchData(props.currentProject.id, {
            validation: {
              method: 'Secondary Research',
              results: {
                summary: results.summary,
                researchResults: results.researchResults,
                date: new Date()
              }
            },
            secondaryResearch: {
              findings: results.researchResults.map(r => r.findings).filter(Boolean),
              sources: results.researchResults.flatMap(r => 
                r.sources.map(s => `${s.title} (${s.publisher}, ${s.year})`)
              )
            },
            currentStep: 5,
            completedSteps: [0, 1, 2, 3, 4]
          });

          console.log('Research data saved successfully');
          props.onNext();
        } catch (error) {
          console.error('Error saving research data:', error);
        }
      };

      return (
        <BaseValidationStep
          {...props}
          onValidationComplete={handleValidationComplete}
        />
      );
    }
  },
  { 
    name: "Refined Idea", 
    icon: <CheckCircle size={20} />, 
    component: RevisedIdeaStep 
  },
].map(step => ({
  ...step,
  component: step.component as React.ComponentType<StepProps>
}));

// Add this interface at the top of the file
interface ProjectData {
  productIdea: string;
  conceptOverview: string;
  researchQuestions: string;
  selectedResearchOption: string;
  revisedIdea: string;
  researchResults?: string;
  currentStep?: number;
  customerProfiles?: Array<{
    description: string;
    painPoints: string[];
    goals: string[];
  }>;
  selectedProfileIndex?: number;
}

// Add these imports at the top
import { ResearchCover } from '@/components/research/ResearchCover';

// Add interface for research results
interface ResearchResult {
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
}

interface ValidationResults {
  summary: string;
  researchResults: ResearchResult[];
}

// Update the heading text to match the steps
const getStepHeading = (currentStep: number, userName: string) => {
  switch(currentStep) {
    case 0:
      return `Hey ${userName}, let's start with your initial idea!`;
    case 1:
      return `Let's identify your ideal customer`;
    case 2:
      return `Time to shape your concept`;
    case 3:
      return `Let's identify the key risks`;
    case 4:
      return `Time to validate your concept`;
    case 5:
      return `Let's refine your idea`;
  }
};

export default function Research() {
  const { currentProject } = useProject();
  const [userName, setUserName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>({
    productIdea: "",
    conceptOverview: "",
    researchQuestions: "",
    selectedResearchOption: "",
    revisedIdea: "",
    researchResults: "",
    customerProfiles: [],
    selectedProfileIndex: -1,
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");

  const [showCover, setShowCover] = useState(true);

  const getTransitionMessage = (currentStep: number, nextStep: number) => {
    const messages = {
      "0-1": "Analyzing your product idea to identify potential customer profiles...",
      "1-2": "Creating concept summary based on selected customer profile...",
      "2-3": "Generating research questions...",
      "3-4": "Preparing validation plan...",
      "4-5": "Analyzing research results...",
      "5-0": "Starting new iteration...",
    };
    return messages[`${currentStep}-${nextStep}`] || "Loading...";
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setUserName(user.displayName || "User");
        if (currentProject?.id) {
          fetchProjectData();
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [currentProject?.id]);

  useEffect(() => {
    const { step } = router.query;
    if (step) {
      const stepNumber = parseInt(step as string);
      if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber <= 5) {
        setCurrentStep(stepNumber);
        setShowCover(false);
      }
    }
  }, [router.query]);

  const fetchProjectData = async () => {
    try {
      if (!currentProject?.id) {
        console.log('❌ No current project ID');
        return;
      }

      const projectRef = doc(db, "projects", currentProject.id);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        console.log('📊 Full Firebase Data:', JSON.stringify(data, null, 2));
        
        setProjectData(data as ProjectData);
        setCurrentStep(data.currentStep || 0);
      } else {
        console.log('❌ No project document found for ID:', currentProject.id);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const handleNextStep = () => {
    const nextStep = Math.min(currentStep + 1, researchSteps.length - 1);
    setCurrentStep(nextStep);
  };

  const handlePreviousStep = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
  };

  const handleGetStarted = async (idea: string) => {
    try {
      setLoading(true);
      setShowCover(false);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error starting research:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simplify stepProps to only include what's needed for viewing
  const stepProps = {
    userName,
    projectData,
    projectId: user?.uid || '',
    onNext: () => handleNextStep(),
    onPrevious: () => handlePreviousStep(),
    loading,
    setLoading,
    currentStep,
    setIsTransitioning,
  };

  // Add this useEffect to show cover for new projects
  useEffect(() => {
    if (currentProject && !currentProject.research?.initialIdea) {
      setShowCover(true);
    }
  }, [currentProject]);

  // Get research results from the project data
  const researchResults = {
    validation: currentProject?.research?.validation,
    secondaryResearch: currentProject?.research?.secondaryResearch
  };

  // Add more detailed logging
  useEffect(() => {
    console.log('Project Research Data:', {
      validation: currentProject?.research?.validation,
      validationStructure: currentProject?.research?.validation?.researchResults,
      keyRisks: currentProject?.research?.keyRisks,
      fullResearch: currentProject?.research
    });
  }, [currentProject]);

  useEffect(() => {
    console.log('Project Data Structure:', {
      validation: currentProject?.research?.validation,
      fullPath: 'currentProject.research.validation',
      fullResearch: currentProject?.research
    });
  }, [currentProject]);

  useEffect(() => {
    console.log('Research Data:', {
      validation: currentProject?.research?.validation,
      secondaryResearch: currentProject?.research?.secondaryResearch,
      fullResearch: currentProject?.research
    });
  }, [currentProject]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf3eb]">
        Loading...
      </div>
    );
  }

  const CurrentStepComponent = researchSteps[currentStep].component;

  return (
    <DashboardLayout>
      {showCover ? (
        <ResearchCover 
          onGetStarted={handleGetStarted} 
          userName={userName} 
          setShowCover={setShowCover}
        />
      ) : (
        <div className="min-h-screen bg-[#faf3eb]">
          <Progress
            value={(currentStep / (researchSteps.length - 1)) * 100}
            className="h-1 bg-[#e36857]/10"
          />
          
          <div className="flex">
            {/* Sidebar navigation */}
            <div className="w-48 min-h-screen p-4 border-r border-gray-200 bg-white/50">
              <div className="space-y-3">
                {researchSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors
                      ${index === currentStep 
                        ? "bg-[#e36857]/10 text-[#e36857]" 
                        : "text-[#343541]/70 hover:bg-gray-100"}`}
                    onClick={() => {
                      if (index !== currentStep) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <div
                      className={`rounded-full p-1 transition-all ${
                        index === currentStep
                          ? "bg-[#e36857] text-white"
                          : "bg-white/80 text-[#343541]/70"
                      }`}
                    >
                      {React.cloneElement(step.icon, { size: 14 })}
                    </div>
                    <span className="text-xs font-medium">
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 py-8 px-8">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-[#343541]">
                    {getStepHeading(currentStep, userName)}
                  </h1>
                </div>

                <AnimatePresence mode="wait">
                  <CurrentStepComponent
                    key={currentStep}
                    {...stepProps}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isTransitioning && (
              <InterstitialScreen 
                show={true}
                message={transitionMessage}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </DashboardLayout>
  );
}
