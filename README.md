# 🎬 OtakuTrack

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.9-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

**Votre tracker personnel d'Animes & Mangas synchronisé en temps réel**

[🌐 Voir l'application](https://hdupommier-crypto.github.io/OtakuTrack/) • [🗄️ Configuration Supabase](SETUP_SUPABASE.md)

</div>

---

## ✨ Fonctionnalités Principales

### 🔄 Synchronisation Temps Réel
- **Cloud First** : Toutes vos données sont stockées sur **Supabase**.
- **Multi-appareils** : Commencez sur PC, continuez sur mobile, tout est syncro instantanément.
- **Sécurité** : Protection contre la perte de données (blocage des écritures vides).

### 📊 Statistiques Avancées
Des tableaux de bord dynamiques qui s'adaptent à votre sélection :
- **Onglet Animes** : Épisodes vus, à voir, terminés et temps de visionnage total (convertible jours/heures/minutes).
- **Onglet Mangas** : Tomes lus, à lire et séries terminées.

### 🔍 Tri & Filtres Intelligents
Organisez votre bibliothèque comme vous le souhaitez :
- **Tri** : Alphabétique (A-Z / Z-A), Dernière modification, Progression (%), Durée/Volume.
- **Filtres** : Par statut (En cours, Terminé, En pause) et par type.

### 💎 Interface Utilisateur Soignée
- **Progression Visuelle** : Barre de progression avec pourcentage précis pour chaque titre.
- **Footer Informatif** : Lien rapide vers le repository et numéro de version.
- **Design Responsive** : Fonctionne parfaitement sur ordinateur, tablette et smartphone.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- Un compte gratuit sur [Supabase](https://supabase.com).
- Un navigateur web moderne.

### 2. Configuration de la Base de Données
Suivez le guide détaillé dans [SETUP_SUPABASE.md](SETUP_SUPABASE.md) pour :
1. Créer votre projet Supabase.
2. Créer les tables `animes` et `mangas`.
3. Récupérer vos identifiants (URL et Clé Anon).

### 3. Lancement
L'application est configurée par défaut avec les identifiants du développeur. Si vous utilisez votre propre instance :
1. Cliquez sur **⚙️ Config** en haut à droite.
2. Entrez vos identifiants Supabase ou utilisez la saisie manuelle.
3. Cliquez sur **Se connecter**.

---

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend / Base de données** : [Supabase](https://supabase.com) (PostgreSQL)
- **Hébergement** : GitHub Pages
- **Icônes** : Font Awesome

---

## 📂 Structure du Projet

```
OtakuTrack/
├── index.html          # Interface principale
├── app.js              # Logique métier et synchronisation
├── db.json             # (Déprécié) Sauvegarde locale de secours
├── manifest.json       # Configuration PWA
├── SETUP_SUPABASE.md   # Guide d'installation de la DB
└── README.md           # Ce fichier
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à proposer une Pull Request.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/NouvelleFonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est distribué sous la licence MIT. Voyez le fichier LICENSE pour plus de détails.

---

<div align="center">

**Développé avec ❤️ par Hopcraft**

[⬆️ Retour en haut](#-otakutrack)

</div>