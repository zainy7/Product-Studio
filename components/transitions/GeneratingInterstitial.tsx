import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GeneratingInterstitialProps {
  show: boolean;
  message: string;
  submessage?: string;
}

export function GeneratingInterstitial({ show, message, submessage }: GeneratingInterstitialProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-[#faf3eb]/95 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative rounded-xl p-8 flex flex-col items-center max-w-lg text-center"
          >
            <div className="mb-6">
              <Loader2 className="w-12 h-12 text-[#e36857] animate-spin" />
            </div>
            
            <h3 className="text-2xl font-bold text-[#343541] mb-3 font-serif">
              {message}
            </h3>
            
            {submessage && (
              <p className="text-[#343541]/70 text-lg">
                {submessage}
              </p>
            )}

            <motion.div 
              className="mt-8 flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#e36857]/30 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#e36857]/30 animate-pulse delay-150" />
              <div className="w-2 h-2 rounded-full bg-[#e36857]/30 animate-pulse delay-300" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 