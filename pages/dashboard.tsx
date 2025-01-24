// pages/dashboard.tsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart,
  Brain,
  Building,
  Clock,
  Archive,
  BookOpen,
  Feather,
  Lightbulb,
  Rocket,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

// Add interfaces for project data
interface CustomerProfile {
  description: string;
  painPoints: string[];
  goals: string[];
}

interface ProjectData {
  productIdea: string;
  conceptOverview: string;
  researchQuestions: string;
  selectedResearchOption: string;
  revisedIdea: string;
  researchResults?: string;
  currentStep?: number;
  customerProfiles?: CustomerProfile[];
  selectedProfileIndex?: number;
  buildProgress?: number;
  marketingProgress?: number;
  lastActive?: string;
}

const quickActions = [
  {
    name: "Research Hub",
    icon: Lightbulb,
    color: "text-[#e36857]",
    link: "/dashboard/research",
    description: "Validate your product",
  },
  {
    name: "Build Center",
    icon: Building,
    color: "text-[#3657e3]",
    link: "/dashboard/build",
    description: "Create your MVP",
  },
  {
    name: "Marketing Lab",
    icon: Target,
    color: "text-[#95C2B6]",
    link: "/dashboard/market",
    description: "Reach your audience",
  },
  {
    name: "Knowledge Base",
    icon: Archive,
    color: "text-[#343541]",
    link: "/dashboard/knowledge",
    description: "Learn and grow",
  },
];

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current time for greeting
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = "Hello";
  if (currentHour < 12) greeting = "Good morning";
  else if (currentHour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  // Firebase auth and data fetching
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || "User");
        fetchProjectData(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchProjectData = async (userId: string) => {
    try {
      const projectRef = doc(db, "projects", userId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        setProjectData(projectSnap.data() as ProjectData);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress percentages
  const getResearchProgress = () => {
    if (!projectData) return 0;
    const steps = ['productIdea', 'customerProfiles', 'conceptOverview', 'researchQuestions', 'researchResults', 'revisedIdea'];
    const completedSteps = steps.filter(step => projectData[step] && projectData[step].length > 0).length;
    return (completedSteps / steps.length) * 100;
  };

  const getBuildProgress = () => {
    return projectData?.buildProgress || 0;
  };

  const getMarketingProgress = () => {
    return projectData?.marketingProgress || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf3eb]">
        Loading...
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#faf3eb]">
        {/* Hero Section */}
        <div className="relative mb-8 p-8 overflow-hidden rounded-xl">
          <div
            className="absolute inset-0 bg-[url('/assets/classical-pattern.png')] opacity-10"
            style={{
              backgroundSize: "400px",
              backgroundRepeat: "repeat",
              filter: "grayscale(100%)",
            }}
          />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight text-[#343541] mb-2 font-serif">
              {greeting}, {userName}
            </h1>
            <p className="text-[#343541]/70 text-lg max-w-[600px] font-serif italic">
              "Every artist was first an amateur" - Ralph Waldo Emerson
            </p>
          </div>
        </div>

        <div className="px-8 space-y-8">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${action.color} transition-colors`}>
                        <action.icon size={24} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-[#343541]">
                          {action.name}
                        </h3>
                        <p className="text-sm text-[#343541]/60">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#343541]/40 group-hover:text-[#e36857] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Progress Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#343541]/70 font-serif">
                  Research Progress
                </CardTitle>
                <Brain className="h-4 w-4 text-[#e36857] absolute top-4 right-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#343541]">
                  {Math.round(getResearchProgress())}%
                </div>
                <Progress 
                  value={getResearchProgress()} 
                  className="mt-2 bg-[#e36857]/10" 
                />
                <p className="text-xs text-[#343541]/70 mt-2">
                  {projectData?.currentStep ? `Step ${projectData.currentStep + 1} of 6` : 'Not started'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#343541]/70 font-serif">
                  Build Progress
                </CardTitle>
                <Clock className="h-4 w-4 text-[#3657e3] absolute top-4 right-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#343541]">
                  {Math.round(getBuildProgress())}%
                </div>
                <Progress 
                  value={getBuildProgress()} 
                  className="mt-2 bg-[#3657e3]/10" 
                />
                <p className="text-xs text-[#343541]/70 mt-2">
                  {getBuildProgress() > 0 ? 'In progress' : 'Not started'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#343541]/70 font-serif">
                  Marketing Progress
                </CardTitle>
                <Activity className="h-4 w-4 text-[#95C2B6] absolute top-4 right-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#343541]">
                  {Math.round(getMarketingProgress())}%
                </div>
                <Progress 
                  value={getMarketingProgress()} 
                  className="mt-2 bg-[#95C2B6]/10" 
                />
                <p className="text-xs text-[#343541]/70 mt-2">
                  {getMarketingProgress() > 0 ? 'In progress' : 'Not started'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#e36857] text-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/90 font-serif">
                  Project Overview
                </CardTitle>
                <BarChart className="h-4 w-4 text-white/70 absolute top-4 right-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projectData?.productIdea ? 'Active' : 'New Project'}
                </div>
                <p className="text-xs text-white/80 mt-2">
                  Last active: {projectData?.lastActive || 'Never'}
                </p>
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => router.push('/dashboard/research')}
                >
                  Continue Project
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="md:col-span-4 bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Feather className="mr-2 h-5 w-5 text-[#e36857]" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData?.productIdea ? (
                    <div className="space-y-2">
                      <h3 className="font-medium text-[#343541]">Product Idea</h3>
                      <p className="text-sm text-[#343541]/70">{projectData.productIdea}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#343541]/70">
                      <p>No project data yet. Start by defining your product idea.</p>
                      <Button
                        className="mt-4 bg-[#e36857] hover:bg-[#e36857]/90 text-white"
                        onClick={() => router.push('/dashboard/research')}
                      >
                        Start New Project
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 bg-[#95C2B6] text-white border-0 shadow-sm relative overflow-hidden">
              <div
                className="absolute inset-0 bg-[url('/assets/greek-pattern.png')] opacity-5"
                style={{
                  backgroundSize: "200px",
                  backgroundRepeat: "repeat",
                }}
              />
              <CardHeader>
                <CardTitle className="font-serif">Next Steps</CardTitle>
                <CardDescription className="text-white/80">
                  Recommended actions to move forward
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {!projectData?.productIdea && (
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">Define Product Idea</p>
                        <p className="text-sm text-white/80">Research Phase</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={() => router.push('/dashboard/research')}
                      >
                        Start
                      </Button>
                    </div>
                  )}
                  
                  {projectData?.productIdea && !projectData?.customerProfiles?.length && (
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">Define Target Customer</p>
                        <p className="text-sm text-white/80">Research Phase</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={() => router.push('/dashboard/research')}
                      >
                        Continue
                      </Button>
                    </div>
                  )}

                  {projectData?.customerProfiles?.length > 0 && getBuildProgress() === 0 && (
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">Start Building MVP</p>
                        <p className="text-sm text-white/80">Build Phase</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={() => router.push('/dashboard/build')}
                      >
                        Start
                      </Button>
                    </div>
                  )}

                  {getBuildProgress() > 0 && getMarketingProgress() === 0 && (
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">Plan Marketing Strategy</p>
                        <p className="text-sm text-white/80">Marketing Phase</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={() => router.push('/dashboard/market')}
                      >
                        Start
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
