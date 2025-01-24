import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, PenTool, Search, Users, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerProfileModal } from './CustomerProfileModal';
import { IdeaEntryModal } from './IdeaEntryModal';
import { ConceptModal } from './ConceptModal';
import { ResearchQuestionsModal } from './ResearchQuestionsModal';
import { ValidationModal } from './ValidationModal';
import { RevisedConceptModal } from './RevisedConceptModal';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { ResearchCompleteScreen } from './ResearchCompleteScreen';
import { useProject } from '@/contexts/ProjectContext';
import { updateResearchData } from '@/lib/projects';
import { parseConceptOverview, parseResearchQuestions } from '@/lib/research-utils';
import { ResearchCanvas } from './ResearchCanvas';

interface ResearchCoverProps {
  onGetStarted: (idea: string) => Promise<void>;
  userName?: string;
  setShowCover: (show: boolean) => void;
}

interface CustomerProfile {
  description: string;
  painPoints: string[];
  goals: string[];
}

export function ResearchCover({ 
  onGetStarted, 
  userName = 'there',
  setShowCover 
}: ResearchCoverProps) {
  const router = useRouter();
  const { currentProject } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGeneratingProfiles, setIsGeneratingProfiles] = useState(false);
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(-1);
  const [currentIdea, setCurrentIdea] = useState('');
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [conceptOverview, setConceptOverview] = useState('');
  const [isResearchQuestionsModalOpen, setIsResearchQuestionsModalOpen] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [researchQuestions, setResearchQuestions] = useState('');
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isRevisedConceptModalOpen, setIsRevisedConceptModalOpen] = useState(false);
  const [isGeneratingRevisedConcept, setIsGeneratingRevisedConcept] = useState(false);
  const [revisedConcept, setRevisedConcept] = useState<any>(null);
  const [researchResults, setResearchResults] = useState<any>(null);
  const [isResearchComplete, setIsResearchComplete] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const steps = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Define Ideal Customer",
      description: "Identify and understand your target customers.",
      loading: isGeneratingProfiles,
      step: 1,
      onClick: () => {
        if (currentProject?.research?.customerProfile) {
          setShowCover(false);
          onGetStarted(currentIdea);
          router.push('/dashboard/research?step=1');
        }
      }
    },
    {
      icon: <PenTool className="w-5 h-5" />,
      title: "Develop Concept",
      description: "Shape your idea into a compelling product concept.",
      loading: isGeneratingConcept,
      step: 2,
      onClick: () => {
        if (currentProject?.research?.concept) {
          setShowCover(false);
          onGetStarted(currentIdea);
          router.push('/dashboard/research?step=2');
        }
      }
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Identify Key Risks",
      description: "Form key hypotheses about your product and market.",
      loading: isGeneratingQuestions,
      step: 3,
      onClick: () => {
        if (currentProject?.research?.keyRisks) {
          setShowCover(false);
          onGetStarted(currentIdea);
          router.push('/dashboard/research?step=3');
        }
      }
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Get Feedback",
      description: "Test your idea with real research and customer feedback.",
      step: 4,
      onClick: () => {
        if (currentProject?.research?.keyRisks) {
          setShowCover(false);
          onGetStarted(currentIdea);
          router.push('/dashboard/research?step=4');
        }
      }
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Refine Idea",
      description: "Refine your idea based on what you've learned.",
      loading: isGeneratingRevisedConcept,
      step: 5,
      onClick: () => {
        if (currentProject?.research?.validation) {
          setShowCover(false);
          onGetStarted(currentIdea);
          router.push('/dashboard/research?step=5');
        }
      }
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const handleIdeaSubmit = async (idea: string) => {
    setCurrentIdea(idea);
    setIsModalOpen(false);
    setIsGeneratingProfiles(true);
    
    try {
      if (currentProject?.id) {
        await updateResearchData(currentProject.id, {
          initialIdea: idea,
          currentStep: 1,
          completedSteps: [0]
        });
      }

      const response = await fetch('/api/generate-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIdea: idea })
      });
      
      if (!response.ok) throw new Error('Failed to generate profiles');
      
      const data = await response.json();
      setCustomerProfiles(data.profiles);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('Error generating profiles:', error);
    } finally {
      setIsGeneratingProfiles(false);
    }
  };

  const handleProfileApprove = async () => {
    if (selectedProfileIndex === -1) return;
    
    try {
      if (currentProject?.id) {
        await updateResearchData(currentProject.id, {
          customerProfile: {
            description: customerProfiles[selectedProfileIndex].description,
            painPoints: customerProfiles[selectedProfileIndex].painPoints,
            goals: customerProfiles[selectedProfileIndex].goals
          },
          currentStep: 2,
          completedSteps: [0, 1]
        });
      }

      setIsProfileModalOpen(false);
      setIsGeneratingConcept(true);
      
      try {
        const response = await fetch('/api/generate-concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productIdea: currentIdea,
            customerProfile: customerProfiles[selectedProfileIndex]
          })
        });
        
        if (!response.ok) throw new Error('Failed to generate concept');
        
        const data = await response.json();
        setConceptOverview(data.conceptOverview);
        setIsConceptModalOpen(true);
      } catch (error) {
        console.error('Error generating concept:', error);
      } finally {
        setIsGeneratingConcept(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConceptApprove = async () => {
    try {
      if (currentProject?.id) {
        const parsedConcept = parseConceptOverview(conceptOverview);
        await updateResearchData(currentProject.id, {
          concept: {
            overview: conceptOverview,
            targetMarket: parsedConcept.customer.map(c => c.baseText).join(', '),
            valueProposition: parsedConcept.problemSolution.map(p => p.baseText).join(', ')
          },
          currentStep: 3,
          completedSteps: [0, 1, 2]
        });
      }

      setIsConceptModalOpen(false);
      setIsGeneratingQuestions(true);
      
      try {
        const response = await fetch('/api/generate-research-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conceptOverview: conceptOverview
          })
        });
        
        if (!response.ok) throw new Error('Failed to generate research questions');
        
        const data = await response.json();
        setResearchQuestions(data.researchQuestions);
        setIsResearchQuestionsModalOpen(true);
      } catch (error) {
        console.error('Error generating research questions:', error);
      } finally {
        setIsGeneratingQuestions(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleResearchQuestionsApprove = async () => {
    try {
      if (currentProject?.id) {
        const parsedQuestions = parseResearchQuestions(researchQuestions);
        await updateResearchData(currentProject.id, {
          keyRisks: parsedQuestions.flatMap(section => 
            section.beliefs.flatMap(belief => 
              belief.hypotheses.map(hypothesis => ({
                statement: hypothesis.statement,
                category: section.title,
                status: 'unvalidated'
              }))
            )
          ),
          currentStep: 4,
          completedSteps: [0, 1, 2, 3]
        });
      }

      setIsResearchQuestionsModalOpen(false);
      setIsValidationModalOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleValidationApprove = async (results?: any) => {
    try {
      if (!currentProject?.id || !results) return;

      const validationData = {
        validation: {
          method: 'Secondary Research',
          results: {
            summary: results.summary || '',
            researchResults: results.researchResults || [],
            date: new Date()
          }
        },
        secondaryResearch: {
          findings: results.researchResults?.map((r: any) => r.findings || '').filter(Boolean) || [],
          sources: results.researchResults?.flatMap((r: any) => 
            (r.sources || []).map((s: any) => `${s.title || ''} (${s.publisher || ''}, ${s.year || ''})`)
          ) || []
        },
        currentStep: 5,
        completedSteps: [0, 1, 2, 3, 4]
      };

      await updateResearchData(currentProject.id, validationData);

      setIsValidationModalOpen(false);
      setIsGeneratingRevisedConcept(true);
      
      try {
        const response = await fetch('/api/generate-revised-concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalIdea: currentIdea,
            conceptOverview: conceptOverview,
            researchResults: results
          })
        });
        
        if (!response.ok) throw new Error('Failed to generate revised concept');
        
        const data = await response.json();
        setRevisedConcept(data.revisedIdea);
        setIsRevisedConceptModalOpen(true);
      } catch (error) {
        console.error('Error generating revised concept:', error);
      } finally {
        setIsGeneratingRevisedConcept(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRevisedConceptApprove = async () => {
    try {
      if (currentProject?.id) {
        await updateResearchData(currentProject.id, {
          refinedIdea: {
            customerBeliefs: revisedConcept["Customer Beliefs"] || [],
            problemSolutionBeliefs: revisedConcept["Problem and Solution Beliefs"] || [],
            competitiveBeliefs: revisedConcept["Competitive Beliefs"] || [],
            businessModelBeliefs: revisedConcept["Business Model Beliefs"] || []
          },
          currentStep: 6,
          completedSteps: [0, 1, 2, 3, 4, 5]
        });
      }

      setIsRevisedConceptModalOpen(false);
      setIsResearchComplete(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStepClick = (step: number) => {
    if (currentProject?.research?.completedSteps?.includes(step - 1)) {
      const coverContent = document.querySelector('.research-cover-content');
      if (coverContent) {
        coverContent.classList.add('hidden');
      }
      
      setShowCanvas(true);
    }
  };

  return (
    <>
      {isResearchComplete ? (
        <ResearchCompleteScreen 
          userName={userName} 
          revisedConcept={revisedConcept} 
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[calc(100vh-4rem)] bg-[#faf3eb] relative overflow-hidden rounded-xl"
        >
          <div className={cn("research-cover-content", showCanvas && "hidden")}>
            {/* Classical Art Pattern Background */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-[url('/assets/classical-pattern.png')] opacity-10"
                style={{
                  backgroundSize: "400px",
                  backgroundRepeat: "repeat",
                  filter: "grayscale(100%)",
                }}
              />
            </div>

            <div className="h-full relative z-10 flex">
              {/* Left Column - Quote */}
              <div className="w-[45%] h-full flex flex-col justify-center px-16 py-8">
                <div className="flex flex-col items-start justify-center h-full">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-4"
                  >
                    <span className="text-[#e36857] font-medium font-serif bg-[#e36857]/10 px-4 py-2 rounded-full">
                      Research Process
                    </span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl font-bold text-[#343541] mb-6 leading-tight font-serif"
                  >
                    Research & Validate Your Idea
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl text-[#343541]/70 font-serif italic leading-relaxed"
                  >
                    "The only real mistake is the one from which we learn nothing." – Henry Ford
                  </motion.p>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12"
                  >
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-[#e36857] hover:bg-[#e36857]/90 text-white px-12 py-6 text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300 font-medium font-serif"
                    >
                      Start
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Right Column - Steps */}
              <div className="w-[55%] h-full bg-white/50 backdrop-blur border-l border-white/20 relative">
                {/* Add solid background when working on steps */}
                {(isGeneratingProfiles || isGeneratingConcept || isGeneratingQuestions || isGeneratingRevisedConcept) && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: '#e36857',
                      opacity: 0.08,
                    }}
                  />
                )}
                <div className="h-full px-12 py-8 overflow-y-auto relative z-10">
                  <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        variants={item}
                        onClick={() => handleStepClick(index + 1)}
                        className={cn(
                          "bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all p-4 rounded-xl group flex items-center space-x-4 relative",
                          (!step.loading && !isGeneratingProfiles && !isGeneratingConcept) && "cursor-pointer"
                        )}
                      >
                        <div className="rounded-xl p-2 bg-[#e36857]/10 text-[#e36857]">
                          {step.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <h3 className="text-base font-semibold text-[#343541] font-serif">{step.title}</h3>
                            <span className="ml-2 text-xs font-medium text-[#343541]/40 font-serif">
                              Step {index + 1}
                            </span>
                            {currentProject?.research?.completedSteps?.includes(index) && 
                             currentProject?.research?.currentStep > index + 1 && (
                              <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                                Done
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#343541]/70 leading-relaxed mt-1">{step.description}</p>
                        </div>
                        {step.loading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#e36857]" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Loading dots moved below cards */}
                  {(isGeneratingProfiles || isGeneratingConcept || isGeneratingQuestions || isGeneratingRevisedConcept) && (
                    <div className="flex justify-center space-x-2 mt-8">
                      <div className="w-2 h-2 bg-[#e36857] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-[#e36857] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#e36857] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Greek Pattern Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-5">
              <div
                className="h-full bg-[url('/assets/greek-pattern.png')]"
                style={{
                  backgroundSize: "200px",
                  backgroundRepeat: "repeat-x",
                }}
              />
            </div>

            <IdeaEntryModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleIdeaSubmit}
            />

            <CustomerProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onApprove={handleProfileApprove}
              onBack={() => {
                setIsProfileModalOpen(false);
                setIsModalOpen(true);
              }}
              profiles={customerProfiles}
              selectedIndex={selectedProfileIndex}
              setSelectedIndex={setSelectedProfileIndex}
              loading={isGeneratingProfiles}
            />

            <ConceptModal
              isOpen={isConceptModalOpen}
              onClose={() => setIsConceptModalOpen(false)}
              onApprove={handleConceptApprove}
              onBack={() => {
                setIsConceptModalOpen(false);
                setIsProfileModalOpen(true);
              }}
              conceptOverview={conceptOverview}
              loading={isGeneratingConcept}
            />

            <ResearchQuestionsModal
              isOpen={isResearchQuestionsModalOpen}
              onClose={() => setIsResearchQuestionsModalOpen(false)}
              onApprove={handleResearchQuestionsApprove}
              onBack={() => {
                setIsResearchQuestionsModalOpen(false);
                setIsConceptModalOpen(true);
              }}
              researchQuestions={researchQuestions}
              loading={isGeneratingQuestions}
            />

            <ValidationModal
              isOpen={isValidationModalOpen}
              onClose={() => setIsValidationModalOpen(false)}
              onApprove={handleValidationApprove}
              onBack={() => {
                setIsValidationModalOpen(false);
                setIsResearchQuestionsModalOpen(true);
              }}
              conceptOverview={conceptOverview}
              researchQuestions={researchQuestions}
              productIdea={currentIdea}
            />

            <RevisedConceptModal
              isOpen={isRevisedConceptModalOpen}
              onClose={() => setIsRevisedConceptModalOpen(false)}
              onApprove={handleRevisedConceptApprove}
              onBack={() => {
                setIsRevisedConceptModalOpen(false);
                setIsValidationModalOpen(true);
              }}
              revisedIdea={revisedConcept}
              loading={isGeneratingRevisedConcept}
            />
          </div>

          {/* Canvas View */}
          {showCanvas && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#faf3eb]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#343541]/10 bg-white">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCanvas(false);
                    const coverContent = document.querySelector('.research-cover-content');
                    if (coverContent) {
                      coverContent.classList.remove('hidden');
                    }
                  }}
                  className="text-[#343541]/70 hover:text-[#343541]"
                >
                  ← Back to Research
                </Button>
              </div>
              
              <ResearchCanvas
                customerProfile={currentProject?.research?.customerProfile}
                conceptOverview={currentProject?.research?.concept?.overview}
                hypotheses={currentProject?.research?.keyRisks}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </>
  );
} 