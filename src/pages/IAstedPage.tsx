import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Layout, Activity, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IAstedPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('web-viz');
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [frontendPreview, setFrontendPreview] = useState<string | null>(null);

    // Listen for events from the Agent (IAstedInterface)
    useEffect(() => {
        const handleAgentAction = (event: CustomEvent) => {
            const { action, data } = event.detail;
            console.log('👁️ [IAstedPage] Action reçue:', action, data);

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

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>
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
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Système Actif</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

                <TabsContent value="web-viz" className="space-y-4">
                    <Card className="h-[calc(100vh-200px)]">
                        <CardHeader>
                            <CardTitle>Visualisation Web</CardTitle>
                            <CardDescription>
                                Pages consultées par l'agent en temps réel
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-full p-0 overflow-hidden bg-muted/20 relative">
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

                <TabsContent value="frontend-mon" className="space-y-4">
                    <Card className="h-[calc(100vh-200px)]">
                        <CardHeader>
                            <CardTitle>Suivi Frontend</CardTitle>
                            <CardDescription>
                                Prévisualisation des composants en cours d'implémentation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-full flex items-center justify-center bg-muted/20">
                            {frontendPreview ? (
                                <div className="text-center">
                                    <Layout className="w-16 h-16 mb-4 mx-auto text-primary" />
                                    <h3 className="text-xl font-semibold">{frontendPreview}</h3>
                                    <p className="text-muted-foreground">Composant en cours de prévisualisation...</p>
                                    {/* Ici on pourrait charger dynamiquement le composant si on avait un registre */}
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
};

export default IAstedPage;
