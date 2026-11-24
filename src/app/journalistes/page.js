import Link from 'next/link';
import Avatar from '../../components/Avatar';
import { creerClientPublic } from '../../lib/supabase/public';
import {
  normaliser,
  nomComplet,
  initiales,
  lieu,
  extrait,
  lienJournaliste,
} from '../../lib/journalistes';
import { urlPhoto } from '../../lib/photos';
import './annuaire.css';

const DESCRIPTION =
  'Découvrez les journalistes et chroniqueurs vérifiés de lechroniqueur : leur média, leur pays et leur parcours.';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const recherche = typeof params?.q === 'string' && params.q.trim() !== '';

  return {
    title: 'Annuaire des journalistes',
    description: DESCRIPTION,
    alternates: { canonical: '/journalistes' },
    // Les pages de résultats de recherche ne doivent pas être indexées.
    robots: recherche ? { index: false, follow: true } : undefined,
  };
}

export default async function Journalistes({ searchParams }) {
  const params = await searchParams;
  const brut = typeof params?.q === 'string' ? params.q.slice(0, 80) : '';
  const mots = normaliser(brut).split(' ').filter(Boolean);

  const supabase = creerClientPublic();
  const { data, error } = await supabase
    .from('journalistes')
    .select('id, prenom, nom, media, ville, pays, bio, photo_path')
    .order('nom', { ascending: true })
    .order('prenom', { ascending: true })
    .limit(500);

  const tous = data ?? [];
  const liste =
    mots.length === 0
      ? tous
      : tous.filter((j) => {
          const texte = normaliser([j.prenom, j.nom, j.media, j.ville, j.pays].join(' '));
          return mots.every((m) => texte.includes(m));
        });

  return (
    <section>
      <h1>Annuaire des journalistes</h1>
      <p className="intro-page">
        Les journalistes et chroniqueurs vérifiés de lechroniqueur, leur média et leur pays.
        Chaque carte de presse a été contrôlée par notre équipe.
      </p>

      <form className="recherche" method="get" action="/journalistes" role="search">
        <label htmlFor="q">Rechercher un journaliste, un média ou un pays</label>
        <div className="recherche-ligne">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={brut}
            maxLength={80}
            autoComplete="off"
          />
          <button type="submit" className="btn-principal">Rechercher</button>
          {brut && (
            <Link href="/journalistes" className="effacer">Effacer la recherche</Link>
          )}
        </div>
      </form>

      {error && (
        <p className="erreur" role="alert">
          Impossible de charger l’annuaire pour le moment. Actualisez la page.
        </p>
      )}

      {!error && (
        <p className="compte-resultats">
          {liste.length === 0
            ? 'Aucun journaliste trouvé.'
            : liste.length === 1
              ? '1 journaliste'
              : `${liste.length} journalistes`}
          {brut && liste.length > 0 ? ` pour « ${brut} »` : ''}
        </p>
      )}

      {!error && tous.length === 0 && (
        <p className="vide">
          Aucun journaliste n’est encore inscrit. Les profils apparaîtront ici dès
          que les premiers comptes seront validés.
        </p>
      )}

      {!error && tous.length > 0 && liste.length === 0 && (
        <p className="vide">
          Aucun résultat pour « {brut} ». Essayez un autre nom, un autre média ou un pays.
        </p>
      )}

      {liste.length > 0 && (
        <ul className="annuaire">
          {liste.map((j) => (
            <li key={j.id} className="fiche">
              <Avatar taille="l" photoUrl={urlPhoto(j.photo_path)} initiales={initiales(j)} />
              <div>
                <h2>
                  <Link href={lienJournaliste(j)}>{nomComplet(j)}</Link>
                </h2>
                {j.media && <p className="fiche-media">{j.media}</p>}
                {lieu(j) && <p className="fiche-lieu">{lieu(j)}</p>}
                {j.bio && <p className="fiche-bio">{extrait(j.bio)}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
