import {
    LOVABLE_INITIAL_PROMPT,
    LOVABLE_GENERATION_PROMPT,
    CURSOR_BACKEND_PROMPT,
    CURSOR_FEATURE_PROMPT,
    ANTIGRAVITY_OPTIMIZATION_PROMPT,
    DECISION_PROMPT
} from '../prompts';

type Platform = 'LOVABLE' | 'CURSOR' | 'ANTIGRAVITY';

interface OrchestratorContext {
    projectName?: string;
    projectType?: string;
    features?: string[];
    currentPhase?: Platform;
    // Add other fields as needed
}

export class Orchestrator {
    static interpolate(template: string, variables: Record<string, string>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
    }

    static getPromptForPlatform(platform: Platform, context: OrchestratorContext): string {
        switch (platform) {
            case 'LOVABLE':
                return this.interpolate(LOVABLE_INITIAL_PROMPT, {
                    projectName: context.projectName || '',
                    projectType: context.projectType || '',
                    features: context.features?.join(', ') || '',
                    // Add other mappings
                });
            case 'CURSOR':
                return this.interpolate(CURSOR_BACKEND_PROMPT, {
                    // Map context to Cursor prompt variables
                });
            case 'ANTIGRAVITY':
                return this.interpolate(ANTIGRAVITY_OPTIMIZATION_PROMPT, {
                    // Map context to Antigravity prompt variables
                });
            default:
                return '';
        }
    }

    static getDecisionPrompt(description: string, currentPhase: string): string {
        return this.interpolate(DECISION_PROMPT, {
            projectDescription: description,
            currentPhase: currentPhase
        });
    }
}
