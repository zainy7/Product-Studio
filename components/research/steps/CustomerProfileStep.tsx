import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import { useProject } from '@/contexts/ProjectContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowRight } from 'lucide-react';

export function CustomerProfileStep() {
  const router = useRouter();
  const { currentProject } = useProject();
  const customerProfile = currentProject?.research?.customerProfile;

  if (!customerProfile) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-foreground text-xl">
            <Users className="mr-2 text-[#e36857]" size={24} />
            Target Customer Profile
          </CardTitle>
          <CardDescription className="text-[#343541]/70 text-base">
            Based on your product idea, this is your selected customer profile.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Card */}
      <Card className="bg-white/80 backdrop-blur border-[#343541]/10">
        <div className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-[#343541] font-semibold mb-3">{customerProfile.description}</h3>
            </div>

            {/* Pain Points */}
            <div>
              <p className="text-sm font-medium text-[#343541]/60 mb-2">Pain Points:</p>
              <ul className="list-disc list-inside space-y-2">
                {customerProfile.painPoints.map((point, i) => (
                  <li key={i} className="text-[#343541] text-sm leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Goals */}
            <div>
              <p className="text-sm font-medium text-[#343541]/60 mb-2">Goals:</p>
              <ul className="list-disc list-inside space-y-2">
                {customerProfile.goals.map((goal, i) => (
                  <li key={i} className="text-[#343541] text-sm leading-relaxed">
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={() => router.push('/dashboard/research')}
          variant="outline"
          className="bg-white hover:bg-gray-50/80 text-[#343541] border-[#343541]/10 hover:border-[#343541]/20 transition-colors"
        >
          Previous
        </Button>
        <Button
          onClick={() => router.push('/dashboard/research/concept')}
          className="bg-[#e36857] hover:bg-[#e36857]/90 text-white transition-colors"
        >
          Next <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white/80">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
      </Card>

      <Card className="p-6 bg-white/80">
        <div className="space-y-6">
          <Skeleton className="h-6 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
} 