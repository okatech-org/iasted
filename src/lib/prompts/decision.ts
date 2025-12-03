export const DECISION_PROMPT = `ANALYSE DE DÉCISION :

Projet : {{projectDescription}}
Phase actuelle : {{currentPhase}}

CRITÈRES DE DÉCISION :

1. **Utiliser Lovable si** :
   - Prototype frontend rapide
   - UI/UX simple à moyenne
   - Pas de backend complexe au départ

2. **Passer à Cursor si** :
   - Backend nécessaire
   - Logique métier complexe
   - Intégrations API multiples
   - Besoin de GPT-4 pour la réflexion

3. **Passer à Antigravity si** :
   - Optimisation finale requise
   - Architecture complexe
   - Besoin de Sonnet pour l'analyse
   - Préparation production

DÉCISION : [Plateforme choisie]
RAISON : [Justification]
MODÈLE IA : [Opus / GPT-4 / Gemini / Sonnet]`;
