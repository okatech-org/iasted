export const CURSOR_BACKEND_PROMPT = `CONTEXTE :
Je continue le développement d'un projet initialisé sur Lovable.
Repository GitHub : {{repoUrl}}
Branch : feature/cursor

MISSION :
Ajouter la couche backend et la logique métier manquante.

📦 STACK BACKEND :
- Node.js + Express (ou Next.js API Routes)
- Base de données : {{database}}
- Authentication : {{auth}}
- APIs externes : {{apis}}

🔧 TÂCHES À ACCOMPLIR :

1. **API Routes** :
{{apiRoutes}}

2. **Base de Données** :
   - Schéma : {{schema}}
   - Relations : {{relations}}
   - Migrations : Stratégie standard

3. **Authentication** :
   - Système : {{authSystem}}
   - Providers : {{authProviders}}
   - Rôles : {{roles}}

4. **Intégrations** :
{{integrations}}

5. **Variables d'environnement** :
\`\`\`env
DATABASE_URL=
API_KEY=
JWT_SECRET=
\`\`\`

🎯 LIVRABLE :
- API complète et fonctionnelle
- Documentation OpenAPI/Swagger
- Tests unitaires (Jest)
- Déploiement sur {{deployment}}

⚠️ CONTRAINTES :
- Respecter l'architecture frontend existante
- TypeScript strict
- Gestion d'erreurs robuste
- Rate limiting sur les APIs`;

export const CURSOR_FEATURE_PROMPT = `Crée la fonctionnalité {{featureName}} avec :

FRONTEND (à améliorer depuis Lovable) :
- Composant : {{componentDesc}}
- State management : {{stateManagement}}
- Validation : {{validation}}

BACKEND (à créer) :
- Endpoint : {{endpoint}}
- Logique métier : {{businessLogic}}
- Sécurité : {{security}}

TESTS :
- Tests unitaires pour la logique métier
- Tests d'intégration pour l'API
- Tests E2E avec Playwright

Code complet avec gestion d'erreurs et logs.`;
