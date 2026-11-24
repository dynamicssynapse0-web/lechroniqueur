import Link from 'next/link';
import SupprimerArticle from '../../components/SupprimerArticle';
import { exigerAuteurActif } from '../../lib/auteur';

export const metadata = {
  title: 'Mes articles',
  robots: { index: false, follow: false },
};

function formaterDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function MesArticles() {
  const { supabase, utilisateurId, auteur } = await exigerAuteurActif();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, titre, slug, statut, updated_at')
    .eq('auteur_id', utilisateurId)
    .order('updated_at', { ascending: false });

  return (
    <section>
      <h1>Mes articles</h1>
      <p className="intro-page">
        Bonjour {auteur.nom}. Retrouvez ici vos brouillons et vos articles publiés.
      </p>
      <p>
        <span className="badge badge-bleu" style={{ marginLeft: 0 }}>✔ Compte vérifié</span>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
        <Link href="/espace/nouvel-article" className="btn-principal btn-lien">
          Écrire un nouvel article
        </Link>
        <Link href="/espace/profil" className="btn-secondaire btn-lien-pdf">
          Modifier mon profil
        </Link>
      </div>

      {error && (
        <p className="erreur" role="alert">
          Impossible de charger vos articles. Actualisez la page.
        </p>
      )}

      {!error && articles.length === 0 && (
        <p className="vide">Vous n’avez pas encore écrit d’article.</p>
      )}

      {!error && articles.length > 0 && (
        <ul className="liste-articles">
          {articles.map((a) => (
            <li key={a.id} className="ligne-article">
              <div>
                <h2>{a.titre}</h2>
                <p>
                  <span className={`badge ${a.statut === 'publie' ? 'badge-bleu' : 'badge-rouge'}`}>
                    {a.statut === 'publie' ? 'Publié' : 'Brouillon'}
                  </span>{' '}
                  Modifié le {formaterDate(a.updated_at)}
                </p>
              </div>
              <div className="actions-ligne">
                {a.statut === 'publie' && (
                  <Link href={`/article/${a.slug}`} className="btn-secondaire btn-lien-pdf">
                    Voir
                  </Link>
                )}
                <Link href={`/espace/modifier/${a.id}`} className="btn-secondaire btn-lien-pdf">
                  Modifier
                </Link>
                <SupprimerArticle id={a.id} titre={a.titre} publie={a.statut === 'publie'} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
