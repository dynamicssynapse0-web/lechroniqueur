import { redirect } from 'next/navigation';
import FinaliserProfil from '../../components/FinaliserProfil';
import { creerClientServeur } from '../../lib/supabase/serveur';
import ModifierBio from '../../components/ModifierBio';



export const metadata = {
  title: 'Finaliser mon profil',
  robots: { index: false, follow: false },
};

export default async function Profil() {
  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) redirect('/connexion');

  const { data: profil } = await supabase
    .from('profiles')
    .select('prenom, nom, media, email, statut, role')
    .eq('id', utilisateurId)
    .maybeSingle();

  if (!profil) redirect('/connexion');
  if (profil.role === 'admin') redirect('/admin');
  if (profil.statut === 'actif') redirect('/espace/nouvel-article');
  if (profil.statut !== 'accepte') redirect('/suivi');

  return (
    <section>
      <h1>Finaliser mon profil</h1>
      <p className="intro-page">
        Dernière étape avant de pouvoir publier vos articles sur lechroniqueur.
      </p>
      <FinaliserProfil
        profil={{
          prenom: profil.prenom,
          nom: profil.nom,
          media: profil.media,
          email: profil.email,
        }}
      />
    </section>
  );
}