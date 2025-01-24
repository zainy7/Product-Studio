import { createContext, useContext, useEffect, useState } from "react"
import { Project, getUserProjects, createProject } from "@/lib/projects"
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project) => void
  addProject: (name: string) => Promise<Project | null>
  loading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch projects for the current user
  useEffect(() => {
    if (!user) {
      setProjects([])
      setCurrentProject(null)
      setLoading(false)
      return
    }

    // Set up real-time listener
    const projectsRef = collection(db, "projects")
    const userProjectsQuery = query(
      projectsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(userProjectsQuery, 
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null
          }
        }) as Project[]
        
        setProjects(projectsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching projects:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Separate effect to handle currentProject updates
  useEffect(() => {
    if (currentProject && projects.length > 0) {
      const updatedProject = projects.find(p => p.id === currentProject.id)
      if (updatedProject && updatedProject !== currentProject) {
        setCurrentProject(updatedProject)
      } else if (!updatedProject) {
        setCurrentProject(null)
      }
    }
  }, [projects, currentProject])

  const addProject = async (name: string): Promise<Project | null> => {
    if (!user) return null;

    try {
      // Create a new project and wait for its data
      const newProject = await createProject(user.uid, name);
      
      // Set it as the current project
      if (newProject) {
        setCurrentProject(newProject);
      }
      
      return newProject;
    } catch (error) {
      console.error("Error adding project:", error);
      return null;
    }
  }

  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        currentProject, 
        setCurrentProject, 
        addProject,
        loading 
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
} 