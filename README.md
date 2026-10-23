# AINM Tempo — Planning ferroviaire autonome v2.1

PWA indépendante du Journal de chantier. La version 2.1 conserve tous les modules de planning (agents, absences, fiches, édition, exports) et ajoute une **vue hebdomadaire colorée par chantier** avec fiche d'équipe par séance accessible en touchant un bloc. Les pictogrammes spécifiques à chaque chantier ont été supprimés : ils sont tous ferroviaires.

## Principes

- 10 chantiers génériques identifiés par une **couleur constante** : Montereau, Thomery, Cepoy, Samois, MTRO, RCT, PMP Garenne–Betz, PMP Nemours–Chalet–Garenne, PMP du Mée, Étalonnage.
- Une bulle par chantier **et par jour**, regroupant toutes ses affectations, sans masquer les agents au-delà de 7 lignes.
- Appui sur une bulle : panneau **Séances & personnel**, regroupé par horaires. Fonctions de sécurité demandées visibles pour chaque agent ; appel uniquement si un numéro existe dans la base privée locale.
- Passage jour/nuit, changement de semaine, filtres et focus sur une journée. Vue par agent, fiches et absences conservées.
- Les libellés WE/WER/SQ ne deviennent jamais des chantiers indépendants ; leurs informations restent dans les lignes historiques.

## Données personnelles

**Aucun annuaire ni affectation nominative n’est inclus dans ce dépôt GitHub Pages public.** Les données issues de LAPLACE sont importées dans le navigateur de l’utilisateur via « Données & sauvegardes → Importer la base JSON ». Le contenu local existant est repris avec les clés de stockage des versions antérieures. Les missions de sécurité sont des **fonctions prévues**, et non une preuve d'habilitation.

**Il n'y a pas de synchronisation multi-appareils ni de diffusion aux agents dans cette version autonome.** Une publication Tempo est locale à l’appareil. Ce dépôt ne modifie aucun projet Supabase ou Journal de chantier.

## Installation Android

Ouvrir `https://ghostbuilderdev.github.io/AINM-Tempo-PWA/` dans Chrome, puis installer la PWA ou créer un raccourci. Pour recevoir la version 2.1, fermer puis rouvrir Tempo après publication du dépôt. En cas d’ancien écran, actualiser depuis Chrome ; **ne pas effacer les données du site**, ni désinstaller l’application avant sauvegarde.
