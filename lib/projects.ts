import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, serverTimestamp, DocumentReference, getDoc, setDoc } from 'firebase/firestore'

export interface ResearchData {
  initialIdea?: string
  customerProfile?: {
    description: string
    painPoints: string[]
    goals: string[]
  }
  concept?: {
    overview: string
    targetMarket?: string
    valueProposition?: string
  }
  keyRisks?: Array<{
    statement: string
    category: string
    status: 'unvalidated' | 'validated' | 'invalidated'
  }>
  validation?: {
    method: string
    results: {
      summary: string
      researchResults: Array<{
        hypothesis: string
        findings: string
        statistics: string
        trends: string
        sources: Array<{
          title: string
          url: string
          publisher: string
          year: string
          type: string
          keyInsights: string
        }>
        supported: boolean
        recommendedConfidence: 'high' | 'medium' | 'low'
        explanation: string
      }>
      date: Date
    }
  }
  secondaryResearch?: {
    findings: string[]
    sources: string[]
  }
  refinedIdea?: {
    customerBeliefs: string[];
    problemSolutionBeliefs: string[];
    competitiveBeliefs: string[];
    businessModelBeliefs: string[];
  }
  currentStep: number
  completedSteps: number[]
  lastUpdated: Date
}

export interface BuildData {
  brief?: {
    conceptSummary: string
    goals: string
    targetAudience: string
    overallFeatures: string
    mvpGoal: string
    mvpUserFlow: string
  }
  currentStep: number
  completedSteps: number[]
  lastUpdated: Date
}

export interface Project {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
  research?: ResearchData
  build?: BuildData
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const projectsRef = collection(db, 'projects')
  const q = query(
    projectsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore Timestamps to Dates
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as Project[]
}

export async function createProject(userId: string, name: string): Promise<Project | null> {
  try {
    const projectRef = doc(collection(db, 'projects'));
    const newProject = {
      id: projectRef.id,
      name,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(projectRef, newProject);
    
    // Return the new project with proper date handling
    return {
      ...newProject,
      id: projectRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function updateProject(projectId: string, data: Partial<Project>) {
  const projectRef = doc(db, 'projects', projectId)
  await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function updateResearchData(
  projectId: string, 
  researchData: Partial<ResearchData>
) {
  const projectRef = doc(db, 'projects', projectId)
  
  // First get the existing research data
  const projectSnap = await getDoc(projectRef)
  const existingResearch = projectSnap.data()?.research || {}
  
  // Convert any Date objects to Firestore timestamps
  const processedData = JSON.parse(JSON.stringify(researchData, (key, value) => {
    if (value instanceof Date) {
      return serverTimestamp()
    }
    return value
  }))
  
  // Merge existing research with new data
  await updateDoc(projectRef, {
    research: {
      ...existingResearch,
      ...processedData,
      lastUpdated: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  })
}

export async function updateBuildData(
  projectId: string, 
  buildData: Partial<BuildData>
) {
  const projectRef = doc(db, 'projects', projectId)
  
  // First get the existing build data
  const projectSnap = await getDoc(projectRef)
  const existingBuild = projectSnap.data()?.build || {}
  
  // Merge existing build with new data
  await updateDoc(projectRef, {
    build: {
      ...existingBuild,
      ...buildData,
      lastUpdated: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  })
} 