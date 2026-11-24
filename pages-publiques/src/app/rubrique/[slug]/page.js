import { notFound } from 'next/navigation';
import Link from 'next/link';
import CarteArticle from '../../../components/CarteArticle';
import { lireArticlesPublies } from '../../../lib/publics';
import { RUBRIQUES, rubriqueParSlug } from '../../../lib/rubriques';

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return RUBRIQUES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const rubrique = rubriqueParSlug(slug);
  if (!rubrique) return {};
  return {
    title: `${rubrique.nom} : les derniers articles`,
    description: `Tous les articles de la rubrique ${rubrique.nom} publiés par les journalistes vérifiés de MediaPress.`,
    alternates: { canonical: `/rubrique/${rubrique.slug}` },
  };
}

export default async function PageRubrique({ params }) {
  const { slug } = await params;
  const rubrique = rubriqueParSlug(slug);
  if (!rubrique) notFound();

  const articles = await lireArticlesPublies({ limite: 24, categorie: rubrique.nom });

  return (
    <section>
      <h1>{rubrique.nom}</h1>

      <nav aria-label="Rubriques" className="rubriques">
        <ul>
          {RUBRIQUES.map((r) => (
            <li key={r.slug}>
              <Link href={`/rubrique/${r.slug}`} aria-current={r.slug === slug ? 'page' : undefined}>
                {r.nom}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {articles.length === 0 ? (
        <p className="vide">Aucun article dans cette rubrique pour le moment.</p>
      ) : (
        <div className="grille-articles">
          {articles.map((a) => (
            <CarteArticle key={a.id} article={a} niveau="h2" />
          ))}
        </div>
      )}
    </section>
  );
}
