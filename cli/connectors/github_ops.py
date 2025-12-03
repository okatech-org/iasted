import os
import subprocess

class GitHubConnector:
    def clone(self, repo_url, target_path):
        """Clone un repo GitHub"""
        try:
            subprocess.run(["git", "clone", repo_url, target_path], check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    def create_branch(self, path, branch_name):
        """Crée une nouvelle branche"""
        os.chdir(path)
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)

    def push_changes(self, path, message):
        """Commit et push les changements"""
        os.chdir(path)
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", message], check=True)
        subprocess.run(["git", "push", "origin", "HEAD"], check=True)
