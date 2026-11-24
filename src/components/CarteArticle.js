import Link from 'next/link';
import Avatar from './Avatar';
import { urlImage } from '../lib/images';
import { auteurAffichage } from '../lib/journalistes';
import { formaterDate } from '../lib/format';
import './carte-article.css';

export default function CarteArticle({
  article,
  grande = false,
  niveau = 'h3',
  sansAuteur = false,
}) {
  const Titre = niveau;
  const image = urlImage(article.image_path);
  const j = article.auteur;
  const auteur = auteurAffichage(j);
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
        <div className="carte-meta">
          {!sansAuteur && (
            <Avatar taille="s" photoUrl={auteur.photoUrl} initiales={auteur.initiales} />
          )}
          <p>
            {!sansAuteur && (
              <>
                {auteur.lien ? (
                  <Link href={auteur.lien}>{auteur.nom}</Link>
                ) : (
                  auteur.nom
                )}
                {j?.media ? `, ${j.media}` : ''} ·{' '}
              </>
            )}
            <time dateTime={article.publie_le}>{formaterDate(article.publie_le)}</time>
          </p>
        </div>
      </div>
    </article>
  );
}
