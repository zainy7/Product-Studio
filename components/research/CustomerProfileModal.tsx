import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface CustomerProfile {
  description: string;
  painPoints: string[];
  goals: string[];
}

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onBack: () => void;
  profiles: CustomerProfile[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  loading: boolean;
}

export function CustomerProfileModal({
  isOpen,
  onClose,
  onApprove,
  onBack,
  profiles,
  selectedIndex,
  setSelectedIndex,
  loading
}: CustomerProfileModalProps) {
  const ProfileSkeleton = () => (
    <Card className="p-4">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold mb-4">Select Your Target Customer</h2>
            <p className="text-[#343541]/70">
              Based on your product idea, here are three potential customer profiles.
              Select the one that best matches your target audience:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <>
                <ProfileSkeleton />
                <ProfileSkeleton />
                <ProfileSkeleton />
              </>
            ) : (
              profiles.map((profile, index) => (
                <Card
                  key={index}
                  className={`p-4 cursor-pointer transition-all relative ${
                    selectedIndex === index
                      ? 'border-2 border-[#e36857] shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  {selectedIndex === index && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-[#e36857] rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <h3 className="font-semibold mb-3 pr-8">{profile.description}</h3>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600">Pain Points:</p>
                    <ul className="list-disc list-inside text-sm">
                      {profile.painPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Goals:</p>
                    <ul className="list-disc list-inside text-sm">
                      {profile.goals.map((goal, i) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={onApprove}
              disabled={selectedIndex === -1 || loading}
              className="bg-[#e36857] hover:bg-[#e36857]/90 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 