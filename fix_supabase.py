import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer la logique d'insertion des animes
old_anime = r"if \(DB\.animes\.length > 0\) \{\s*console\.log\(`Sauvegarde de \$\{DB\.animes\.length\} animes\.\.\.`\);\s*const \{ error: animeError \} = await supabaseClient\s*\.from\('animes'\)\s*\.upsert\(DB\.animes, \{ onConflict: 'id' \}\);"

new_anime = """// Préparer les données pour Supabase en mappant lastModified -> updated_at
    const animesForSupabase = DB.animes.map(({ lastModified, ...rest }) => ({
      ...rest,
      updated_at: lastModified || Date.now()
    }));

    const mangasForSupabase = DB.mangas.map(({ lastModified, ...rest }) => ({
      ...rest,
      updated_at: lastModified || Date.now()
    }));

    // Utiliser upsert au lieu de delete+insert pour éviter les pertes de données
    if (animesForSupabase.length > 0) {
      console.log(`Sauvegarde de ${animesForSupabase.length} animes...`);
      const { error: animeError } = await supabaseClient
        .from('animes')
        .upsert(animesForSupabase, { onConflict: 'id' });"""

content = re.sub(old_anime, new_anime, content, flags=re.DOTALL)

# Remplacer la logique d'insertion des mangas
old_manga = r"if \(DB\.mangas\.length > 0\) \{\s*console\.log\(`Sauvegarde de \$\{DB\.mangas\.length\} mangas\.\.\.`\);\s*const \{ error: mangaError \} = await supabaseClient\s*\.from\('mangas'\)\s*\.upsert\(DB\.mangas, \{ onConflict: 'id' \}\);"

new_manga = """if (mangasForSupabase.length > 0) {
      console.log(`Sauvegarde de ${mangasForSupabase.length} mangas...`);
      const { error: mangaError } = await supabaseClient
        .from('mangas')
        .upsert(mangasForSupabase, { onConflict: 'id' });"""

content = re.sub(old_manga, new_manga, content, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix appliqué avec succès!")
