import EditeurArticle from '../../../components/EditeurArticle';
import { exigerAuteurActif } from '../../../lib/auteur';

export const metadata = {
  title: 'Nouvel article',
  robots: { index: false, follow: false },
};

export default async function NouvelArticle() {
  const { utilisateurId, auteur } = await exigerAuteurActif();

  return (
    <section>
      <h1>Nouvel article</h1>
      <p className="intro-page">
        Rédigez votre article, ajoutez une image de couverture, puis enregistrez-le
        en brouillon ou publiez-le.
      </p>
      <EditeurArticle utilisateurId={utilisateurId} auteur={auteur} />
    </section>
  );
}