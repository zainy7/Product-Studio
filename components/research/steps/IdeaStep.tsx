import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface IdeaStepProps {
  projectData: any;
  onNext: () => void;
  onPrevious: () => void;
  loading: boolean;
}

export function IdeaStep({
  projectData,
  onNext,
  onPrevious,
  loading,
}: IdeaStepProps) {
  const [ideaText, setIdeaText] = useState(projectData?.productIdea || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <p className="text-[#343541]/70">
          Briefly enter your product idea.
        </p>
        <Textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Describe your product idea here..."
          className="min-h-[200px] text-[#343541] bg-white"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!ideaText?.trim() || loading}
          className="bg-[#e36857] hover:bg-[#e36857]/90"
        >
          {loading ? "Saving..." : "Next"}
        </Button>
      </div>
    </motion.div>
  );
} 