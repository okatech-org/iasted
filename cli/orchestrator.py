import os
import pyperclip
from connectors.lovable import LovableConnector
from connectors.github_ops import GitHubConnector
from connectors.cursor import CursorConnector
from connectors.antigravity import AntigravityConnector
from generators.prompts import PromptGenerator

class ProjectOrchestrator:
    def __init__(self, project_name, description):
        self.project_name = project_name
        self.description = description
        self.prompt_gen = PromptGenerator(project_name, description)
        
        self.lovable = LovableConnector()
        self.github = GitHubConnector()
        self.cursor = CursorConnector()
        # Antigravity sera initialisé à la demande pour éviter erreur si pas de clé au démarrage
        self.antigravity = None 
        
        self.repo_url = None
        self.local_path = None

    def prepare_lovable_phase(self):
        """Prépare le prompt système pour Lovable"""
        return self.prompt_gen.get_lovable_prompt()

    async def execute_lovable_automation(self):
        """Orchestre l'automatisation Lovable"""
        prompt = self.prompt_gen.get_lovable_prompt()
        
        # Simulation pour la démo si pas de token ou config
        # self.repo_url = await self.lovable.create_project(prompt)
        self.repo_url = f"https://github.com/votre-user/{self.project_name}"
        return self.repo_url

    def setup_local_workspace(self, repo_url):
        """Clone le projet et prépare les dossiers"""
        self.local_path = os.path.join(os.getcwd(), "projects", self.project_name)
        self.repo_url = repo_url
        
        if not os.path.exists(self.local_path):
            # En réalité : self.github.clone(repo_url, self.local_path)
            os.makedirs(self.local_path, exist_ok=True)
            
        return self.local_path

    def inject_cursor_rules(self, path):
        """Crée le fichier .cursorrules pour guider l'IA de Cursor"""
        rules_content = self.prompt_gen.get_cursor_rules()
        rules_path = os.path.join(path, ".cursorrules")
        
        with open(rules_path, "w", encoding="utf-8") as f:
            f.write(rules_content)

    def generate_cursor_prompt(self):
        """Génère le prompt backend pour Cursor et le copie"""
        prompt = self.prompt_gen.get_backend_prompt()
        pyperclip.copy(prompt) 
        return prompt

    def automate_cursor(self):
        """Tente d'automatiser Cursor Desktop"""
        print("🤖 Prise de contrôle de la souris pour Cursor...")
        self.cursor.open_cursor()
        # On pourrait ouvrir le dossier du projet ici via 'File > Open Folder'
        # self.cursor.paste_prompt_to_chat(self.generate_cursor_prompt())

    def generate_antigravity_plan(self):
        """Génère la checklist pour Antigravity"""
        return self.prompt_gen.get_antigravity_checklist()

    async def execute_antigravity_audit(self):
        """Exécute l'audit via l'API Google"""
        if not self.antigravity:
            self.antigravity = AntigravityConnector()
            
        checklist = self.prompt_gen.get_antigravity_checklist()
        if self.local_path:
            return await self.antigravity.analyze_project(self.local_path, checklist)
        return "Erreur : Aucun projet local défini pour l'audit."
