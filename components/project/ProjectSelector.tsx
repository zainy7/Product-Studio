import { useState, useEffect } from "react"
import { Folders, Plus, Trash2, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProject } from "@/contexts/ProjectContext"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function ProjectSelector({ className }: { className?: string }) {
  const { projects, currentProject, setCurrentProject, addProject, loading } = useProject()
  const { user } = useAuth()
  const [newProjectName, setNewProjectName] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log('ProjectSelector - Auth state:', user?.uid)
    console.log('ProjectSelector - Projects:', projects)
    console.log('ProjectSelector - Loading:', loading)
  }, [user, projects, loading])

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      const newProject = await addProject(newProjectName)
      
      if (newProject) {
        setCurrentProject(newProject)
        setNewProjectName("")
        setDialogOpen(false)
        router.push('/dashboard/research')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateProject()
    }
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(projectId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return

    try {
      await deleteDoc(doc(db, 'projects', projectToDelete))
      
      if (currentProject?.id === projectToDelete) {
        const remainingProjects = projects.filter(p => p.id !== projectToDelete)
        setCurrentProject(remainingProjects[0] || null)
      }
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-3 rounded-lg px-3 py-2 text-white/50">
        <Folders size={20} />
        <div className="flex-1 font-serif">Loading...</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-3 rounded-lg px-3 py-2 text-white hover:bg-white/10 cursor-pointer">
            <Folders size={20} />
            <div className="flex-1 font-serif truncate">
              {currentProject ? currentProject.name : "Select Project"}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 bg-[#2A2B36] border-white/10 text-white max-h-[300px] overflow-y-auto"
          align="start"
          sideOffset={5}
        >
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={cn(
                "font-serif cursor-pointer hover:bg-white/10 group flex justify-between items-center",
                currentProject?.id === project.id && "bg-white/20"
              )}
              onClick={() => setCurrentProject(project)}
            >
              <span className="truncate">{project.name}</span>
              <Trash2 
                size={16}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-2"
                onClick={(e) => handleDeleteProject(project.id, e)}
              />
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          <DropdownMenuItem
            onClick={() => setDialogOpen(true)}
            className="font-serif cursor-pointer hover:bg-white/10 sticky bottom-0 bg-[#2A2B36]"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#2A2B36] text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="font-serif">New Project</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-[#343541] border-white/10 text-white font-serif"
          />
          <Button 
            onClick={handleCreateProject}
            className="w-full bg-white/10 hover:bg-white/20"
          >
            Create Project
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#2A2B36] text-white border-white/10 max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="font-serif">Delete Project</DialogTitle>
            </div>
            <DialogDescription className="text-white/70">
              This action cannot be undone. This will permanently delete the project
              and all associated data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 