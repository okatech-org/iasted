import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface IntegrationStatus {
    [key: string]: 'valid' | 'invalid' | null;
}

export interface ApiKeys {
    openai: string;
    anthropic: string;
    gemini: string;
    github: string;
    mapbox: string;
    [key: string]: string;
}

export const AVAILABLE_MODELS = {
    openai: [
        { id: 'gpt-5.1-turbo', name: 'GPT-5.1 Turbo' },
        { id: 'gpt-5-high', name: 'GPT-5 High Fidelity' },
        { id: 'gpt-5-pro', name: 'GPT-5 Pro' },
        { id: 'gpt-5-fast', name: 'GPT-5 Fast' },
        { id: 'gpt-5-o', name: 'GPT-5o' },
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' }
    ],
    anthropic: [
        { id: 'claude-4-5-opus', name: 'Claude 4.5 Opus' },
        { id: 'claude-4-5-sonnet', name: 'Claude 4.5 Sonnet' },
        { id: 'claude-4-5-haiku', name: 'Claude 4.5 Haiku' },
        { id: 'claude-4-1-opus', name: 'Claude 4.1 Opus' },
        { id: 'claude-4-0-opus', name: 'Claude 4.0 Opus' },
        { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' },
        { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' }
    ],
    gemini: [
        { id: 'gemini-3-pro', name: 'Gemini 3 Pro' },
        { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
        { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
    ]
};

export interface ModelPreferences {
    openai: string;
    anthropic: string;
    gemini: string;
    [key: string]: string;
}

class IntegrationsService {
    private storageKey = 'iasted_api_keys';
    private modelsStorageKey = 'iasted_model_preferences';

    getApiKeys(): ApiKeys {
        const savedKeys = localStorage.getItem(this.storageKey);
        if (savedKeys) {
            return JSON.parse(savedKeys);
        }
        return {
            openai: '',
            anthropic: '',
            gemini: '',
            github: '',
            mapbox: ''
        };
    }

    saveApiKeys(keys: ApiKeys) {
        localStorage.setItem(this.storageKey, JSON.stringify(keys));
        toast.success('Configuration sauvegardée');
    }

    getModelPreferences(): ModelPreferences {
        const savedModels = localStorage.getItem(this.modelsStorageKey);
        if (savedModels) {
            return JSON.parse(savedModels);
        }
        return {
            openai: 'gpt-4o',
            anthropic: 'claude-3-5-sonnet-20240620',
            gemini: 'gemini-1.5-pro'
        };
    }

    saveModelPreferences(models: ModelPreferences) {
        localStorage.setItem(this.modelsStorageKey, JSON.stringify(models));
        // toast.success('Modèles préférés sauvegardés'); // Optional, maybe too noisy if auto-saved
    }

    async verifyModel(modelId: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
        if (!apiKey) return { valid: false, error: 'Clé API manquante' };

        let providerHeader = '';
        if (modelId.startsWith('gpt')) providerHeader = 'x-openai-key';
        else if (modelId.startsWith('claude')) providerHeader = 'x-anthropic-key';
        else if (modelId.startsWith('gemini')) providerHeader = 'x-gemini-key';

        try {
            const { data, error } = await supabase.functions.invoke('chat', {
                body: {
                    model: modelId,
                    mode: 'manual',
                    messages: [{ role: 'user', content: 'Ping' }] // Minimal prompt
                },
                headers: {
                    [providerHeader]: apiKey
                }
            });

            if (error) {
                // Supabase Edge Function error (e.g. 500 from catch block)
                // The error body might contain the provider's error message
                // We need to check if it's a "model not found" error vs "invalid key" vs "server error"
                // But for now, any error means it "doesn't work".
                console.error(`Verification failed for ${modelId}:`, error);

                // Try to parse specific error if possible, but usually 'error' here is a generic FunctionsHttpError
                // We might need to read the response body if it's available in the error object, but Supabase client hides it sometimes.
                // Assuming if it fails, it's invalid.
                return { valid: false, error: error.message || 'Erreur inconnue' };
            }

            return { valid: true };
        } catch (e: unknown) {
            console.error(`Exception verifying ${modelId}:`, e);
            const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
            return { valid: false, error: errorMessage };
        }
    }

    async verifyKey(provider: string, key: string): Promise<boolean> {
        // ... (existing verifyKey logic)
        if (!key) return false;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let isValid = false;

        // Known keys for demo/testing
        const knownKeys: Record<string, boolean> = {
            // 'sk-proj-...': true, 
        };

        if (key in knownKeys) {
            isValid = knownKeys[key];
        } else {
            // Heuristic checks
            switch (provider) {
                case 'openai': isValid = key.startsWith('sk-proj-') && key.length > 40; break;
                case 'anthropic': isValid = key.startsWith('sk-ant-') && key.length > 40; break;
                case 'github': isValid = key.length > 30; break; // Classic tokens are 40 chars, fine-grained are longer
                case 'mapbox': isValid = key.startsWith('pk.') || key.startsWith('sk.'); break;
                case 'gemini': isValid = key.length > 20; break; // AIza...
                default: isValid = true;
            }
        }

        return isValid;
    }

    isConnected(key: string): boolean {
        return !!key && key.length > 10;
    }
}

export const integrationsService = new IntegrationsService();
