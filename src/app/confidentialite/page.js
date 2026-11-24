import Link from 'next/link';
import PageTexte from '../../components/PageTexte';
import { SITE_INFOS as I } from '../../lib/site';

export const metadata = {
  title: 'Politique de confidentialité',
  description:
    'Quelles données personnelles lechroniqueur collecte, pourquoi, qui y a accès, combien de temps elles sont conservées et comment exercer vos droits.',
  alternates: { canonical: '/confidentialite' },
};

export default function Confidentialite() {
  return (
    <PageTexte titre="Politique de confidentialité">
      <p>
        Cette page explique quelles données personnelles {I.nom} collecte, pourquoi, qui
        peut les consulter et comment vous pouvez les contrôler.
      </p>

      <h2>Qui est responsable de vos données ?</h2>
      <p>
        Le responsable est l’éditeur du site : {I.editeur}. Pour toute question, utilisez
        la page <Link href="/contact">Contact</Link>.
      </p>

      <h2>Les données que nous collectons</h2>
      <p>
        <strong>Quand vous demandez à devenir journaliste :</strong>
      </p>
      <ul>
        <li>votre prénom et votre nom ;</li>
        <li>le nom de votre média ;</li>
        <li>votre adresse email et votre mot de passe ;</li>
        <li>votre numéro de carte de presse (facultatif) et l’image de votre carte de presse ;</li>
        <li>votre photo de profil.</li>
      </ul>
      <p>
        <strong>Quand vous complétez votre profil :</strong> votre ville, votre pays et votre
        numéro de téléphone.
      </p>
      <p>
        <strong>Quand vous utilisez votre espace :</strong> votre biographie, vos articles et
        leurs images de couverture.
      </p>
      <p>
        <strong>Données techniques :</strong> un cookie de connexion, et, comme sur tout site,
        des journaux techniques conservés par l’hébergeur (adresse IP, date et page
        consultée) pour la sécurité et le bon fonctionnement du service.
      </p>

      <h2>Pourquoi nous les utilisons</h2>
      <ul>
        <li>vérifier que vous êtes bien journaliste, avant toute publication ;</li>
        <li>créer et gérer votre compte, et vous permettre de vous connecter ;</li>
        <li>publier vos articles, votre profil et votre photo sur le site ;</li>
        <li>vous informer de l’avancement de votre demande ;</li>
        <li>protéger le site contre les abus et les faux comptes.</li>
      </ul>
      <p>
        Nous traitons ces données avec votre accord (la case que vous cochez à
        l’inscription) et pour fournir le service que vous avez demandé.
      </p>

      <h2>Ce qui est public et ce qui reste privé</h2>
      <p>
        <strong>Public</strong> (visible par tous les visiteurs, à partir de la finalisation de
        votre profil) : votre nom, le nom de votre média, votre ville, votre pays, votre
        biographie, votre photo de profil et vos articles publiés.
      </p>
      <p>
        <strong>Privé</strong> (visible uniquement par vous et par l’équipe {I.nom}) : votre
        adresse email, votre numéro de téléphone, votre numéro de carte de presse et l’image
        de votre carte de presse. Votre mot de passe n’est jamais conservé en clair.
      </p>

      <h2>Qui y a accès</h2>
      <p>
        Les données privées ne sont consultées que par l’équipe {I.nom}, pour vérifier votre
        statut et gérer le service. Nous faisons appel à des prestataires techniques : Supabase
        (base de données, authentification et stockage des fichiers) et l’hébergeur du site.
        Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.
      </p>
      <p>Vos données sont stockées dans la région suivante : {I.regionDonnees}.</p>

      <h2>Combien de temps nous les conservons</h2>
      <p>
        Vos données sont conservées tant que votre compte existe. Si votre demande est refusée,
        vos informations, votre carte de presse et votre photo sont supprimées dans un délai de :{' '}
        {I.dureeRefus}. Vous pouvez demander la suppression de votre compte à tout moment.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès à vos données, leur correction, leur suppression, ou retirer
        votre accord. Vous pouvez modifier vous-même votre photo, votre biographie, votre ville
        et votre pays depuis la page « Mon profil » de votre espace. Pour tout le reste, écrivez-nous
        via la page <Link href="/contact">Contact</Link>.
      </p>
      <p>
        Quand vous supprimez un article, il disparaît immédiatement du site. Les copies que des
        moteurs de recherche ou d’autres sites auraient pu conserver peuvent mettre plus de temps
        à disparaître.
      </p>

      <h2>Cookies</h2>
      <p>
        {I.nom} n’utilise que les cookies indispensables à la connexion à votre espace. Aucun cookie
        publicitaire ni outil de mesure d’audience n’est utilisé pour le moment. Si cela change,
        cette page sera mise à jour et votre accord sera demandé.
      </p>

      <h2>Sécurité</h2>
      <p>
        Votre carte de presse est stockée dans un espace privé, accessible uniquement à l’équipe.
        Les mots de passe sont protégés et l’accès aux pages d’administration est réservé. Aucun
        système n’étant infaillible, nous vous invitons à choisir un mot de passe unique.
      </p>

      <h2>Modifications de cette page</h2>
      <p>
        Nous pouvons mettre cette politique à jour. La date de dernière mise à jour est indiquée en
        haut de la page.
      </p>
    </PageTexte>
  );
}
