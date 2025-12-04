export type SectionDefinition = {
    id: string;
    label: string;
    keywords: string[];
    description: string;
};

export const NAVIGATION_SECTIONS: Record<string, SectionDefinition[]> = {
    president: [
        {
            id: "dashboard",
            label: "Tableau de Bord",
            keywords: ["tableau de bord", "accueil", "résumé", "vue d'ensemble", "dashboard"],
            description: "Vue principale avec les indicateurs clés."
        },
        {
            id: "documents",
            label: "Documents",
            keywords: ["documents", "ged", "fichiers", "dossiers", "archives"],
            description: "Gestion électronique des documents."
        },
        {
            id: "iasted",
            label: "iAsted",
            keywords: ["iasted", "assistant", "ia", "intelligence artificielle"],
            description: "Interface de l'assistant intelligent iAsted."
        }
    ],
    admin: [
        {
            id: "dashboard",
            label: "Tableau de Bord",
            keywords: ["tableau de bord", "accueil", "résumé", "dashboard", "statistiques"],
            description: "Vue d'ensemble du système avec statistiques globales."
        },
        {
            id: "feedbacks",
            label: "Feedbacks",
            keywords: ["feedbacks", "retours", "avis", "suggestions"],
            description: "Gestion des feedbacks."
        },
        {
            id: "users",
            label: "Utilisateurs",
            keywords: ["utilisateurs", "comptes", "gestion utilisateurs", "users"],
            description: "Gestion des utilisateurs et rôles."
        },
        {
            id: "ai",
            label: "IA & Voix",
            keywords: ["ia", "intelligence artificielle", "voix", "iasted"],
            description: "Configuration de l'IA et des paramètres vocaux."
        },
        {
            id: "knowledge",
            label: "Connaissances",
            keywords: ["connaissances", "base de connaissances", "knowledge base"],
            description: "Gestion de la base de connaissances."
        },
        {
            id: "documents",
            label: "Documents",
            keywords: ["documents", "gestion documents"],
            description: "Gestion des documents système."
        },
        {
            id: "audit",
            label: "Audit & Logs",
            keywords: ["audit", "logs", "journaux", "historique"],
            description: "Consultation des logs d'audit."
        },
        {
            id: "config",
            label: "Configuration",
            keywords: ["configuration", "paramètres", "settings"],
            description: "Configuration globale du système."
        }
    ],
    moderator: [
        {
            id: "dashboard",
            label: "Tableau de Bord",
            keywords: ["tableau de bord", "accueil", "résumé"],
            description: "Vue principale."
        },
        {
            id: "documents",
            label: "Documents",
            keywords: ["documents", "ged", "fichiers"],
            description: "Gestion des documents."
        }
    ],
    user: [
        {
            id: "dashboard",
            label: "Tableau de Bord",
            keywords: ["tableau de bord", "accueil"],
            description: "Vue principale."
        }
    ]
};

export const getSectionsForRole = (role: string | null = 'user'): SectionDefinition[] => {
    if (!role) return NAVIGATION_SECTIONS['user'];
    return NAVIGATION_SECTIONS[role] || NAVIGATION_SECTIONS['user'];
};
