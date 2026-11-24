import { redirect } from 'next/navigation';
import SuiviDemande from '../../components/SuiviDemande';
import { creerClientServeur } from '../../lib/supabase/serveur';

export const metadata = {
  title: 'Suivi de ma demande',
  robots: { index: false, follow: false },
};

export default async function Suivi() {
  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) redirect('/connexion');

  const { data: profil } = await supabase
    .from('profiles')
    .select('prenom, email, statut, role, motif_refus')
    .eq('id', utilisateurId)
    .maybeSingle();

  if (!profil) redirect('/connexion');
  if (profil.role === 'admin') redirect('/admin');

  return (
    <section>
      <h1>Suivi de ma demande</h1>
      <p className="intro-page">
        Suivez ici l’avancement de votre inscription comme journaliste.
      </p>
      <SuiviDemande
        utilisateurId={utilisateurId}
        profil={{
          prenom: profil.prenom,
          email: profil.email,
          statut: profil.statut,
          motif: profil.motif_refus ?? '',
        }}
      />
    </section>
  );
}