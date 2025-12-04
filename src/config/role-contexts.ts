/**
 * Role Context Configuration
 * Defines metadata and permissions for each role that has access to iAsted
 */

import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

// Roles authorized to access iAsted
export const IASTED_AUTHORIZED_ROLES: AppRole[] = [
    'president',
    'admin',
    'moderator'
];

export interface RoleContext {
    role: AppRole;
    defaultTitle: {
        male: string;
        female: string;
    };
    tone: 'formal' | 'professional';
    accessLevel: 'full' | 'high' | 'medium' | 'limited';
    availableTools: string[];
    contextDescription: string;
}

export const ROLE_CONTEXTS: Record<AppRole, RoleContext | null> = {
    president: {
        role: 'president',
        defaultTitle: {
            male: 'Excellence Monsieur le Président',
            female: 'Excellence Madame la Présidente'
        },
        tone: 'formal',
        accessLevel: 'full',
        availableTools: [
            'control_ui',
            'navigate_within_space',
            'generate_document',
            'view_all_data',
            'view_intelligence',
            'view_kpis',
            'view_projects',
            'manage_protocol'
        ],
        contextDescription: 'Vous assistez le Président dans la consultation des informations stratégiques et la supervision de l\'action gouvernementale.'
    },
    admin: {
        role: 'admin',
        defaultTitle: {
            male: 'Administrateur Système',
            female: 'Administratrice Système'
        },
        tone: 'professional',
        accessLevel: 'full',
        availableTools: [
            'control_ui',
            'navigate_app',
            'generate_document',
            'access_all_data',
            'manage_users',
            'manage_roles',
            'view_audit_logs',
            'system_configuration',
            'global_navigate',
            'security_override'
        ],
        contextDescription: "Vous êtes le Super Admin Agent. Vous avez accès complet à toutes les fonctionnalités du système."
    },
    moderator: {
        role: 'moderator',
        defaultTitle: {
            male: 'Monsieur le Modérateur',
            female: 'Madame la Modératrice'
        },
        tone: 'professional',
        accessLevel: 'medium',
        availableTools: [
            'control_ui',
            'navigate_app',
            'generate_document',
            'view_data',
            'manage_content'
        ],
        contextDescription: 'Vous assistez le modérateur dans la gestion du contenu et des utilisateurs.'
    },
    user: null
};

export interface SpaceContext {
    spaceName: string;
    displayName: string;
    description: string;
}

export const SPACE_CONTEXTS: Record<string, SpaceContext> = {
    PresidentSpace: {
        spaceName: 'PresidentSpace',
        displayName: 'Espace Présidentiel',
        description: 'le tableau de bord présidentiel'
    },
    AdminSpace: {
        spaceName: 'AdminSpace',
        displayName: 'Administration Système',
        description: "l'interface d'administration système"
    }
};

/**
 * Check if a role has access to iAsted
 */
export function hasIAstedAccess(role: AppRole | null): boolean {
    if (!role) return false;
    return IASTED_AUTHORIZED_ROLES.includes(role);
}

/**
 * Get role context for a specific role
 */
export function getRoleContext(role: AppRole | null): RoleContext | null {
    if (!role) return null;
    return ROLE_CONTEXTS[role] || null;
}
