import { NextPage } from 'next';
import { ResearchCanvas } from '@/components/research/ResearchCanvas';
import { useProject } from '@/contexts/ProjectContext';

const ResearchCanvasPage: NextPage = () => {
  const { currentProject } = useProject();

  // Add more detailed logging
  console.log('Research Canvas Page - Full Project Data:', {
    customerProfile: currentProject?.research?.customerProfile,
    conceptOverview: currentProject?.research?.concept?.overview,
    keyRisks: currentProject?.research?.keyRisks,
    validation: {
      method: currentProject?.research?.validation?.method,
      results: currentProject?.research?.validation?.results,
      fullValidation: currentProject?.research?.validation
    },
    fullResearch: currentProject?.research
  });

  if (!currentProject?.research) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf3eb]">
      <ResearchCanvas
        customerProfile={currentProject.research.customerProfile}
        conceptOverview={currentProject.research.concept?.overview || ''}
        hypotheses={currentProject.research.keyRisks || []}
        researchResults={currentProject.research.validation}
      />
    </div>
  );
};

export default ResearchCanvasPage; 