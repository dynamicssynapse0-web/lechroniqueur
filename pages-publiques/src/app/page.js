import Link from 'next/link';
import CarteArticle from '../components/CarteArticle';
import { lireArticlesPublies } from '../lib/publics';
import { RUBRIQUES } from '../lib/rubriques';

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: '/' },
};

export default async function Accueil() {
  const articles = await lireArticlesPublies({ limite: 13 });
  const [une, ...suite] = articles;

  return (
    <section>
      <h1>Les articles de ceux qui font l’actualité</h1>

      <nav aria-label="Rubriques" className="rubriques">
        <ul>
          {RUBRIQUES.map((r) => (
            <li key={r.slug}>
              <Link href={`/rubrique/${r.slug}`}>{r.nom}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {!une && <p className="vide">Aucun article n’est publié pour le moment.</p>}

      {une && <CarteArticle article={une} grande niveau="h2" />}

      {suite.length > 0 && (
        <>
          <h2 className="titre-section">Derniers articles</h2>
          <div className="grille-articles">
            {suite.map((a) => (
              <CarteArticle key={a.id} article={a} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
