// pages/index.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { ResearchCover } from '@/components/research/ResearchCover';
import { BuildCover } from '@/components/build/BuildCover';
import { MarketingCover } from '@/components/marketing/MarketingCover';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#faf3eb]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf3eb]/80 backdrop-blur-sm border-b border-[#343541]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 font-serif text-xl font-bold text-[#343541]">
              <Image 
                src="/images/pommon.png" 
                alt="Pommon Logo" 
                width={32} 
                height={32} 
              />
              <span>Pommon Studio</span>
            </div>
            <nav className="flex space-x-8">
              <a 
                href="#research" 
                className="font-serif text-[#343541]/70 hover:text-[#e36857] transition-colors"
              >
                Research
              </a>
              <a 
                href="#build" 
                className="font-serif text-[#343541]/70 hover:text-[#3657e3] transition-colors"
              >
                Build
              </a>
              <a 
                href="#marketing" 
                className="font-serif text-[#343541]/70 hover:text-purple-700 transition-colors"
              >
                Market
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen relative bg-[#faf3eb] overflow-hidden">
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

        <div className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4"
            >
              <span className="text-[#e36857] font-medium font-serif bg-[#e36857]/10 px-4 py-2 rounded-full inline-flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Product Development Made Simple
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-bold text-[#343541] mb-6 leading-tight font-serif"
            >
              Transform Your Ideas Into
              <br />
              Successful Products
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-[#343541]/70 font-serif italic leading-relaxed max-w-3xl mx-auto"
            >
              From concept to launch, we guide you through every step of building
              remarkable products that users love.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex justify-center gap-4"
            >
              <Button
                onClick={() => router.push('/signup')}
                className="bg-[#e36857] hover:bg-[#e36857]/90 text-[#faf3eb] px-12 py-6 text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300 font-medium font-serif inline-flex items-center"
              >
                Start
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
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
      </section>

      {/* Main Content */}
      <main>
        {/* Research Section */}
        <section id="research" className="min-h-screen">
          <ResearchCover onGetStarted={async () => {
            await router.push('/dashboard/research');
          }} />
        </section>

        {/* Build Section */}
        <section id="build" className="min-h-screen">
          <BuildCover onGetStarted={() => router.push('/dashboard/build')} />
        </section>

        {/* Marketing Section */}
        <section id="marketing" className="min-h-screen">
          <MarketingCover onGetStarted={() => {}} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#343541] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-[#faf3eb]/70 font-serif">
            <p>© 2024 Pommon Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
