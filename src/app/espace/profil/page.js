import { notFound } from 'next/navigation';
import EditerProfil from '../../../components/EditerProfil';
import { exigerAuteurActif } from '../../../lib/auteur';
import { lienJournaliste } from '../../../lib/journalistes';
import './profil.css';

export const metadata = {
  title: 'Mon profil',
  robots: { index: false, follow: false },
};

export default async function MonProfil() {
  const { supabase, utilisateurId } = await exigerAuteurActif();

  const { data: profil } = await supabase
    .from('profiles')
    .select('prenom, nom, media, email, ville, pays, photo_path')
    .eq('id', utilisateurId)
    .maybeSingle();

  if (!profil) notFound();

  const { data: fiche } = await supabase
    .from('journalistes')
    .select('bio, photo_path')
    .eq('id', utilisateurId)
    .maybeSingle();

  const lienPublic = lienJournaliste({
    id: utilisateurId,
    prenom: profil.prenom,
    nom: profil.nom,
  });

  return (
    <section>
      <h1>Mon profil</h1>
      <p className="intro-page">
        Votre photo, votre biographie, votre ville et votre pays apparaissent sur
        votre profil public, dans l’annuaire et avec chacun de vos articles.
      </p>

      <EditerProfil
        utilisateurId={utilisateurId}
        photoChemin={fiche?.photo_path ?? profil.photo_path ?? ''}
        identite={{
          prenom: profil.prenom,
          nom: profil.nom,
          media: profil.media,
          email: profil.email,
        }}
        initial={{
          bio: fiche?.bio ?? '',
          ville: profil.ville ?? '',
          pays: profil.pays ?? '',
        }}
        lienPublic={lienPublic}
      />
    </section>
  );
}
