import Link from 'next/link';
import PageTexte from '../../components/PageTexte';
import { SITE_INFOS as I } from '../../lib/site';

export const metadata = {
  title: 'Conditions d’utilisation',
  description:
    'Les règles d’utilisation de lechroniqueur pour les lecteurs et pour les journalistes qui publient.',
  alternates: { canonical: '/conditions' },
};

export default function Conditions() {
  return (
    <PageTexte titre="Conditions d’utilisation">
      <p>
        En utilisant {I.nom}, vous acceptez les règles ci-dessous. Elles complètent les{' '}
        <Link href="/mentions-legales">mentions légales</Link> et la{' '}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>Ce que propose le site</h2>
      <p>
        {I.nom} permet de lire gratuitement des articles signés par des journalistes et chroniqueurs
        dont la carte de presse a été vérifiée, et de découvrir ces journalistes dans un annuaire.
        Lire le site et consulter l’annuaire ne demande ni compte ni inscription.
      </p>

      <h2>Devenir journaliste sur {I.nom}</h2>
      <ul>
        <li>Vous devez fournir des informations exactes et une carte de presse authentique.</li>
        <li>
          Votre photo de profil doit être un portrait de vous : elle est affichée publiquement avec
          vos articles et votre profil.
        </li>
        <li>
          L’équipe {I.nom} examine chaque demande et peut l’accepter ou la refuser. Un motif peut
          vous être communiqué en cas de refus.
        </li>
        <li>Vous ne pouvez publier qu’une fois votre demande acceptée et votre profil complété.</li>
        <li>Vous êtes responsable de la confidentialité de votre mot de passe.</li>
      </ul>

      <h2>Les contenus que vous publiez</h2>
      <p>
        Vous restez propriétaire de vos articles et de vos images. Vous êtes responsable de leur
        contenu, et vous garantissez disposer des droits nécessaires sur les textes, photos et images
        que vous publiez.
      </p>
      <p>Il est interdit de publier un contenu :</p>
      <ul>
        <li>illégal, diffamatoire ou qui porte atteinte à la vie privée d’une personne ;</li>
        <li>qui incite à la haine, à la violence ou à la discrimination ;</li>
        <li>à caractère pornographique ou qui exploite des mineurs ;</li>
        <li>qui reproduit le travail d’autrui sans autorisation ;</li>
        <li>trompeur, ou publié dans le but de tromper les lecteurs sur votre identité.</li>
      </ul>
      <p>
        Vous autorisez {I.nom} à afficher vos articles, votre photo et votre profil sur le site, y
        compris dans les aperçus de partage et les moteurs de recherche, tant qu’ils sont publiés.
        Vous pouvez supprimer vos articles à tout moment depuis votre espace.
      </p>

      <h2>Signalement et retrait de contenus</h2>
      <p>
        Pour signaler un contenu, utilisez la page <Link href="/contact">Contact</Link> en indiquant
        l’adresse de la page et la raison. {I.nom} peut retirer un contenu ou suspendre un compte qui ne
        respecte pas ces conditions.
      </p>

      <h2>Disponibilité du service</h2>
      <p>
        Le service est fourni tel quel. Nous faisons le nécessaire pour qu’il soit accessible, sans
        pouvoir garantir une disponibilité continue : il peut être interrompu pour une maintenance
        ou en cas de problème technique.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Les articles engagent leurs auteurs. {I.nom} fournit l’espace de publication et ne relit pas
        les articles avant leur mise en ligne.
      </p>

      <h2>Droit applicable</h2>
      <p>{I.droitApplicable}</p>

      <h2>Modification des conditions</h2>
      <p>
        Nous pouvons modifier ces conditions. La date de dernière mise à jour est indiquée en haut de
        la page. Continuer à utiliser le service après une modification vaut acceptation.
      </p>
    </PageTexte>
  );
}
