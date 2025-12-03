import google.generativeai as genai
import os

class AntigravityConnector:
    """
    Connecteur pour l'intelligence Antigravity (Google Gemini).
    Communique directement via l'API, sans interface graphique.
    """
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY is required for Antigravity")
        
        genai.configure(api_key=self.api_key)
        
        # Configuration du modèle
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest') # Ou gemini-exp-1121 si disponible

    async def analyze_project(self, repo_path, checklist):
        """
        Analyse le code du projet local et génère un rapport basé sur la checklist.
        """
        # 1. Lire les fichiers clés du projet (simplifié)
        # Dans une version avancée, on parcourrait récursivement le dossier
        context = "Voici un résumé des fichiers du projet :\n"
        
        # Exemple de lecture de fichiers critiques
        files_to_read = ['package.json', 'tsconfig.json', 'README.md']
        for filename in files_to_read:
            path = os.path.join(repo_path, filename)
            if os.path.exists(path):
                with open(path, 'r') as f:
                    context += f"\n--- {filename} ---\n{f.read()}\n"

        # 2. Construire le prompt
        prompt = f"""
        Tu es Antigravity, une IA d'audit experte.
        
        CONTEXTE DU PROJET :
        {context}
        
        MISSION :
        Réalise l'audit suivant et propose des corrections concrètes :
        {checklist}
        
        Réponds au format Markdown.
        """

        # 3. Appel API
        response = self.model.generate_content(prompt)
        return response.text
