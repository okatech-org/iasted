import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Copy, Check, ExternalLink, Code, Paintbrush, Database, Sparkles, Loader2, Plus, FolderOpen, Github, HardDrive } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface WorkflowViewProps {
    project: any;
    onBack: () => void;
    onUpdate: (project: any) => void;
}

export function WorkflowView({ project, onBack, onUpdate }: WorkflowViewProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
    const [newSource, setNewSource] = useState({ type: 'local', path: '' });

    const handleAddSource = () => {
        if (!newSource.path) return;
        const updatedProject = {
            ...project,
            sources: [...project.sources, newSource]
        };
        onUpdate(updatedProject);
        setIsAddSourceOpen(false);
        setNewSource({ type: 'local', path: '' });
        toast.success("Source ajoutée avec succès");
    };

    // Mock data - In real app, this comes from project.workflow_data
    const defaultWorkflowData = {
        research: `## Analyse & Logique
Le projet "${project.name}" nécessite une architecture modulaire...`,
        lovable: `## Prompt Lovable (Interface)
\`\`\`markdown
Crée une application web moderne avec :
- Une page d'accueil avec Hero Section...
- Un dashboard utilisateur...
\`\`\``,
        cursorFront: `## Prompt Antigravity Frontend
\`\`\`markdown
Stack : React, Vite, Shadcn UI.
Structure des fichiers :
- /src/components/layout
- /src/features/auth
...
\`\`\``,
        cursorBack: `## Prompt Cursor & Antigravity Backend
\`\`\`markdown
Stack : Supabase, Edge Functions.
Schéma BDD :
- users (id, email, role)
- projects (id, user_id, data)
...
\`\`\``
    };

    const workflowData = analysisData || defaultWorkflowData;

    const handleCopy = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        toast.success('Prompt copié dans le presse-papier');
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        toast.info("Gemini analyse vos sources (GitHub, Drive, Local)...");
        setAnalysisData({
            research: '',
            lovable: '',
            cursorFront: '',
            cursorBack: ''
        });

        // Streaming Implementation using fetch
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: `Analyse le projet suivant et génère le plan d'architecture complet (Analyse, Lovable, Frontend, Backend).
                            
                            **Nom du Projet:** ${project.name}
                            **Description:** ${project.description}
                            **Sources:**
                            ${project.sources.map((s: any) => `- [${s.type}] ${s.path} (${s.name || ''})`).join('\n')}
                            
                            Agis comme un Architecte Solution Senior.`
                        }
                    ],
                    mode: 'auto-power',
                    model: 'gemini-1.5-pro'
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices?.[0]?.delta?.content || '';
                                fullText += content;

                                // Real-time parsing (Simple regex/split approach)
                                // We look for the headers defined in SYSTEM_PROMPT
                                const sections = parseSections(fullText);
                                setAnalysisData(sections);
                            } catch (e) {
                                // Ignore parse errors for partial chunks
                            }
                        }
                    }
                }
            }

            toast.success("Analyse terminée !");
        } catch (e) {
            console.error(e);
            toast.error("Erreur de connexion à Gemini");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const parseSections = (text: string) => {
        const sections = {
            research: '',
            lovable: '',
            cursorFront: '',
            cursorBack: ''
        };

        // Simple splitting based on headers
        const parts = text.split(/## \d+\. /); // Matches "## 1. ", "## 2. ", etc.

        if (parts.length > 1) sections.research = "## 1. " + parts[1];
        if (parts.length > 2) sections.lovable = extractCodeBlock(parts[2]);
        if (parts.length > 3) sections.cursorFront = extractCodeBlock(parts[3]);
        if (parts.length > 4) sections.cursorBack = extractCodeBlock(parts[4]);

        // Fallback if headers aren't perfect yet (streaming)
        if (!sections.research && text) sections.research = text;

        return sections;
    };

    const extractCodeBlock = (text: string) => {
        // Try to extract content inside ```markdown ... ``` or just return text
        const match = text.match(/```(?:markdown)?\n([\s\S]*?)```/);
        return match ? match[1] : text; // Return inner content or full text if no block yet
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {project.name}
                            <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-muted rounded-full">
                                Workflow Architect
                            </span>
                        </h1>

                        <p className="text-muted-foreground text-sm">
                            {project.sources?.length || 0} sources connectées • Dernière analyse : {analysisData ? "À l'instant" : "Jamais"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter une source
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une source</DialogTitle>
                                <DialogDescription>
                                    Ajoutez un dossier local, un dépôt GitHub ou un fichier Drive.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Type de source</Label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newSource.type}
                                        onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
                                    >
                                        <option value="local">Dossier Local</option>
                                        <option value="github">GitHub Repository</option>
                                        <option value="drive">Google Drive</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Chemin / URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newSource.path}
                                            onChange={(e) => setNewSource({ ...newSource, path: e.target.value })}
                                            placeholder={newSource.type === 'github' ? 'user/repo' : '/path/to/folder'}
                                        />
                                        {newSource.type === 'local' && (
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
                                                            setNewSource({ ...newSource, path: cleanPath });
                                                        }
                                                    }}
                                                    id="add-source-picker"
                                                />
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    onClick={() => document.getElementById('add-source-picker')?.click()}
                                                >
                                                    <FolderOpen className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSource}>Ajouter</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gradient-bg">
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Lancer l'Analyse Gemini
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
                <Tabs defaultValue="design" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="design" className="gap-2">
                            <Paintbrush className="w-4 h-4" />
                            1. Conception & Gemini
                        </TabsTrigger>
                        <TabsTrigger value="frontend" className="gap-2">
                            <Code className="w-4 h-4" />
                            2. Antigravity Frontend
                        </TabsTrigger>
                        <TabsTrigger value="backend" className="gap-2">
                            <Database className="w-4 h-4" />
                            3. Cursor & Antigravity
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Design & Lovable */}
                    <TabsContent value="design" className="flex-1 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            <Card className="flex flex-col h-full overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-500" />
                                        Analyse & Logique
                                    </CardTitle>
                                    <CardDescription>Vision globale enrichie par Gemini</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden p-0">
                                    <ScrollArea className="h-full p-6">
                                        <div className="prose dark:prose-invert max-w-none">
                                            <pre className="whitespace-pre-wrap font-sans">{workflowData.research}</pre>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col h-full overflow-hidden border-primary/20 bg-primary/5">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-primary">Prompt Lovable</CardTitle>
                                        <CardDescription>À copier dans Lovable.dev</CardDescription>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleCopy(workflowData.lovable, 'lovable')}
                                    >
                                        {copiedSection === 'lovable' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        Copier
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden p-0">
                                    <ScrollArea className="h-full p-6">
                                        <pre className="text-sm font-mono whitespace-pre-wrap bg-background/50 p-4 rounded-lg border">
                                            {workflowData.lovable}
                                        </pre>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Antigravity Frontend */}
                    <TabsContent value="frontend" className="flex-1 overflow-hidden">
                        <Card className="flex flex-col h-full overflow-hidden border-blue-500/20 bg-blue-500/5">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-blue-500">Prompt Antigravity Frontend</CardTitle>
                                    <CardDescription>Pour l'expert React/Vite (Antigravity)</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => handleCopy(workflowData.cursorFront, 'front')}
                                >
                                    {copiedSection === 'front' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    Copier
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-0">
                                <ScrollArea className="h-full p-6">
                                    <pre className="text-sm font-mono whitespace-pre-wrap bg-background/50 p-4 rounded-lg border">
                                        {workflowData.cursorFront}
                                    </pre>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Cursor Backend */}
                    <TabsContent value="backend" className="flex-1 overflow-hidden">
                        <Card className="flex flex-col h-full overflow-hidden border-purple-500/20 bg-purple-500/5">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-purple-500">Prompt Cursor & Antigravity</CardTitle>
                                    <CardDescription>Pour l'expert Backend (Opus 4.5 Thinking Max) & Antigravity</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => handleCopy(workflowData.cursorBack, 'back')}
                                >
                                    {copiedSection === 'back' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    Copier
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-0">
                                <ScrollArea className="h-full p-6">
                                    <pre className="text-sm font-mono whitespace-pre-wrap bg-background/50 p-4 rounded-lg border">
                                        {workflowData.cursorBack}
                                    </pre>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
