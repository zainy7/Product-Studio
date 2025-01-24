import React from 'react';
import { MarketingCover } from '@/components/marketing/MarketingCover';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function MarketPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#343541] relative overflow-hidden">
        <MarketingCover onGetStarted={() => {}} />
      </div>
    </DashboardLayout>
  );
} 