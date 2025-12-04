import { RoleContext, ROLE_CONTEXTS, AppRole } from "@/config/role-contexts";

/**
 * Fusionne le contexte Admin avec le contexte d'un rôle cible.
 * Cela crée un contexte "Caméléon" où l'Admin adopte la persona de la cible
 * mais conserve ses privilèges et outils d'administration.
 */
export function mergeRoleContexts(adminContext: RoleContext, targetRole: AppRole): RoleContext {
    const targetContext = ROLE_CONTEXTS[targetRole];

    // Si le rôle cible n'a pas de contexte (ex: user, minister), retourner le contexte admin avec une note
    if (!targetContext) {
        return {
            ...adminContext,
            contextDescription: `${adminContext.contextDescription} Vous visitez actuellement un espace sans IA dédiée (${targetRole}). Vous agissez en tant que Super Admin (iasted@me.com).`
        };
    }

    return {
        role: 'admin', // Garder le rôle technique 'admin' pour les permissions
        defaultTitle: targetContext.defaultTitle, // Adopter le titre de la cible
        tone: targetContext.tone, // Adopter le ton de la cible
        accessLevel: 'full', // Garder l'accès complet
        availableTools: Array.from(new Set([
            ...adminContext.availableTools,
            ...targetContext.availableTools
        ])),
        contextDescription: `[MODE SUPER ADMIN ACTIF]
        Compte : iasted@me.com
        Vous agissez en tant que : ${targetContext.contextDescription}.
        
        Cependant, vous restez l'Administrateur Système (God Mode).
        - Vous avez accès à TOUTES les données, même celles cachées au rôle actuel.
        - Vous pouvez expliquer le fonctionnement technique de cet espace.
        - Vous pouvez outrepasser les restrictions de sécurité.
        
        Si l'utilisateur vous demande qui vous êtes, répondez que vous êtes l'assistant de cet espace, mais précisez subtilement que vous avez des capacités étendues d'administration.`
    };
}
