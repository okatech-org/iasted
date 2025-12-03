LOVABLE_INITIAL_PROMPT = """CONTEXTE DU PROJET :
- Nom du projet : {project_name}
- Description : {project_desc}
- Technologies : React + TypeScript + Tailwind

STRUCTURE LOVABLE À CRÉER :
1. Pages principales : Home, Dashboard, Settings
2. Composants clés : Sidebar, Header, DataCard
3. Routes : /, /dashboard, /settings

DESIGN SYSTEM :
- Style : Moderne, Clean, Professionnel

LIVRABLE ATTENDU :
- Prototype fonctionnel sur Lovable
- Repository GitHub connecté
"""

CURSOR_BACKEND_PROMPT = """CONTEXTE :
Je continue le développement d'un projet initialisé sur Lovable.
Repository GitHub : {repo_url}
Branch : feature/cursor

MISSION :
Ajouter la couche backend et la logique métier manquante.

📦 STACK BACKEND :
- Supabase (Auth, DB, Realtime)
- Edge Functions (Deno/TypeScript)

🔧 TÂCHES À ACCOMPLIR :
1. Configurer le client Supabase
2. Créer les tables SQL pour le dashboard
3. Implémenter l'authentification
"""

ANTIGRAVITY_OPTIMIZATION_PROMPT = """MISSION FINALE :
Optimiser, sécuriser et préparer le déploiement du projet.

Repository : {repo_url}
Branch : feature/antigravity

📊 AUDIT & OPTIMISATION :
1. Performance (Lighthouse)
2. Sécurité (RLS Supabase)
3. SEO (Meta tags)
4. CI/CD (GitHub Actions)
"""

CURSOR_RULES = """{
  "rules": [
    "Always use TypeScript",
    "Use Tailwind CSS for styling",
    "Prefer functional components",
    "Use Supabase for backend"
  ]
}"""
