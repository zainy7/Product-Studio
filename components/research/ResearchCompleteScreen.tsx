import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Users, Lightbulb, Rocket, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/router';

interface ResearchCompleteScreenProps {
  userName: string;
  revisedConcept: any;
}

export function ResearchCompleteScreen({ userName, revisedConcept }: ResearchCompleteScreenProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = React.useState({
    0: true,
    1: true,
    2: false,
    3: false
  });

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

  const sections = [
    {
      title: "Customer Beliefs",
      icon: <Users className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedConcept?.["Customer Beliefs"] || []
    },
    {
      title: "Problem and Solution Beliefs",
      icon: <Lightbulb className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedConcept?.["Problem and Solution Beliefs"] || []
    },
    {
      title: "Competitive Beliefs",
      icon: <Rocket className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedConcept?.["Competitive Beliefs"] || []
    },
    {
      title: "Business Model Beliefs",
      icon: <BarChart className="h-5 w-5 text-[#e36857]" />,
      beliefs: revisedConcept?.["Business Model Beliefs"] || []
    }
  ];

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[calc(100vh-4rem)] bg-[#faf3eb] relative overflow-hidden rounded-xl"
    >
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
        {/* Left Column - Success Message */}
        <div className="w-[45%] h-full flex flex-col justify-center px-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mb-6"
          >
            <div className="bg-[#e36857]/10 p-4 rounded-full inline-block">
              <CheckCircle className="w-12 h-12 text-[#e36857]" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-[#343541] mb-6 leading-tight font-serif"
          >
            Research Complete!
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-[#343541]/70 font-serif italic leading-relaxed"
          >
            Congratulations {userName}! You've validated your concept through research.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <Button
              onClick={() => router.push({
                pathname: '/dashboard/build',
                query: { 
                  from: 'revised-idea',
                  concept: JSON.stringify({
                    summary: "",
                    customer: revisedConcept["Customer Beliefs"],
                    problemSolution: revisedConcept["Problem and Solution Beliefs"],
                    competitiveAdvantage: revisedConcept["Competitive Beliefs"],
                    businessModel: revisedConcept["Business Model Beliefs"],
                    revisedBeliefs: revisedConcept
                  })
                }
              })}
              className="bg-[#e36857] hover:bg-[#e36857]/90 text-white px-12 py-6 text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300 font-medium font-serif"
            >
              Move to Build <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Right Column - Validated Concept */}
        <div className="w-[55%] h-full bg-white/50 backdrop-blur border-l border-white/20 relative">
          <div className="h-full px-12 py-8 overflow-y-auto">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {sections.map((section, index) => (
                <Card 
                  key={index} 
                  className="bg-white/80 backdrop-blur border-[#e36857]/10 shadow-sm hover:shadow-md transition-all"
                >
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#e36857]/10 text-[#e36857] p-2 rounded-lg">
                        {section.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-[#343541] font-serif">
                        {section.title}
                      </h3>
                    </div>
                    {expandedSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  
                  {expandedSections[index] && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#343541]/10">
                      {section.beliefs.map((belief: string, beliefIndex: number) => (
                        <div key={beliefIndex} className="mt-4">
                          <div className="bg-white rounded-lg border border-[#e36857]/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-5 w-5 rounded-full bg-[#e36857]/5 flex items-center justify-center">
                                <span className="text-[#e36857]">{String.fromCharCode(65 + beliefIndex)}</span>
                              </div>
                              <span className="text-sm font-medium text-[#343541]/60">
                                Validated Belief
                              </span>
                            </div>
                            <p className="text-[#343541]/70 pl-7">
                              {belief.includes("No changes required") ? (
                                <span className="text-[#e36857]">{belief}</span>
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
            </motion.div>
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
    </motion.div>
  );
} 