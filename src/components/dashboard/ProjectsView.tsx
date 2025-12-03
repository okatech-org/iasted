import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Github, HardDrive, Plus, Search, MoreVertical, Loader2, AlertCircle, CheckCircle2, Trash2, Archive, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { WorkflowView } from './WorkflowView';

// Types
interface ProjectSource {
  type: 'github' | 'local' | 'drive';
  path: string;
  name?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  sources: ProjectSource[];
  status: 'active' | 'archived' | 'deleted';
  lastUpdated: Date;
  workflow_data?: any;
}

// Mock API Service
const apiService = {
  getProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: '1',
        name: 'Site Présidence',
        description: 'Site officiel avec repo GitHub et assets Drive',
        sources: [
          { type: 'github', path: 'okatech/presidence.ga', name: 'Repo' },
          { type: 'drive', path: 'Drive/Specs/V2.pdf', name: 'Specs' }
        ],
        status: 'active',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Dashboard Admin',
        description: 'Interface administration',
        sources: [
          { type: 'local', path: '/Users/okatech/dashboard', name: 'Code' }
        ],
        status: 'active',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Ancien Site',
        description: 'Version 2023',
        sources: [
          { type: 'github', path: 'okatech/old-site' }
        ],
        status: 'archived',
        lastUpdated: new Date('2023-12-01')
      },
    ];
  },
  createProject: async (project: Partial<Project>): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: project.name || 'Nouveau Projet',
      description: project.description || '',
      sources: project.sources || [],
      status: 'active',
      lastUpdated: new Date(),
    } as Project;
  },
  updateProjectStatus: async (id: string, status: 'active' | 'archived' | 'deleted') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewFilter, setViewFilter] = useState<'active' | 'archived'>('active');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sources: [] as ProjectSource[]
  });
  const [tempSource, setTempSource] = useState<ProjectSource>({ type: 'local', path: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (err) {
      setError("Impossible de charger les projets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      const newProject = await apiService.createProject({
        ...formData,
        sources: [...formData.sources, ...(tempSource.path ? [tempSource] : [])]
      });
      setProjects([newProject, ...projects]);
      toast.success("Projet créé avec succès");
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', sources: [] });
      setTempSource({ type: 'local', path: '' });
    } catch (err) {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'archived' | 'deleted') => {
    try {
      await apiService.updateProjectStatus(id, status);
      setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`Projet ${status === 'deleted' ? 'supprimé' : status === 'archived' ? 'archivé' : 'restauré'} `);
    } catch (err) {
      toast.error("Action impossible");
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'drive': return <HardDrive className="w-4 h-4 text-blue-500" />;
      case 'local': return <FolderOpen className="w-4 h-4 text-yellow-500" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const filteredProjects = projects.filter(p =>
    p.status === viewFilter &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedProject) {
    return <WorkflowView project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="h-full p-6 bg-background overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Hub central de vos applications (GitHub, Drive, Local)
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewFilter === 'active' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewFilter('active')}
            >
              Actifs
            </Button>
            <Button
              variant={viewFilter === 'archived' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewFilter('archived')}
            >
              Archives
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Projet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer un Hub Projet</DialogTitle>
                <DialogDescription>
                  Rassemblez toutes les sources (Code, Specs, Assets) en un seul lieu.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Nom du projet</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mon Super Projet"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Source Principale</Label>
                  <div className="flex gap-2">
                    <select
                      className="flex h-10 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={tempSource.type}
                      onChange={(e) => setTempSource({ ...tempSource, type: e.target.value as any })}
                    >
                      <option value="local">Local</option>
                      <option value="github">GitHub</option>
                      <option value="drive">Drive</option>
                    </select>
                    <Input
                      value={tempSource.path}
                      onChange={(e) => setTempSource({ ...tempSource, path: e.target.value })}
                      placeholder={tempSource.type === 'github' ? 'user/repo' : '/path/to/folder'}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button onClick={handleCreateProject} disabled={isSubmitting} className="gradient-bg w-full">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Créer le Hub'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans vos hubs..."
          className="pl-10 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getSourceIcon(project.sources[0]?.type || 'local')}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold">{project.name}</CardTitle>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {project.sources.map((s, i) => (
                        <span key={i} className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                          {getSourceIcon(s.type)} {s.name || s.type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {project.status === 'active' ? (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(project.id, 'archived'); }}>
                        <Archive className="w-4 h-4 mr-2" /> Archiver
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(project.id, 'active'); }}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Restaurer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleStatusChange(project.id, 'deleted'); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4 h-10">
                  {project.description || "Aucune description"}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                  <Badge variant="outline" className="font-normal">
                    {project.sources.length} source{project.sources.length > 1 ? 's' : ''}
                  </Badge>
                  <span>
                    Màj {new Date(project.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
