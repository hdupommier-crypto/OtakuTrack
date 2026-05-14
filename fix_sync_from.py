import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer la fonction syncFromSupabase pour mapper updated_at -> lastModified
old_func = """async function syncFromSupabase() {
  if (!supabaseClient || !useSupabase) return;

  try {
    const { data: animes, error: err1 } = await supabaseClient.from('animes').select('*');
    const { data: mangas, error: err2 } = await supabaseClient.from('mangas').select('*');

    if (!err1 && !err2) {
      DB = {
        animes: animes || [],
        mangas: mangas || []
      };
      renderAll();
      localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
    }
  } catch (error) {
    console.error('Erreur sync Supabase:', error);
  }
}"""

new_func = """async function syncFromSupabase() {
  if (!supabaseClient || !useSupabase) return;

  try {
    const { data: animes, error: err1 } = await supabaseClient.from('animes').select('*');
    const { data: mangas, error: err2 } = await supabaseClient.from('mangas').select('*');

    if (!err1 && !err2) {
      // Mapper updated_at -> lastModified pour la cohérence locale
      const animesMapped = (animes || []).map(({ updated_at, ...rest }) => ({
        ...rest,
        lastModified: updated_at || Date.now()
      }));
      
      const mangasMapped = (mangas || []).map(({ updated_at, ...rest }) => ({
        ...rest,
        lastModified: updated_at || Date.now()
      }));
      
      DB = {
        animes: animesMapped,
        mangas: mangasMapped
      };
      renderAll();
      localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
      console.log('✅ Données chargées depuis Supabase avec mapping updated_at -> lastModified');
    }
  } catch (error) {
    console.error('Erreur sync Supabase:', error);
  }
}"""

content = content.replace(old_func, new_func)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix syncFromSupabase appliqué avec succès!")
