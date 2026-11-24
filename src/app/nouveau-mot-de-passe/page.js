import FormulaireNouveauMotDePasse from '../../components/FormulaireNouveauMotDePasse';

export const metadata = {
  title: 'Nouveau mot de passe',
  robots: { index: false, follow: false },
};

export default function NouveauMotDePasse() {
  return (
    <section>
      <h1>Nouveau mot de passe</h1>
      <p className="intro-page">
        Choisissez un mot de passe que vous n’utilisez nulle part ailleurs.
      </p>
      <FormulaireNouveauMotDePasse />
    </section>
  );
}