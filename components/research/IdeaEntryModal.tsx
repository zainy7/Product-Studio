import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface IdeaEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idea: string) => Promise<void>;
}

export function IdeaEntryModal({ isOpen, onClose, onSubmit }: IdeaEntryModalProps) {
  const [ideaText, setIdeaText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!ideaText.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(ideaText);
    } catch (error) {
      console.error('Error submitting idea:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Share Your Product Idea</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-[#343541]/70">
            Briefly describe your product idea. Don't worry about making it perfect - 
            we'll help you refine it through the research process.
          </p>
          
          <Textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="Describe your product idea here..."
            className="min-h-[200px] text-[#343541] bg-white/50"
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!ideaText.trim() || loading}
              className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
            >
              {loading ? "Submitting..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 