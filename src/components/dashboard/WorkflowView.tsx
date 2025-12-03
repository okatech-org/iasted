import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Copy, Check, ExternalLink, Code, Paintbrush, Database, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowViewProps {
    project: any;
    onBack: () => void;
}

export function WorkflowView({ project, onBack }: WorkflowViewProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);

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

        // Simulate Gemini Analysis
        setTimeout(() => {
            setAnalysisData({
                research: `## 🧠 Analyse Profonde Gemini 1.5 Pro
        
**Contexte du Projet :** ${project.description}
**Sources Analysées :** ${project.sources.length} fichiers (Code + Specs)

### Architecture Détectée
Le projet semble être une application React/Vite avec une forte composante documentaire.
L'analyse du code source montre une utilisation de Shadcn UI et Tailwind.

### Recommandations Stratégiques
1. **Refactoring** : Le composant \`ProjectsView\` est monolithique, il faut le découper.
2. **Performance** : L'analyse des assets montre des images non optimisées.
3. **Sécurité** : Les règles RLS Supabase semblent manquantes sur la table \`documents\`.

### Plan d'Action Généré
Gemini a mis à jour les prompts ci-contre pour inclure ces correctifs spécifiques.`,
                lovable: defaultWorkflowData.lovable + "\n\n> [!TIP] Gemini: Ajoutez une section 'Upload' drag-and-drop inspirée de la maquette V2.",
                cursorFront: defaultWorkflowData.cursorFront + "\n\n// Gemini: Attention à la prop-drilling dans DashboardLayout, utilisez un Context.",
                cursorBack: defaultWorkflowData.cursorBack + "\n\n-- Gemini: Ajoutez un index sur la colonne 'status' pour optimiser les filtres."
            });
            setIsAnalyzing(false);
            toast.success("Analyse terminée ! Les prompts ont été enrichis.");
        }, 3000);
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
