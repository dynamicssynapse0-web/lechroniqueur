import { notFound } from 'next/navigation';
import EditeurArticle from '../../../../components/EditeurArticle';
import { exigerAuteurActif } from '../../../../lib/auteur';

export const metadata = {
  title: 'Modifier l’article',
  robots: { index: false, follow: false },
};

export default async function ModifierArticle({ params }) {
  const { id } = await params;
  const { supabase, utilisateurId, auteur } = await exigerAuteurActif();

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await supabase
    .from('articles')
    .select('id, titre, slug, resume, categorie, contenu, image_path, image_alt, statut, publie_le')
    .eq('id', id)
    .eq('auteur_id', utilisateurId)
    .maybeSingle();

  if (!data) notFound();

  return (
    <section>
      <h1>Modifier l’article</h1>
      <EditeurArticle
        utilisateurId={utilisateurId}
        auteur={auteur}
        articleInitial={{
          id: data.id,
          titre: data.titre,
          slug: data.slug,
          resume: data.resume,
          categorie: data.categorie ?? '',
          contenu: data.contenu,
          imagePath: data.image_path ?? '',
          imageAlt: data.image_alt ?? '',
          statut: data.statut,
          publieLe: data.publie_le,
        }}
      />
    </section>
  );
}