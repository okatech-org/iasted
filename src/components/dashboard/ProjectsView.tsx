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
import { supabase } from "@/integrations/supabase/client";

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
// Mock API Service Removed
// Using direct Supabase calls instead

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewFilter, setViewFilter] = useState<'active' | 'archived' | 'deleted'>('active');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

    const handleCreateRequest = (e: CustomEvent) => {
      setIsDialogOpen(true);
      if (e.detail?.name) {
        setFormData(prev => ({ ...prev, name: e.detail.name }));
      }
    };

    window.addEventListener('iasted-create-project', handleCreateRequest as EventListener);
    return () => window.removeEventListener('iasted-create-project', handleCreateRequest as EventListener);
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] = ((data as any[]) || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        sources: p.sources || [],
        // Map DB status to UI status
        status: p.status === 'in_progress' ? 'active' : p.status === 'completed' ? 'deleted' : p.status || 'active',
        lastUpdated: new Date(p.updated_at || p.created_at),
        workflow_data: {
          research: p.research_data,
          lovable: p.lovable_prompts,
          cursorFront: p.cursor_frontend_prompts,
          cursorBack: p.cursor_backend_prompts
        }
      }));

      setProjects(mappedProjects);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les projets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Vous devez être connecté pour créer un projet");
      return;
    }

    try {
      const sources = formData.sources.length > 0 ? formData.sources : (tempSource.path ? [tempSource] : []);

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          sources: sources,
          status: 'in_progress',
          user_id: user.id
        } as any)
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        sources: (data as any).sources || [],
        status: (data as any).status === 'in_progress' ? 'active' : (data as any).status || 'active',
        lastUpdated: new Date(data.created_at)
      };

      setProjects([newProject, ...projects]);
      toast.success("Projet créé avec succès");
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', sources: [] });
      setTempSource({ type: 'local', path: '' });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'archived' | 'deleted') => {
    try {
      const dbStatus = status === 'active' ? 'in_progress' : status === 'deleted' ? 'completed' : status;
      const { error } = await supabase
        .from('projects')
        .update({ status: dbStatus })
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`Projet ${status === 'deleted' ? 'supprimé' : status === 'archived' ? 'archivé' : 'restauré'} `);
    } catch (err) {
      console.error(err);
      toast.error("Action impossible");
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    // Optimistic update
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);

    // Persist to DB
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          sources: updatedProject.sources,
          // Add other fields if needed
        } as any)
        .eq('id', updatedProject.id);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to persist update", err);
      toast.error("Erreur de sauvegarde");
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
    return <WorkflowView project={selectedProject} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject} />;
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
            <Button
              variant={viewFilter === 'deleted' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewFilter('deleted')}
              className={viewFilter === 'deleted' ? 'text-destructive' : ''}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Corbeille
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
                  <Label>Sources du projet</Label>
                  <div className="flex flex-col gap-3">
                    {/* List of added sources */}
                    {formData.sources.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2">
                        {formData.sources.map((source, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                            <div className="flex items-center gap-2">
                              {getSourceIcon(source.type)}
                              <span className="font-medium">{source.type}:</span>
                              <span className="text-muted-foreground truncate max-w-[300px]">{source.path}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => {
                                const newSources = [...formData.sources];
                                newSources.splice(index, 1);
                                setFormData({ ...formData, sources: newSources });
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new source inputs */}
                    <div className="flex gap-2 items-end">
                      <div className="grid gap-1.5 flex-1">
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={tempSource.type}
                          onChange={(e) => setTempSource({ ...tempSource, type: e.target.value as any })}
                        >
                          <option value="local">Local</option>
                          <option value="github">GitHub</option>
                          <option value="drive">Drive</option>
                        </select>
                      </div>

                      <div className="grid gap-1.5 flex-[2]">
                        <Label className="text-xs text-muted-foreground">Chemin / URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={tempSource.path}
                            onChange={(e) => setTempSource({ ...tempSource, path: e.target.value })}
                            placeholder={tempSource.type === 'github' ? 'user/repo' : '/path/to/folder'}
                            className="flex-1"
                          />
                          {tempSource.type === 'local' && (
                            <>
                              <input
                                type="file"
                                // @ts-ignore
                                webkitdirectory=""
                                directory=""
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    // @ts-ignore
                                    const path = file.path ? file.path.substring(0, file.path.lastIndexOf(file.name)) : (file.webkitRelativePath.split('/')[0] || file.name);
                                    const cleanPath = path.endsWith('/') || path.endsWith('\\') ? path.slice(0, -1) : path;
                                    setTempSource({ ...tempSource, path: cleanPath });
                                  }
                                }}
                                id="folder-picker"
                              />
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => document.getElementById('folder-picker')?.click()}
                                title="Choisir un dossier"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (tempSource.path) {
                            setFormData({
                              ...formData,
                              sources: [...formData.sources, tempSource]
                            });
                            setTempSource({ type: 'local', path: '' });
                          }
                        }}
                        disabled={!tempSource.path}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
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
                    {project.status === 'deleted' ? (
                      <>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(project.id, 'active'); }}>
                          <PlayCircle className="w-4 h-4 mr-2" /> Restaurer
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }}>
                          <Trash2 className="w-4 h-4 mr-2" /> Supprimer définitivement
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
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
                          <Trash2 className="w-4 h-4 mr-2" /> Mettre à la corbeille
                        </DropdownMenuItem>
                      </>
                    )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suppression définitive</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement ce projet ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectToDelete(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (projectToDelete) {
                  try {
                    const { error } = await supabase.from('projects').delete().eq('id', projectToDelete);
                    if (error) throw error;
                    setProjects(projects.filter(p => p.id !== projectToDelete));
                    setProjectToDelete(null);
                    toast.success("Projet supprimé définitivement");
                  } catch (e) {
                    toast.error("Erreur lors de la suppression");
                  }
                }
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
