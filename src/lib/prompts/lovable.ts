export const LOVABLE_INITIAL_PROMPT = `CONTEXTE DU PROJET :
- Nom du projet : {{projectName}}
- Type : {{projectType}}
- Technologies : React + TypeScript + Tailwind
- Fonctionnalités principales : {{features}}

STRUCTURE LOVABLE À CRÉER :
1. Pages principales : {{pages}}
2. Composants clés : {{components}}
3. Routes : {{routes}}
4. Intégrations : {{integrations}}

DESIGN SYSTEM :
- Palette de couleurs : {{colors}}
- Typographie : {{typography}}
- Style : {{style}}

LIVRABLE ATTENDU :
- Prototype fonctionnel sur Lovable
- Repository GitHub connecté
- README.md avec documentation`;

export const LOVABLE_GENERATION_PROMPT = `Crée une application React complète avec les spécifications suivantes :

📋 PROJET : {{projectName}}

🎨 STACK TECHNIQUE :
- React 18 + TypeScript
- Tailwind CSS pour le styling
- React Router pour la navigation
- Lucide React pour les icônes

📦 STRUCTURE DES PAGES :
{{pagesDetail}}

🔧 COMPOSANTS À CRÉER :
- Header avec navigation responsive
- Footer avec liens sociaux
{{componentsDetail}}

🎯 FONCTIONNALITÉS :
{{featuresDetail}}

💅 DESIGN :
- Couleur principale : {{primaryColor}}
- Couleur secondaire : {{secondaryColor}}
- Style moderne et minimaliste
- Dark mode supporté

📱 RESPONSIVE :
- Mobile-first
- Tablette et desktop optimisés

Génère le code complet avec tous les fichiers nécessaires.`;
