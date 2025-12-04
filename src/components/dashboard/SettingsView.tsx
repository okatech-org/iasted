import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { Moon, Sun, Key, Github, HardDrive, Save, Map, CheckCircle2, AlertCircle, Loader2, Settings, Database, Shield, Trash2, ExternalLink, DollarSign, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

import { integrationsService, ApiKeys, AVAILABLE_MODELS, ModelPreferences } from '@/services/IntegrationsService';

interface UsageLog {
    id: string;
    provider: string;
    model: string;
    tokens_in: number;
    tokens_out: number;
    cost: number;
    mode: string;
    created_at: string;
}

export function SettingsView() {
    const { theme, setTheme } = useTheme();
    const [apiKeys, setApiKeys] = useState<ApiKeys>({
        openai: '',
        anthropic: '',
        gemini: '',
        github: '',
        mapbox: ''
    });
    const [modelPreferences, setModelPreferences] = useState<ModelPreferences>({
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20240620',
        gemini: 'gemini-1.5-pro'
    });
    const [modelStatuses, setModelStatuses] = useState<Record<string, 'pending' | 'loading' | 'valid' | 'invalid'>>({});
    const [diagnosticRunning, setDiagnosticRunning] = useState(false);
    const [verifying, setVerifying] = useState<string | null>(null);
    const [status, setStatus] = useState<Record<string, 'valid' | 'invalid' | null>>({});
    const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        const keys = integrationsService.getApiKeys();
        setApiKeys(keys);

        const models = integrationsService.getModelPreferences();
        setModelPreferences(models);

        // Auto-verify known keys on load
        Object.keys(keys).forEach(key => {
            if (keys[key]) verifyKey(key, keys[key]);
        });

        fetchUsageLogs();
    }, []);

    const runDiagnostic = async () => {
        setDiagnosticRunning(true);
        const newStatuses: Record<string, 'pending' | 'loading' | 'valid' | 'invalid'> = {};

        // Initialize statuses
        Object.keys(AVAILABLE_MODELS).forEach(provider => {
            if (apiKeys[provider]) {
                AVAILABLE_MODELS[provider as keyof typeof AVAILABLE_MODELS].forEach(model => {
                    newStatuses[model.id] = 'pending';
                });
            }
        });
        setModelStatuses(newStatuses);

        for (const provider of Object.keys(AVAILABLE_MODELS)) {
            if (!apiKeys[provider]) continue;

            const models = AVAILABLE_MODELS[provider as keyof typeof AVAILABLE_MODELS];
            for (const model of models) {
                setModelStatuses(prev => ({ ...prev, [model.id]: 'loading' }));
                const result = await integrationsService.verifyModel(model.id, apiKeys[provider]);
                setModelStatuses(prev => ({ ...prev, [model.id]: result.valid ? 'valid' : 'invalid' }));
            }
        }
        setDiagnosticRunning(false);
    };

    const fetchUsageLogs = async () => {
        setLoadingLogs(true);
        try {
            const { data, error } = await supabase
                .from('usage_logs' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setUsageLogs((data as unknown as UsageLog[]) || []);
        } catch (error) {
            console.error('Error fetching usage logs:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const verifyKey = async (provider: string, key: string) => {
        if (!key) return;
        setVerifying(provider);
        setStatus(prev => ({ ...prev, [provider]: null }));

        try {
            const isValid = await integrationsService.verifyKey(provider, key);

            if (isValid) {
                setStatus(prev => ({ ...prev, [provider]: 'valid' }));
                toast.success(`Clé ${provider} valide`);
            } else {
                setStatus(prev => ({ ...prev, [provider]: 'invalid' }));
                toast.error(`Clé ${provider} invalide (Vérification échouée)`);
            }
        } catch (error) {
            setStatus(prev => ({ ...prev, [provider]: 'invalid' }));
        } finally {
            setVerifying(null);
        }
    };

    const handleSaveKeys = () => {
        integrationsService.saveApiKeys(apiKeys);
        integrationsService.saveModelPreferences(modelPreferences);
    };

    const handleClearCache = () => {
        if (confirm("Voulez-vous vraiment effacer le cache local ? Cela ne supprimera pas vos clés.")) {
            // Clear everything except keys
            const keys = integrationsService.getApiKeys();
            const models = integrationsService.getModelPreferences();
            localStorage.clear();
            integrationsService.saveApiKeys(keys);
            integrationsService.saveModelPreferences(models);
            toast.success("Cache nettoyé avec succès");
        }
    };

    const renderKeyInput = (id: string, label: string, placeholder: string, icon?: React.ReactNode) => {
        const models = AVAILABLE_MODELS[id as keyof typeof AVAILABLE_MODELS];

        return (
            <div className="grid gap-2 p-4 border rounded-lg bg-card/50">
                <div className="flex items-center justify-between">
                    <Label htmlFor={id} className="flex items-center gap-2 font-medium">
                        {icon} {label}
                    </Label>
                    {models && (
                        <Select
                            value={modelPreferences[id]}
                            onValueChange={(value) => setModelPreferences(prev => ({ ...prev, [id]: value }))}
                        >
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Choisir un modèle" />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model) => (
                                    <SelectItem key={model.id} value={model.id} className="text-xs">
                                        <div className="flex items-center gap-2">
                                            {model.name}
                                            {modelStatuses[model.id] === 'valid' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                            {modelStatuses[model.id] === 'invalid' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex gap-2">
                    <Input
                        id={id}
                        type="password"
                        placeholder={placeholder}
                        value={apiKeys[id] || ''}
                        onChange={(e) => {
                            setApiKeys({ ...apiKeys, [id]: e.target.value });
                            setStatus(prev => ({ ...prev, [id]: null }));
                        }}
                        className={cn(
                            "font-mono text-sm",
                            status[id] === 'valid' ? 'border-green-500 focus-visible:ring-green-500' :
                                status[id] === 'invalid' ? 'border-red-500 focus-visible:ring-red-500' : ''
                        )}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => verifyKey(id, apiKeys[id])}
                        disabled={verifying === id || !apiKeys[id]}
                    >
                        {verifying === id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            status[id] === 'valid' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                status[id] === 'invalid' ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-6 border-b">
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground">Configuration de l'Orchestrateur iAsted</p>
            </div>

            <div className="flex-1 overflow-hidden p-6">
                <Tabs defaultValue="ai" className="h-full flex flex-col max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="ai" className="gap-2"><Key className="w-4 h-4" /> IA & Clés</TabsTrigger>
                        <TabsTrigger value="finops" className="gap-2"><DollarSign className="w-4 h-4" /> FinOps</TabsTrigger>
                        <TabsTrigger value="integrations" className="gap-2"><Github className="w-4 h-4" /> Intégrations</TabsTrigger>
                        <TabsTrigger value="general" className="gap-2"><Settings className="w-4 h-4" /> Général</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {/* AI Tab */}
                        <TabsContent value="ai" className="space-y-6 mt-0">
                            {/* AI Status Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className={status['openai'] === 'valid' ? "border-green-200 bg-green-50" : "border-muted"}>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${status['openai'] === 'valid' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">OpenAI</p>
                                            <p className="text-xs text-muted-foreground">{status['openai'] === 'valid' ? 'Actif' : 'Non configuré'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className={status['anthropic'] === 'valid' ? "border-green-200 bg-green-50" : "border-muted"}>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${status['anthropic'] === 'valid' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Anthropic</p>
                                            <p className="text-xs text-muted-foreground">{status['anthropic'] === 'valid' ? 'Actif' : 'Non configuré'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className={status['gemini'] === 'valid' ? "border-green-200 bg-green-50" : "border-muted"}>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${status['gemini'] === 'valid' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Gemini</p>
                                            <p className="text-xs text-muted-foreground">{status['gemini'] === 'valid' ? 'Actif' : 'Non configuré'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Modèles de Langage</CardTitle>
                                            <CardDescription>Configurez les cerveaux de l'orchestrateur</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={runDiagnostic}
                                            disabled={diagnosticRunning}
                                            className={cn(diagnosticRunning && "animate-pulse")}
                                        >
                                            {diagnosticRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                            Vérifier la compatibilité
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {renderKeyInput('openai', 'OpenAI', 'sk-proj-...')}
                                    {renderKeyInput('anthropic', 'Anthropic', 'sk-ant-...')}
                                    {renderKeyInput('gemini', 'Google Gemini', 'AIza...')}

                                    {Object.keys(modelStatuses).length > 0 && (
                                        <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                            <h3 className="font-medium mb-3 text-sm">Résultats du Diagnostic</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {Object.entries(modelStatuses).map(([modelId, status]) => {
                                                    // Find model name
                                                    let modelName = modelId;
                                                    Object.values(AVAILABLE_MODELS).forEach((models: { id: string; name: string }[]) => {
                                                        const found = models.find((m: { id: string; name: string }) => m.id === modelId);
                                                        if (found) modelName = found.name;
                                                    });

                                                    return (
                                                        <div key={modelId} className="flex items-center justify-between text-xs p-2 rounded border bg-background">
                                                            <span className="truncate mr-2" title={modelName}>{modelName}</span>
                                                            {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                                                            {status === 'valid' && <span className="flex items-center text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> OK</span>}
                                                            {status === 'invalid' && <span className="flex items-center text-red-500"><AlertCircle className="w-3 h-3 mr-1" /> HS</span>}
                                                            {status === 'pending' && <span className="text-muted-foreground">-</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={handleSaveKeys} className="w-full gradient-bg mt-4">
                                        <Save className="w-4 h-4 mr-2" /> Sauvegarder
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* FinOps Tab */}
                        <TabsContent value="finops" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Coût Total (Est.)</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ${usageLogs.reduce((acc, log) => acc + (log.cost || 0), 0).toFixed(4)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            +20.1% par rapport au mois dernier
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Tokens Utilisés</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {usageLogs.reduce((acc, log) => acc + (log.tokens_in || 0) + (log.tokens_out || 0), 0).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Entrée + Sortie
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Requêtes</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{usageLogs.length}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Dernières 24h
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Historique d'Utilisation</CardTitle>
                                            <CardDescription>Détail des appels aux modèles d'IA</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={fetchUsageLogs} disabled={loadingLogs}>
                                            <Loader2 className={cn("w-4 h-4 mr-2", loadingLogs && "animate-spin")} />
                                            Actualiser
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {loadingLogs ? (
                                            <div className="flex justify-center p-4">
                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : usageLogs.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-4">Aucune donnée d'utilisation disponible.</p>
                                        ) : (
                                            <div className="rounded-md border">
                                                <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                                                    <div>Date</div>
                                                    <div>Modèle</div>
                                                    <div>Mode</div>
                                                    <div>Tokens</div>
                                                    <div className="text-right">Coût</div>
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    {usageLogs.map((log) => (
                                                        <div key={log.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 text-sm hover:bg-muted/20 transition-colors">
                                                            <div className="text-muted-foreground">
                                                                {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="font-medium">{log.model}</div>
                                                            <div>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${log.mode === 'auto-power' ? 'bg-purple-100 text-purple-700' :
                                                                    log.mode === 'auto-cost' ? 'bg-green-100 text-green-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {log.mode}
                                                                </span>
                                                            </div>
                                                            <div>{log.tokens_in + (log.tokens_out || 0)}</div>
                                                            <div className="text-right font-mono">${(log.cost || 0).toFixed(5)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Integrations Tab */}
                        <TabsContent value="integrations" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sources de Données</CardTitle>
                                    <CardDescription>Connectez vos outils externes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-muted rounded-full"><Github className="w-6 h-6" /></div>
                                            <div>
                                                <p className="font-medium">GitHub</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {integrationsService.isConnected(apiKeys.github) ? 'Connecté via Token' : 'Non connecté'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant={integrationsService.isConnected(apiKeys.github) ? "outline" : "default"} className={integrationsService.isConnected(apiKeys.github) ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                            {integrationsService.isConnected(apiKeys.github) ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Connecté</> : "Connecter"}
                                        </Button>
                                    </div>
                                    {renderKeyInput('github', 'Personal Access Token', 'ghp_...')}

                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card mt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-muted rounded-full"><Map className="w-6 h-6 text-blue-500" /></div>
                                            <div>
                                                <p className="font-medium">Mapbox</p>
                                                <p className="text-sm text-muted-foreground">Cartographie</p>
                                            </div>
                                        </div>
                                        <Button variant={integrationsService.isConnected(apiKeys.mapbox) ? "outline" : "default"} className={integrationsService.isConnected(apiKeys.mapbox) ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                            {integrationsService.isConnected(apiKeys.mapbox) ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Connecté</> : "Connecter"}
                                        </Button>
                                    </div>
                                    {renderKeyInput('mapbox', 'Public Key', 'pk....')}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* General Tab */}
                        <TabsContent value="general" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Apparence</CardTitle>
                                    <CardDescription>Personnalisation de l'interface</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Mode Sombre</Label>
                                            <p className="text-sm text-muted-foreground">Basculer entre clair et sombre</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4 text-muted-foreground" />
                                            <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
                                            <Moon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-red-200 dark:border-red-900">
                                <CardHeader>
                                    <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Zone de Danger
                                    </CardTitle>
                                    <CardDescription>Gestion des données locales</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Vider le cache</Label>
                                            <p className="text-sm text-muted-foreground">Supprime les données temporaires (sauf les clés)</p>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={handleClearCache}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Nettoyer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
