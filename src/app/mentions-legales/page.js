import Link from 'next/link';
import PageTexte from '../../components/PageTexte';
import { SITE_INFOS as I } from '../../lib/site';

export const metadata = {
  title: 'Mentions légales',
  description:
    'Informations légales sur l’éditeur de lechroniqueur, son hébergement et la responsabilité des contenus publiés.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegales() {
  return (
    <PageTexte titre="Mentions légales">
      <h2>Éditeur du site</h2>
      <dl>
        <div>
          <dt>Éditeur</dt>
          <dd>{I.editeur}</dd>
        </div>
        <div>
          <dt>Statut</dt>
          <dd>{I.statut}</dd>
        </div>
        <div>
          <dt>Adresse</dt>
          <dd>{I.adresse}</dd>
        </div>
        <div>
          <dt>Adresse email</dt>
          <dd>{I.email}</dd>
        </div>
        {I.telephone && (
          <div>
            <dt>Téléphone</dt>
            <dd>{I.telephone}</dd>
          </div>
        )}
        <div>
          <dt>Responsable de la publication</dt>
          <dd>{I.responsablePublication}</dd>
        </div>
      </dl>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par : {I.hebergeur}.</p>
      <p>
        Les données du site (comptes, articles, images) sont stockées par notre
        prestataire technique Supabase, dans la région suivante : {I.regionDonnees}.
      </p>

      <h2>Contenus publiés par les journalistes</h2>
      <p>
        {I.nom} est une plateforme qui permet à des journalistes et chroniqueurs dont
        la carte de presse a été vérifiée de publier leurs articles. Chaque article est
        signé et publié sous la responsabilité de son auteur. {I.nom} ne relit pas les
        articles avant leur publication.
      </p>
      <p>
        Pour signaler un contenu que vous estimez illicite ou inexact, utilisez la
        page <Link href="/contact">Contact</Link> en indiquant l’adresse de la page
        concernée et la raison de votre signalement.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les articles, photographies et images publiés par les journalistes restent la
        propriété de leurs auteurs. Le nom {I.nom}, son logo et la conception du site
        appartiennent à l’éditeur. Toute reproduction sans autorisation est interdite.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Les informations sur la manière dont vos données sont utilisées se trouvent
        dans la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </PageTexte>
  );
}
