'use server';

import { revalidatePath } from 'next/cache';
import { creerClientServeur } from '../../lib/supabase/serveur';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Appelée après une publication ou un retrait : évite d'attendre les 60 s d'ISR
// pour voir l'article apparaître/disparaître sur l'accueil et dans les rubriques.
export async function revalidateArticlesPublies() {
  revalidatePath('/', 'layout');
  revalidatePath('/journalistes');
  revalidatePath('/rubrique/[slug]', 'page');
  revalidatePath('/article/[slug]', 'page');
  revalidatePath('/journalistes/[slug]', 'page');
  revalidatePath('/sitemap.xml');
}

export async function supprimerArticle(id) {
  if (typeof id !== 'string' || !UUID.test(id)) {
    return { erreur: 'Article introuvable.' };
  }

  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) {
    return { erreur: 'Votre session a expiré. Reconnectez-vous.' };
  }

  // On ne supprime que ses propres articles (la base le vérifie aussi).
  const { data: article } = await supabase
    .from('articles')
    .select('image_path')
    .eq('id', id)
    .eq('auteur_id', utilisateurId)
    .maybeSingle();
  if (!article) return { erreur: 'Article introuvable.' };

  const { data: supprimes, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .eq('auteur_id', utilisateurId)
    .select('id');

  if (error || !supprimes || supprimes.length === 0) {
    return { erreur: 'La suppression a échoué. Réessayez.' };
  }

  // On supprime aussi l'image de couverture.
  if (article.image_path) {
    await supabase.storage.from('couvertures').remove([article.image_path]);
  }

  await revalidateArticlesPublies();
  revalidatePath('/espace');

  return { ok: true };
}
