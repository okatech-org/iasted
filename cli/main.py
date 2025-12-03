import asyncio
import os
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn
from orchestrator import ProjectOrchestrator
from config import load_config

console = Console()

async def main():
    console.print(Panel.fit(
        "[bold cyan]🤖 iAsted Agent[/bold cyan]\n"
        "[dim]L'Orchestrateur de Développement Multi-Plateforme[/dim]",
        border_style="cyan"
    ))

    # 1. Vérification de la configuration
    config = load_config()
    if not config['valid']:
        console.print("[yellow]⚠️  Configuration manquante. Veuillez remplir le fichier .env[/yellow]")
        # On continue quand même pour la démo si config partielle
        # return

    # 2. Acquisition du besoin
    console.print("\n[bold green]Nouvelle Mission Detectée[/bold green]")
    project_name = Prompt.ask("Nom du projet (ex: dashboard-analytics)", default="dashboard-demo")
    project_desc = Prompt.ask("Description courte", default="Un dashboard pour visualiser des données de ventes")
    
    orchestrator = ProjectOrchestrator(project_name, project_desc)

    # 3. Phase 1 : Lovable (Prototypage)
    if Confirm.ask(f"\n[1/3] Lancer le prototypage sur [bold magenta]Lovable[/bold magenta] ?"):
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
        ) as progress:
            task = progress.add_task(description="Génération du prompt Lovable...", total=None)
            prompt_data = orchestrator.prepare_lovable_phase()
            
            progress.update(task, description="Pilotage du navigateur (Playwright)...")
            # Simulation ou exécution réelle selon config
            repo_url = await orchestrator.execute_lovable_automation()
            
        console.print(f"✅ Prototype généré et poussé sur GitHub : [link={repo_url}]{repo_url}[/link]")
    else:
        repo_url = Prompt.ask("URL du repository GitHub existant")

    # 4. Phase 2 : Cursor (Backend)
    if Confirm.ask(f"\n[2/3] Préparer l'environnement [bold blue]Cursor[/bold blue] (Backend) ?"):
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
        ) as progress:
            progress.add_task(description="Clonage du repo...", total=None)
            local_path = orchestrator.setup_local_workspace(repo_url)
            
            progress.add_task(description="Injection des règles Cursor (.cursorrules)...", total=None)
            orchestrator.inject_cursor_rules(local_path)
            
            progress.add_task(description="Génération du prompt Backend...", total=None)
            backend_prompt = orchestrator.generate_cursor_prompt()
            
        console.print(f"✅ Environnement prêt dans : [bold]{local_path}[/bold]")
        console.print(Panel(backend_prompt, title="Prompt Backend (Copié dans le presse-papier)", border_style="blue"))
        
        if Confirm.ask("🤖 Voulez-vous que iAsted ouvre Cursor et colle le prompt (Expérimental) ?"):
            orchestrator.automate_cursor()

    # 5. Phase 3 : Antigravity (Optimisation)
    if Confirm.ask(f"\n[3/3] Finaliser avec [bold red]Antigravity[/bold red] (Google) ?"):
        if Confirm.ask("🧠 Lancer l'audit automatique via API (Google Gemini) ?"):
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                transient=True,
            ) as progress:
                progress.add_task(description="Analyse du code par Antigravity...", total=None)
                audit_report = await orchestrator.execute_antigravity_audit()
            
            console.print(Panel(audit_report, title="Rapport d'Audit Antigravity", border_style="red"))
        else:
            optimization_plan = orchestrator.generate_antigravity_plan()
            console.print(Panel(optimization_plan, title="Plan d'Optimisation (Manuel)", border_style="red"))
        
    console.print("\n[bold green]🚀 Mission iAsted terminée avec succès ![/bold green]")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        console.print("\n[red]Arrêt par l'utilisateur[/red]")
