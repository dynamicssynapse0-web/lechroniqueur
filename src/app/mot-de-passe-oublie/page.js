import FormulaireMotDePasseOublie from '../../components/FormulaireMotDePasseOublie';

export const metadata = {
  title: 'Mot de passe oublié',
  robots: { index: false, follow: false },
};

export default function MotDePasseOublie() {
  return (
    <section>
      <h1>Mot de passe oublié</h1>
      <p className="intro-page">
        Indiquez l’adresse email de votre compte. Nous vous enverrons un lien
        pour choisir un nouveau mot de passe.
      </p>
      <FormulaireMotDePasseOublie />
    </section>
  );
}