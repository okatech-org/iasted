export const ANTIGRAVITY_OPTIMIZATION_PROMPT = `MISSION FINALE :
Optimiser, sécuriser et préparer le déploiement du projet.

Repository : {{repoUrl}}
Branch : feature/antigravity

📊 AUDIT & OPTIMISATION :

1. **Performance** :
   - Analyser les bundles (Lighthouse)
   - Optimiser les images (WebP, lazy loading)
   - Implement code splitting
   - Mettre en cache les APIs

2. **Sécurité** :
   - Audit des dépendances (npm audit)
   - Implémenter CSRF protection
   - Sécuriser les headers (Helmet.js)
   - Rate limiting sur toutes les routes
   - Validation stricte des inputs

3. **SEO** :
   - Meta tags optimisés
   - Sitemap.xml
   - Robots.txt
   - Open Graph tags
   - Structured data (JSON-LD)

4. **Monitoring** :
   - Sentry pour error tracking
   - Analytics (Google / Plausible)
   - Uptime monitoring
   - Performance monitoring

5. **CI/CD** :
   - GitHub Actions pour :
     * Tests automatiques
     * Build preview
     * Deploy automatique sur merge

6. **Documentation** :
   - README complet
   - Contribution guidelines
   - API documentation (Swagger)
   - Architecture diagram

🚀 DÉPLOIEMENT :
- Frontend : Vercel / Netlify
- Backend : Railway / Render / AWS
- Database : Supabase / PlanetScale
- CDN : Cloudflare

📝 CHECKLIST FINALE :
□ Tests passent à 100%
□ Performance score > 90
□ Accessibilité (A11y) validée
□ Mobile responsive testé
□ Cross-browser compatibility
□ Error handling complet
□ Logs structurés
□ Backup strategy
□ SSL/HTTPS actif
□ Monitoring actif

LIVRABLE :
Projet production-ready avec :
- URL de production : {{productionUrl}}
- Documentation déployée
- Monitoring dashboard
- Backup automatique`;
