import FormulaireConnexion from '../../components/FormulaireConnexion';

export const metadata = {
  title: 'Se connecter',
  robots: { index: false, follow: false },
};

export default async function Connexion({ searchParams }) {
  const params = await searchParams;

  return (
    <section>
      <h1>Se connecter</h1>
      <p className="intro-page">
        Accédez à votre espace pour suivre votre demande ou publier vos articles.
      </p>
      <FormulaireConnexion lienInvalide={params?.erreur === 'lien'} />
    </section>
  );
}