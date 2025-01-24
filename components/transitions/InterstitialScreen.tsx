"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface InterstitialScreenProps {
  show: boolean;
  message: string;
}

export function InterstitialScreen({ show, message }: InterstitialScreenProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#343541]/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 text-[#e36857] animate-spin" />
          <p className="text-lg font-medium text-[#343541]">{message}</p>
        </div>
      </motion.div>
    </motion.div>
  );
} 