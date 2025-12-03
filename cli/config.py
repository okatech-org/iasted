import os
from dotenv import load_dotenv

def load_config():
    load_dotenv()
    
    config = {
        "github_token": os.getenv("GITHUB_TOKEN"),
        "lovable_token": os.getenv("LOVABLE_TOKEN"),
        "openai_api_key": os.getenv("OPENAI_API_KEY"), # Pour l'intelligence interne de l'agent
        "valid": False
    }
    
    # Validation basique
    if config["github_token"]:
        config["valid"] = True
        
    return config
