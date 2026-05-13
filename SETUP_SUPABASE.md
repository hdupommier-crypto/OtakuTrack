# Configuration de Supabase pour OtakuTrack

## Étape 1: Créer un projet Supabase (gratuit)

1. Allez sur https://app.supabase.com
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - Nom du projet : `otakutrack` (ou votre choix)
   - Mot de passe base de données : choisissez un mot de passe sécurisé
   - Région : choisissez la plus proche (ex: europe-west-3 pour Paris)
4. Attendez la création du projet (~2 minutes)

## Étape 2: Créer les tables

Dans le dashboard Supabase, allez dans **SQL Editor** et exécutez ce script :

```sql
-- Table pour les animes
CREATE TABLE animes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'anime',
  seasons JSONB DEFAULT '[]'
);

-- Table pour les mangas
CREATE TABLE mangas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'manga',
  total INTEGER DEFAULT 0,
  read INTEGER DEFAULT 0,
  notes TEXT DEFAULT ''
);

-- Activer RLS (Row Level Security)
ALTER TABLE animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mangas ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre toutes les opérations (mode public)
CREATE POLICY "Allow all operations on animes" ON animes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on mangas" ON mangas
  FOR ALL USING (true) WITH CHECK (true);
```

## Étape 3: Récupérer les identifiants

1. Allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (clé publique qui commence par `eyJ...`)

## Étape 4: Configurer OtakuTrack

1. Ouvrez OtakuTrack dans votre navigateur
2. Cliquez sur ⚙️ Config en haut à droite
3. Dans la section "Option 1: Supabase" :
   - Collez l'URL du projet
   - Collez la clé anon/public
4. Cliquez sur "Connecter Supabase"

## Étape 5: Synchronisation

- Toutes vos modifications seront automatiquement synchronisées avec Supabase
- Vous pouvez utiliser OtakuTrack sur plusieurs appareils avec les mêmes identifiants Supabase
- Les données sont sauvegardées en temps réel dans la base de données

## Hébergement GitHub Pages (optionnel)

Votre application reste hébergée gratuitement sur GitHub Pages :
1. Poussez vos fichiers sur GitHub
2. Allez dans Settings → Pages
3. Activez GitHub Pages sur la branche main

L'application fonctionnera exactement comme avant, mais avec la synchronisation Supabase en plus !
