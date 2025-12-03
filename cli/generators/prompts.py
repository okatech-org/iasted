class PromptGenerator:
    def __init__(self, project_name, description):
        self.project_name = project_name
        self.description = description

    def get_lovable_prompt(self):
        return f"""
CONTEXTE DU PROJET :
- Nom : {self.project_name}
- Description : {self.description}
- Stack : React + TypeScript + Tailwind + Supabase

Génère une application web complète avec :
1. Une landing page moderne et responsive.
2. Un dashboard utilisateur protégé.
3. Une intégration Supabase pour l'authentification.
4. Des composants Shadcn UI pour l'interface.
Utilise des dégradés subtils et une typographie 'Inter'.
"""

    def get_cursor_rules(self):
        return """
# .cursorrules - Directives iAsted

TU ES : Un expert Senior Backend Developer spécialisé en Node.js et Supabase.

TES RÈGLES :
1. Ne modifie JAMAIS le CSS ou les composants UI (gérés par Lovable).
2. Tes modifications doivent se limiter à :
   - /supabase/functions
   - /src/hooks
   - /src/lib
3. Utilise toujours le typage strict TypeScript.
4. Pour la base de données, propose toujours des migrations SQL.

CONTEXTE :
Ce projet a été initialisé par Lovable. Tu dois ajouter la logique métier.
"""

    def get_backend_prompt(self):
        return f"""
CONTEXTE :
Projet {self.project_name}. Le frontend est prêt (Lovable).

MISSION (Cursor) :
Implémente le backend pour la fonctionnalité suivante : {self.description}

TÂCHES :
1. Crée les Edge Functions Supabase nécessaires.
2. Écris les politiques RLS (Row Level Security) pour la base de données.
3. Connecte le frontend existant aux nouvelles fonctions via React Query.

Code uniquement la logique, ne touche pas au design.
"""

    def get_antigravity_checklist(self):
        return """
AUDIT ANTIGRAVITY (Google DeepMind Model) :

1. [ ] Analyse de sécurité des Edge Functions.
2. [ ] Vérification des fuites de mémoire dans les useEffect React.
3. [ ] Optimisation des requêtes SQL (Index manquants ?).
4. [ ] Génération des tests unitaires (Vitest) pour les composants critiques.
"""
