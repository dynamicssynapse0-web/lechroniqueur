import Link from 'next/link';
import { SITE_URL } from '../../lib/site-url';
import './a-propos.css';

export const metadata = {
  title: 'À propos',
  description:
    'lechroniqueur est la plateforme où les journalistes et chroniqueurs vérifiés publient leurs articles et se font connaître, même sans site web.',
  alternates: { canonical: '/a-propos' },
};

export default function APropos() {
  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'À propos de lechroniqueur',
    url: `${SITE_URL}/a-propos`,
    inLanguage: 'fr',
    mainEntity: { '@type': 'Organization', name: 'lechroniqueur', url: SITE_URL },
  };

  return (
    <div className="a-propos">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees).replace(/</g, '\\u003c') }}
      />

      <h1>À propos de lechroniqueur</h1>
      <p className="chapeau-page">
        lechroniqueur est une plateforme de presse ouverte aux journalistes et aux
        chroniqueurs. Elle leur permet de publier leurs articles, de se faire
        connaître et d’être lus, même sans disposer d’un site web personnel.
      </p>

      <section aria-labelledby="pourquoi">
        <h2 id="pourquoi" className="titre-section">Pourquoi lechroniqueur ?</h2>
        <p>
          Tous les journalistes n’ont pas leur propre site, ni le temps ou les
          moyens d’en créer un. lechroniqueur leur offre un endroit où publier, une
          page de présentation à leur nom et un public.
        </p>
        <p>
          Pour les lecteurs, c’est la garantie de lire des articles signés par des
          professionnels dont la carte de presse a été examinée avant toute
          publication.
        </p>
      </section>

      <section aria-labelledby="comment">
        <h2 id="comment" className="titre-section">Comment devenir journaliste sur lechroniqueur</h2>
        <ol className="etapes-propos">
          <li>
            <strong>Créez votre compte</strong>
            <span>Renseignez vos informations et envoyez une photo de votre carte de presse.</span>
          </li>
          <li>
            <strong>Confirmez votre adresse email</strong>
            <span>Un lien vous est envoyé pour valider votre adresse.</span>
          </li>
          <li>
            <strong>Votre carte de presse est vérifiée</strong>
            <span>Notre équipe examine votre demande. Vous suivez son avancement depuis votre espace.</span>
          </li>
          <li>
            <strong>Complétez votre profil et publiez</strong>
            <span>Ajoutez votre ville, votre pays et votre biographie, puis rédigez vos articles.</span>
          </li>
        </ol>
      </section>

      <section aria-labelledby="engagements">
        <h2 id="engagements" className="titre-section">Nos engagements</h2>
        <ul className="engagements">
          <li>
            <strong>Des journalistes vérifiés</strong>
            Personne ne publie sans qu’une carte de presse ait été examinée par notre équipe.
          </li>
          <li>
            <strong>Des articles signés</strong>
            Chaque article est signé et relié au profil public de son auteur.
          </li>
          <li>
            <strong>Des données protégées</strong>
            Votre carte de presse et votre numéro de téléphone ne sont jamais publics :
            seule l’équipe lechroniqueur peut les consulter.
          </li>
          <li>
            <strong>Un accès libre pour les lecteurs</strong>
            Lire les articles et consulter l’annuaire ne demande ni compte ni inscription.
          </li>
        </ul>
      </section>

      <section aria-labelledby="lecteurs">
        <h2 id="lecteurs" className="titre-section">Pour les lecteurs</h2>
        <p>
          Parcourez les articles par rubrique (politique, société, économie, sport,
          culture et bien d’autres) ou découvrez ceux qui les écrivent dans
          l’annuaire des journalistes : leur média, leur pays et l’ensemble de
          leurs articles.
        </p>
      </section>

      <section className="appel" aria-labelledby="appel">
        <h2 id="appel">Vous êtes journaliste ou chroniqueur ?</h2>
        <p>Rejoignez lechroniqueur et faites lire vos articles.</p>
        <div className="appel-actions">
          <Link href="/inscription" className="btn-principal btn-lien">Devenir journaliste</Link>
          <Link href="/journalistes" className="btn-clair">Découvrir les journalistes</Link>
        </div>
      </section>
    </div>
  );
}
