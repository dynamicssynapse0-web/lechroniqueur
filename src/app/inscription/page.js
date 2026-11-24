import FormulaireInscription from '../../components/FormulaireInscription';

export const metadata = {
  title: 'Devenir journaliste',
  description:
    'Inscrivez-vous sur lechroniqueur avec votre carte de presse pour publier vos articles et être visible auprès de tous les lecteurs.',
};

export default function Inscription() {
  return (
    <section>
      <h1>Devenir journaliste sur lechroniqueur</h1>
      <p className="intro-page">
        Rejoignez la plateforme des journalistes et chroniqueurs. Votre carte de
        presse est vérifiée avant toute publication, pour garantir la fiabilité
        des articles.
      </p>
      <FormulaireInscription />
    </section>
  );
}