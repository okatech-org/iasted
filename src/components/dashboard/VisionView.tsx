import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Layout, Activity, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function VisionView() {
    const [activeTab, setActiveTab] = useState('web-viz');
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [frontendPreview, setFrontendPreview] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Listen for events from the Agent (IAstedInterface)
    useEffect(() => {
        const handleAgentAction = (event: CustomEvent) => {
            const { action, data } = event.detail;
            console.log('👁️ [VisionView] Action reçue:', action, data);

            if (action === 'browse_url') {
                setCurrentUrl(data.url);
                setActiveTab('web-viz');
            } else if (action === 'preview_component') {
                setFrontendPreview(data.componentName);
                setActiveTab('frontend-mon');
            }
        };

        window.addEventListener('iasted-agent-action', handleAgentAction as EventListener);
        return () => {
            window.removeEventListener('iasted-agent-action', handleAgentAction as EventListener);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen change events (ESC key, etc.)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div ref={containerRef} className={cn("h-full flex flex-col p-6 bg-background", isFullscreen && "p-0")}>
            <div className={cn("mb-6 flex items-center justify-between", isFullscreen && "hidden")}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Eye className="w-8 h-8 text-primary" />
                            iAsted Vision
                        </h1>
                        <p className="text-muted-foreground">
                            Tableau de bord de visualisation et de suivi
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                        <span className="text-sm text-muted-foreground">Système Actif</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Plein écran
                    </Button>
                </div>
            </div>

            {isFullscreen && (
                <div className="absolute top-4 right-4 z-50">
                    <Button variant="secondary" size="sm" onClick={toggleFullscreen}>
                        <Minimize2 className="w-4 h-4 mr-2" />
                        Quitter
                    </Button>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col space-y-6">
                <div className={cn(isFullscreen && "hidden")}>
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="web-viz">
                            <Globe className="w-4 h-4 mr-2" />
                            Navigation Web
                        </TabsTrigger>
                        <TabsTrigger value="frontend-mon">
                            <Layout className="w-4 h-4 mr-2" />
                            Suivi Frontend
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="web-viz" className="flex-1 mt-0">
                    <Card className="h-full border-0 shadow-none">
                        {!isFullscreen && (
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Visualisation Web</CardTitle>
                                <CardDescription>
                                    Pages consultées par l'agent en temps réel
                                </CardDescription>
                            </CardHeader>
                        )}
                        <CardContent className={cn("h-full p-0 overflow-hidden bg-muted/20 relative rounded-lg border", isFullscreen && "h-screen border-0 rounded-none")}>
                            {currentUrl ? (
                                <iframe
                                    src={currentUrl}
                                    className="w-full h-full border-0"
                                    title="Agent Web View"
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Globe className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Aucune page active</p>
                                    <p className="text-sm">L'agent affichera ici les pages qu'il consulte</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="frontend-mon" className="flex-1 mt-0">
                    <Card className="h-full border-0 shadow-none">
                        {!isFullscreen && (
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Suivi Frontend</CardTitle>
                                <CardDescription>
                                    Prévisualisation des composants en cours d'implémentation
                                </CardDescription>
                            </CardHeader>
                        )}
                        <CardContent className={cn("h-full flex items-center justify-center bg-muted/20 rounded-lg border", isFullscreen && "h-screen border-0 rounded-none")}>
                            {frontendPreview ? (
                                <div className="text-center">
                                    <Layout className="w-16 h-16 mb-4 mx-auto text-primary" />
                                    <h3 className="text-xl font-semibold">{frontendPreview}</h3>
                                    <p className="text-muted-foreground">Composant en cours de prévisualisation...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Layout className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Aucun composant en prévisualisation</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
