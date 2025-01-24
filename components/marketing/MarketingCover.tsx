import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Target, 
  Compass, 
  Share2, 
  MessageSquare, 
  Megaphone 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketingCoverProps {
  onGetStarted: () => void;
}

export function MarketingCover({ onGetStarted }: MarketingCoverProps) {
  const steps = [
    {
      icon: <BarChart2 className="w-5 h-5" />,
      title: "Market Analysis",
      description: "Analyze market trends, competitors, and opportunities."
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Target Audience",
      description: "Define and understand your ideal customer segments."
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: "Positioning Strategy",
      description: "Develop your unique value proposition and brand positioning."
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Marketing Channels",
      description: "Identify and prioritize effective marketing channels."
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Content Strategy",
      description: "Plan compelling content that resonates with your audience."
    },
    {
      icon: <Megaphone className="w-5 h-5" />,
      title: "Campaign Planning",
      description: "Design and schedule marketing campaigns for maximum impact."
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[calc(100vh-4rem)] bg-[#f5f3ff] relative overflow-hidden rounded-xl"
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
        {/* Left Column - Quote */}
        <div className="w-[45%] h-full flex flex-col justify-center px-16">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4"
          >
            <span className="text-purple-700 font-medium font-serif bg-purple-700/10 px-4 py-2 rounded-full">
              Marketing Strategy
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-[#343541] mb-6 leading-tight font-serif"
          >
            Create Your Marketing Masterplan
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-[#343541]/70 font-serif italic leading-relaxed"
          >
            "Great marketing makes the company look smart. Great content makes the customer feel smart."
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <Button 
              disabled
              className="bg-purple-400 cursor-not-allowed text-white px-12 py-6 text-lg rounded-full shadow-sm font-medium font-serif"
            >
              Coming Soon
            </Button>
          </motion.div>
        </div>

        {/* Right Column - Steps */}
        <div className="w-[55%] h-full bg-white/50 backdrop-blur border-l border-white/20">
          <div className="h-full px-12 py-8 overflow-y-auto">
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
                  className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all p-4 rounded-xl group flex items-center space-x-4"
                >
                  <div className="rounded-xl p-2 bg-purple-700/10 text-purple-700">
                    {step.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold text-[#343541] font-serif">{step.title}</h3>
                      <span className="ml-2 text-xs font-medium text-[#343541]/40 font-serif">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-[#343541]/70 leading-relaxed mt-1">{step.description}</p>
                  </div>
                </motion.div>
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