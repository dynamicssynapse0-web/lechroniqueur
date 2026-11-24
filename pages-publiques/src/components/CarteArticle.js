import Link from 'next/link';
import { urlImage } from '../lib/publics';
import { formaterDate } from '../lib/format';

export default function CarteArticle({ article, grande = false, niveau = 'h3' }) {
  const Titre = niveau;
  const image = urlImage(article.image_path);
  const auteur = article.auteur
    ? `${article.auteur.prenom} ${article.auteur.nom}`.trim()
    : 'Rédaction MediaPress';
  const lien = `/article/${article.slug}`;

  return (
    <article className={grande ? 'carte-article grande' : 'carte-article'}>
      <Link href={lien} className="carte-image" tabIndex={-1} aria-hidden="true">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading={grande ? 'eager' : 'lazy'} />
        )}
      </Link>
      <div className="carte-corps">
        {article.categorie && <p className="etiquette-rubrique">{article.categorie}</p>}
        <Titre>
          <Link href={lien}>{article.titre}</Link>
        </Titre>
        {article.resume && <p className="carte-resume">{article.resume}</p>}
        <p className="carte-meta">
          {auteur}
          {article.auteur?.media ? `, ${article.auteur.media}` : ''} ·{' '}
          <time dateTime={article.publie_le}>{formaterDate(article.publie_le)}</time>
        </p>
      </div>
    </article>
  );
}
