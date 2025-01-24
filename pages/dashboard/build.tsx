// pages/dashboard/build.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  ArrowRight,
  FileCode,
  ThumbsUp,
  Code,
  Send,
  Rocket,
  Paintbrush,
  Loader2,
  ExternalLink,
  Users,
  Target,
  ArrowRightLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BuildCover } from "@/components/build/BuildCover";
import { useProject } from '@/contexts/ProjectContext';
import { updateBuildData } from '@/lib/projects';

interface BriefSections {
  conceptSummary: string;
  goals: string;
  targetAudience: string;
  overallFeatures: string;
  mvpGoal: string;
  mvpUserFlow: string;
}

const buildSteps = [
  { name: "Generate Feature Requirements", icon: <FileCode size={20} /> },
  { name: "Generate Code", icon: <Code size={20} /> },
  { name: "Send to Code & QA Review", icon: <Send size={20} /> },
  { name: "Deploy", icon: <Rocket size={20} /> },
  { name: "Advanced Styling?", icon: <Paintbrush size={20} /> },
];

const checkAppBuilderStatus = async () => {
  try {
    const response = await fetch('http://localhost:5173/');
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Add this helper function to prepare the URL for auto-generation
const getAutoGenerateUrl = (featureRequirements: BriefSections | null): string => {
  if (!featureRequirements) return 'http://localhost:5173/';
  
  // Format the message in a more readable way
  const message = `
MVP Goal:
${featureRequirements.mvpGoal}

Key Features:
${featureRequirements.overallFeatures}

User Flow:
${featureRequirements.mvpUserFlow}
  `.trim();
  
  // Encode the message for URL safety
  const encodedMessage = encodeURIComponent(message);
  return `http://localhost:5173/auto?message=${encodedMessage}`;
};

export default function Build() {
  const { currentProject } = useProject();
  const [userName, setUserName] = useState("Jim");
  const [currentStep, setCurrentStep] = useState(0);
  const [featureRequirements, setFeatureRequirements] = useState<BriefSections | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const [needAdvancedStyling, setNeedAdvancedStyling] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [productConcept, setProductConcept] = useState("");
  const [isAppBuilderLoading, setIsAppBuilderLoading] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [isQAInProgress, setIsQAInProgress] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showCover, setShowCover] = useState(true);

  const generateProductBrief = async (conceptData: any) => {
    setIsGeneratingBrief(true);
    try {
      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: conceptData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.message}`);
      }

      const data = await response.json();
      setFeatureRequirements(data.brief);

      // Save the brief to Firebase
      if (currentProject?.id) {
        await updateBuildData(currentProject.id, {
          brief: data.brief,
          currentStep: 1,
          completedSteps: [0]
        });
      }
    } catch (error) {
      console.error('Error generating brief:', error);
      setFeatureRequirements(null);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  useEffect(() => {
    const fetchConceptAndGenerateBrief = async () => {
      const isFromRevisedIdea = new URLSearchParams(window.location.search).get('from') === 'revised-idea';
      const conceptParam = new URLSearchParams(window.location.search).get('concept');
      
      if (currentStep === 0 && isFromRevisedIdea && !featureRequirements && conceptParam) {
        try {
          const conceptData = JSON.parse(decodeURIComponent(conceptParam));
          console.log('Concept data from URL:', conceptData);
          await generateProductBrief(conceptData);
        } catch (error) {
          console.error('Error parsing concept:', error);
        }
      }
    };

    fetchConceptAndGenerateBrief();

    if (currentStep === 1) {
      setIsAppBuilderLoading(true);
      checkAppBuilderStatus().then(isRunning => {
        if (!isRunning) {
          setIframeError('App builder is not running. Please start the app builder at http://localhost:5173/');
        }
        setIsAppBuilderLoading(false);
      });
    }
  }, [currentStep, featureRequirements]);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, buildSteps.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <DashboardLayout>
      {showCover ? (
        <BuildCover onGetStarted={() => setShowCover(false)} />
      ) : (
        <div className="min-h-screen bg-[#eef3fb] relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-[url('/assets/classical-pattern.png')] opacity-10"
              style={{
                backgroundSize: "400px",
                backgroundRepeat: "repeat",
              }}
            />
          </div>

          <Progress
            value={(currentStep / (buildSteps.length - 1)) * 100}
            className="h-1 bg-[#3657e3]/10"
          />
          
          <div className="flex relative z-10">
            <div className="w-48 min-h-screen p-4 border-r border-[#3657e3]/10 bg-white/50">
              <div className="space-y-3">
                {buildSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors
                      ${index === currentStep 
                        ? "bg-[#3657e3]/10 text-[#3657e3]" 
                        : "text-[#343541]/70 hover:bg-white/80"}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div
                      className={`rounded-full p-1 transition-all ${
                        index === currentStep
                          ? "bg-[#3657e3] text-white"
                          : "bg-white/80 text-[#343541]/70"
                      }`}
                    >
                      {React.cloneElement(step.icon, { size: 14 })}
                    </div>
                    <span className="text-xs font-medium font-serif">
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 py-8 px-8 relative z-10 bg-white/50">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-[#343541] mb-2 font-serif">
                    {currentStep === 0 && "Let's prepare a quick summary of your build requirements."}
                    {currentStep === 1 && "Let's build your first version."}
                    {currentStep === 2 && "Time for a quality check"}
                    {currentStep === 3 && "Ready to ship your creation"}
                    {currentStep === 4 && "Want to add some extra polish?"}
                  </h1>
                </div>

                {/* Switch statement for different steps content remains the same */}
                {(() => {
                  switch (currentStep) {
                    case 0:
                      return (
                        <div className="max-w-3xl">
                          {isGeneratingBrief ? (
                            <div className="flex items-center gap-3 mb-6 text-lg text-[#343541]/70">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Generating product brief...
                            </div>
                          ) : (
                            <Card className="bg-white/80 backdrop-blur border-[#3657e3]/10 shadow-sm hover:shadow-md transition-all">
                              <CardHeader>
                                <div className="flex items-center gap-2">
                                  <FileCode className="h-6 w-6 text-[#3657e3]" />
                                  <div>
                                    <CardTitle>Product Brief</CardTitle>
                                    <CardDescription>
                                      A quick overview of your validated product concept
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="prose prose-sm max-w-none space-y-8">
                                  {featureRequirements ? (
                                    <>
                                      {/* Concept Summary Section */}
                                      <div className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#343541] border-b border-[#343541]/10 pb-2">
                                          <Rocket className="h-5 w-5 text-[#3657e3]" />
                                          Concept Summary & Goals
                                        </h3>
                                        <div className="pl-7 space-y-4">
                                          <div className="text-[#343541]/80">
                                            <p>{featureRequirements?.conceptSummary}</p>
                                          </div>
                                          <div className="space-y-2">
                                            {featureRequirements?.goals.split('\n').map((goal, index) => (
                                              goal.trim() && (
                                                <div key={index} className="flex items-start gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-[#3657e3] mt-2" />
                                                  <span className="text-[#343541]/80">{goal.replace(/^-\s*/, '')}</span>
                                                </div>
                                              )
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Target Audience Section */}
                                      <div className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#343541] border-b border-[#343541]/10 pb-2">
                                          <Users className="h-5 w-5 text-[#3657e3]" />
                                          Target Audience
                                        </h3>
                                        <div className="pl-7">
                                          <ul className="list-none space-y-2">
                                            {featureRequirements?.targetAudience.split('\n').map((audience, index) => (
                                              audience.trim() && (
                                                <li key={index} className="flex items-start gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-[#3657e3] mt-2" />
                                                  <span className="text-[#343541]/80">{audience.replace(/^-\s*/, '')}</span>
                                                </li>
                                              )
                                            ))}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* Overall Features Section */}
                                      <div className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#343541] border-b border-[#343541]/10 pb-2">
                                          <CheckCircle className="h-5 w-5 text-[#3657e3]" />
                                          Overall Features
                                        </h3>
                                        <div className="pl-7">
                                          <ul className="list-none space-y-2">
                                            {featureRequirements?.overallFeatures.split('\n').map((feature, index) => (
                                              feature.trim() && (
                                                <li key={index} className="flex items-start gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-[#3657e3] mt-2" />
                                                  <span className="text-[#343541]/80">{feature.replace(/^-\s*/, '')}</span>
                                                </li>
                                              )
                                            ))}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* MVP Goal Section */}
                                      <div className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#343541] border-b border-[#343541]/10 pb-2">
                                          <Target className="h-5 w-5 text-[#3657e3]" />
                                          MVP Goal
                                        </h3>
                                        <div className="pl-7 text-[#343541]/80">
                                          <p>{featureRequirements?.mvpGoal}</p>
                                        </div>
                                      </div>

                                      {/* User Flow Section */}
                                      <div className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#343541] border-b border-[#343541]/10 pb-2">
                                          <ArrowRightLeft className="h-5 w-5 text-[#3657e3]" />
                                          MVP User Flow
                                        </h3>
                                        <div className="pl-7">
                                          <div className="flex flex-col gap-2">
                                            {featureRequirements?.mvpUserFlow.split('\n').map((step, index) => (
                                              step.trim() && (
                                                <div key={index} className="flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded-full bg-[#3657e3]/10 flex items-center justify-center text-sm text-[#3657e3]">
                                                    {index + 1}
                                                  </div>
                                                  <span className="text-[#343541]/80">{step.replace(/^\d+\.\s*/, '')}</span>
                                                </div>
                                              )
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="border-t border-[#343541]/10 pt-4">
                                        <div className="flex items-center gap-2 text-[#343541]/70 bg-[#3657e3]/5 p-3 rounded-lg">
                                          <ThumbsUp className="h-4 w-4 text-[#3657e3]" />
                                          <p className="text-sm">
                                            Review all sections above and click Next when you're ready to start building.
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center py-8 text-[#343541]/70 italic">
                                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                      Generating product brief...
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          <div className="flex justify-between mt-6">
                            <Button
                              onClick={handlePreviousStep}
                              className="bg-white/80 hover:bg-white text-[#343541] border-0"
                              disabled
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextStep}
                              className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white font-serif"
                              disabled={isGeneratingBrief || !featureRequirements || Object.values(featureRequirements).every(value => !value)}
                            >
                              Next <ArrowRight className="ml-2" size={16} />
                            </Button>
                          </div>
                        </div>
                      );

                    case 1:
                      return (
                        <div className="max-w-6xl">
                          <Card className="bg-white/80 backdrop-blur border-[#3657e3]/10 shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle>Code Generation</CardTitle>
                                <CardDescription>
                                  Use the app builder below to create your application
                                </CardDescription>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => window.open(getAutoGenerateUrl(featureRequirements), '_blank')}
                                      className="hover:bg-[#3657e3]/10"
                                    >
                                      <ExternalLink className="h-5 w-5 text-[#343541]/70" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Open with auto-generation
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </CardHeader>
                            <CardContent>
                              {isAppBuilderLoading ? (
                                <div className="flex items-center gap-3 text-[#343541]/70">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Loading app builder...
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="w-full h-[800px] rounded-lg overflow-hidden border border-[#343541]/10">
                                    {iframeError ? (
                                      <div className="w-full h-full flex items-center justify-center bg-red-50 p-4">
                                        <div className="text-center space-y-4">
                                          <p className="text-red-500">{iframeError}</p>
                                          <div className="space-x-4">
                                            <Button
                                              onClick={async () => {
                                                setIsAppBuilderLoading(true);
                                                const isRunning = await checkAppBuilderStatus();
                                                if (isRunning) {
                                                  setIframeError(null);
                                                }
                                                setIsAppBuilderLoading(false);
                                              }}
                                              className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white"
                                            >
                                              Retry Connection
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                window.open(getAutoGenerateUrl(featureRequirements), '_blank');
                                              }}
                                              className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white"
                                            >
                                              Open with Auto-Generation
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <iframe 
                                        src="http://localhost:5173/"
                                        className="w-full h-full"
                                        title="App Builder"
                                        onLoad={() => {
                                          setIsAppBuilderLoading(false);
                                          setIframeError(null);
                                        }}
                                        onError={() => {
                                          setIsAppBuilderLoading(false);
                                          setIframeError('Unable to load app builder. Please ensure it is running at http://localhost:5173/');
                                        }}
                                        allow="cross-origin-isolated"
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                      />
                                    )}
                                  </div>
                                  {generatedCode && (
                                    <div className="text-red-500 mt-4">
                                      {generatedCode}
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          <div className="flex justify-between mt-6">
                            <Button
                              onClick={handlePreviousStep}
                              className="bg-white/80 hover:bg-white text-[#343541] border-0"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextStep}
                              className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white font-serif"
                            >
                              Next <ArrowRight className="ml-2" size={16} />
                            </Button>
                          </div>
                        </div>
                      );

                    case 2:
                      return (
                        <div className="max-w-3xl">
                          <Card className="bg-white/80 backdrop-blur border-[#3657e3]/10 shadow-sm hover:shadow-md transition-all">
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <Send className="h-6 w-6 text-[#3657e3]" />
                                <div>
                                  <CardTitle>Quality Assurance Check</CardTitle>
                                  <CardDescription>
                                    Verify your application's code quality and functionality
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="bg-[#3657e3]/5 p-4 rounded-lg">
                                  <h3 className="font-medium text-[#343541] mb-2">What we'll check:</h3>
                                  <ul className="space-y-2 text-sm text-[#343541]/70">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Code structure and organization
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Performance optimization
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Security best practices
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Error handling
                                    </li>
                                  </ul>
                                </div>
                                {isQAInProgress ? (
                                  <div className="flex items-center gap-3 p-4 border border-[#3657e3]/20 rounded-lg bg-white">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#3657e3]" />
                                    <div className="space-y-1">
                                      <p className="font-medium text-[#343541]">Quality check in progress...</p>
                                      <p className="text-sm text-[#343541]/70">This may take a few minutes</p>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setIsQAInProgress(true);
                                      setTimeout(() => {
                                        setIsQAInProgress(false);
                                      }, 3000);
                                    }}
                                    className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white w-full h-12 text-lg font-serif"
                                    disabled={isQAInProgress}
                                  >
                                    Start Quality Check
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          <div className="flex justify-between">
                            <Button
                              onClick={handlePreviousStep}
                              className="bg-white/80 hover:bg-white text-[#343541] border-0"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextStep}
                              className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white font-serif"
                            >
                              Next <ArrowRight className="ml-2" size={16} />
                            </Button>
                          </div>
                        </div>
                      );

                    case 3:
                      return (
                        <div className="max-w-3xl">
                          <Card className="bg-white/80 backdrop-blur border-[#3657e3]/10 shadow-sm hover:shadow-md transition-all">
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <Rocket className="h-6 w-6 text-[#3657e3]" />
                                <div>
                                  <CardTitle>Deploy Your Application</CardTitle>
                                  <CardDescription>
                                    Launch your application to a production environment
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="bg-[#3657e3]/5 p-4 rounded-lg">
                                  <h3 className="font-medium text-[#343541] mb-2">Deployment includes:</h3>
                                  <ul className="space-y-2 text-sm text-[#343541]/70">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Build optimization
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Environment configuration
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> SSL certificate setup
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Domain configuration
                                    </li>
                                  </ul>
                                </div>
                                {isDeploying ? (
                                  <div className="flex items-center gap-3 p-4 border border-[#3657e3]/20 rounded-lg bg-white">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#3657e3]" />
                                    <div className="space-y-1">
                                      <p className="font-medium text-[#343541]">Deployment in progress...</p>
                                      <p className="text-sm text-[#343541]/70">This may take a few minutes</p>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setIsDeploying(true);
                                      setTimeout(() => {
                                        setIsDeploying(false);
                                      }, 3000);
                                    }}
                                    className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white w-full h-12 text-lg font-serif"
                                    disabled={isDeploying}
                                  >
                                    Deploy Application
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          <div className="flex justify-between">
                            <Button
                              onClick={handlePreviousStep}
                              className="bg-white/80 hover:bg-white text-[#343541] border-0"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextStep}
                              className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white font-serif"
                              disabled={isDeploying}
                            >
                              Next <ArrowRight className="ml-2" size={16} />
                            </Button>
                          </div>
                        </div>
                      );

                    case 4:
                      return (
                        <div className="max-w-3xl">
                          <Card className="bg-white/80 backdrop-blur border-[#3657e3]/10 shadow-sm hover:shadow-md transition-all">
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <Paintbrush className="h-6 w-6 text-[#3657e3]" />
                                <div>
                                  <CardTitle>Advanced Styling</CardTitle>
                                  <CardDescription>
                                    Enhance your application with professional design and branding
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="bg-[#3657e3]/5 p-4 rounded-lg">
                                  <h3 className="font-medium text-[#343541] mb-2">Styling includes:</h3>
                                  <ul className="space-y-2 text-sm text-[#343541]/70">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Custom color scheme
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Typography optimization
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Advanced animations
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-[#3657e3]" /> Responsive design polish
                                    </li>
                                  </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <Button
                                    onClick={() => {
                                      setNeedAdvancedStyling(true);
                                      alert("Project sent to designer for advanced styling and branding.");
                                    }}
                                    className="bg-[#3657e3] hover:bg-[#3657e3]/90 text-white h-12 text-lg font-serif"
                                  >
                                    Yes, enhance design
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setNeedAdvancedStyling(false);
                                      alert("Project completed without advanced styling.");
                                    }}
                                    className="bg-white hover:bg-white/90 text-[#343541] border border-[#343541]/10 h-12 text-lg font-serif"
                                  >
                                    Skip styling
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Button
                            onClick={handlePreviousStep}
                            className="bg-white/80 hover:bg-white text-[#343541] border-0"
                          >
                            Previous
                          </Button>
                        </div>
                      );

                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10">
            <div
              className="h-full bg-[url('/assets/greek-pattern.png')]"
              style={{
                backgroundSize: "200px",
                backgroundRepeat: "repeat-x",
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
