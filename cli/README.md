# 🤖 iAsted Agent

L'orchestrateur local pour le développement web assisté par IA.

## Installation

1. Assurez-vous d'avoir Python 3.8+ installé.
2. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```
3. Configurez vos clés dans un fichier `.env` :
   ```env
   GITHUB_TOKEN=ghp_...
   LOVABLE_TOKEN=... (Optionnel pour l'instant)
   ```

## Utilisation

Lancez simplement l'agent :
```bash
python main.py
```

## Workflow

1. **Lovable** : L'agent génère le prompt et peut automatiser la création du repo.
2. **GitHub** : L'agent récupère le code généré.
3. **Cursor** : L'agent configure l'IDE (règles) et génère les prompts backend.
4. **Antigravity** : L'agent fournit le plan d'optimisation finale.
