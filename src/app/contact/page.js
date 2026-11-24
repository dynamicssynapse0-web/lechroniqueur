import PageTexte from '../../components/PageTexte';
import { SITE_INFOS as I, emailValide } from '../../lib/site';

export const metadata = {
  title: 'Contact',
  description:
    'Contactez l’équipe lechroniqueur : une question, un signalement de contenu ou une demande concernant vos données.',
  alternates: { canonical: '/contact' },
};

const mailto = (sujet) => `mailto:${I.email}?subject=${encodeURIComponent(sujet)}`;

export default function Contact() {
  const ok = emailValide();

  return (
    <PageTexte titre="Contact">
      <p>
        Une question sur votre inscription, un contenu à signaler, une demande concernant vos
        données : écrivez-nous. Précisez toujours l’adresse email de votre compte et, pour un
        signalement, l’adresse de la page concernée.
      </p>

      <h2>Nous écrire</h2>
      <dl>
        <div>
          <dt>Adresse email</dt>
          <dd>{ok ? <a href={`mailto:${I.email}`}>{I.email}</a> : I.email}</dd>
        </div>
        {I.telephone && (
          <div>
            <dt>Téléphone</dt>
            <dd>{I.telephone}</dd>
          </div>
        )}
        <div>
          <dt>Adresse postale</dt>
          <dd>{I.adresse}</dd>
        </div>
      </dl>

      {ok && (
        <>
          <h2>Écrire pour un motif précis</h2>
          <p>Ces boutons ouvrent votre messagerie avec l’objet déjà rempli.</p>
          <div className="actions-contact">
            <a className="btn-principal btn-lien" href={mailto('Question sur mon inscription')}>
              Question sur mon inscription
            </a>
            <a className="btn-secondaire btn-lien-pdf" href={mailto('Signalement d’un contenu')}>
              Signaler un contenu
            </a>
            <a className="btn-secondaire btn-lien-pdf" href={mailto('Demande concernant mes données')}>
              Mes données personnelles
            </a>
          </div>
        </>
      )}

      <h2>Corriger votre identité</h2>
      <p>
        Votre nom et le nom de votre média ont été vérifiés avec votre carte de presse et ne
        se modifient pas depuis votre espace. Pour les corriger, écrivez-nous.
      </p>
    </PageTexte>
  );
}
