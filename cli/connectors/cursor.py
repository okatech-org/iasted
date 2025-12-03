import pyautogui
import time
import pyperclip
import platform

class CursorConnector:
    """
    Connecteur expérimental pour contrôler l'application Cursor Desktop.
    Utilise PyAutoGUI pour simuler les entrées clavier/souris.
    """
    
    def __init__(self):
        # Configuration de sécurité PyAutoGUI
        pyautogui.FAILSAFE = True # Bouger la souris en haut à gauche pour arrêter
        pyautogui.PAUSE = 0.5 # Pause entre chaque action
        self.is_mac = platform.system() == 'Darwin'
        self.cmd_key = 'command' if self.is_mac else 'ctrl'

    def open_cursor(self):
        """Tente d'ouvrir ou de mettre le focus sur Cursor"""
        # Méthode simple via Spotlight sur Mac
        if self.is_mac:
            pyautogui.hotkey('command', 'space')
            time.sleep(0.5)
            pyautogui.write('Cursor')
            time.sleep(0.5)
            pyautogui.press('enter')
            time.sleep(2) # Attendre l'ouverture
        else:
            # Fallback Windows/Linux (touche Windows)
            pyautogui.press('win')
            time.sleep(0.5)
            pyautogui.write('Cursor')
            pyautogui.press('enter')
            time.sleep(2)

    def open_terminal(self):
        """Ouvre le terminal intégré de Cursor"""
        pyautogui.hotkey('ctrl', '`') # Raccourci standard VS Code/Cursor

    def create_file(self, filename, content):
        """Crée un fichier via l'interface de Cursor"""
        # 1. Ouvrir la palette de commande
        pyautogui.hotkey(self.cmd_key, 'p')
        time.sleep(0.5)
        
        # 2. Créer un nouveau fichier
        pyautogui.write('> File: New File')
        pyautogui.press('enter')
        time.sleep(1)
        
        # 3. Coller le contenu
        pyperclip.copy(content)
        pyautogui.hotkey(self.cmd_key, 'v')
        
        # 4. Sauvegarder
        pyautogui.hotkey(self.cmd_key, 's')
        time.sleep(1)
        pyautogui.write(filename)
        pyautogui.press('enter')

    def paste_prompt_to_chat(self, prompt):
        """Ouvre le chat AI de Cursor (Cmd+L) et colle le prompt"""
        # 1. Ouvrir le chat (Cmd+L ou Ctrl+L)
        pyautogui.hotkey(self.cmd_key, 'l')
        time.sleep(1)
        
        # 2. Coller le prompt
        pyperclip.copy(prompt)
        pyautogui.hotkey(self.cmd_key, 'v')
        
        # 3. Envoyer (Optionnel, peut être risqué d'envoyer auto)
        # pyautogui.press('enter')
