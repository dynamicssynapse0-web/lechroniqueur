import { creerClientNavigateur } from './supabase/client';
import { normaliserTelephone } from './telephone';

const EXTENSIONS_CARTE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

const EXTENSIONS_PHOTO = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Retourne un message d’erreur, ou null si tout s’est bien passé.
export async function envoyerDemande(valeurs, carte, photo) {
  const supabase = creerClientNavigateur();

  const extensionCarte = EXTENSIONS_CARTE[carte?.type];
  if (!extensionCarte) return 'Format de carte non accepté.';

  const extensionPhoto = EXTENSIONS_PHOTO[photo?.type];
  if (!extensionPhoto) return 'Format de photo non accepté.';

  // 1. Dépôt de la carte de presse dans le dossier privé d’attente
  const cheminCarte = `depot/${crypto.randomUUID()}.${extensionCarte}`;
  const { error: erreurCarte } = await supabase.storage
    .from('cartes-presse')
    .upload(cheminCarte, carte, { contentType: carte.type, upsert: false });

  if (erreurCarte) {
    return 'L’envoi de la carte de presse a échoué. Vérifiez votre connexion et réessayez.';
  }

  // 2. Dépôt de la photo de profil (affichée seulement après acceptation)
  const cheminPhoto = `depot/${crypto.randomUUID()}.${extensionPhoto}`;
  const { error: erreurPhoto } = await supabase.storage
    .from('photos-profil')
    .upload(cheminPhoto, photo, {
      contentType: photo.type,
      upsert: false,
      cacheControl: '31536000',
    });

  if (erreurPhoto) {
    return 'L’envoi de la photo de profil a échoué. Vérifiez votre connexion et réessayez.';
  }

  // 3. Création du compte (le profil est créé automatiquement par la base)
  const { error } = await supabase.auth.signUp({
    email: valeurs.email.trim(),
    password: valeurs.motDePasse,
    options: {
      data: {
        prenom: valeurs.prenom.trim(),
        nom: valeurs.nom.trim(),
        media: valeurs.media.trim(),
        numero_carte: valeurs.numeroCarte.trim(),
        telephone: normaliserTelephone(valeurs.telephone),
        whatsapp_consent: valeurs.consentementWhatsapp,
        carte_path: cheminCarte,
        photo_path: cheminPhoto,
      },
    },
  });

  if (error) {
    // Le message générique masquait la vraie cause : on la journalise pour diagnostic.
    console.error('[inscription] échec signUp', {
      code: error.code,
      status: error.status,
      message: error.message,
    });

    if (error.status === 429 || (error.code || '').includes('rate_limit')) {
      return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
    }
    if (error.code === 'weak_password') {
      return 'Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié.';
    }
    if (
      error.code === 'email_exists' ||
      error.status === 422 ||
      /already registered|already exists/i.test(error.message || '')
    ) {
      return 'Cette adresse email est déjà inscrite. Connectez-vous ou utilisez une autre adresse.';
    }
    if (/database error|failed to create user/i.test(error.message || '')) {
      return 'La création du profil a échoué côté base de données. Réessayez dans un instant.';
    }
    return `L’inscription a échoué : ${error.message || 'réessayez dans un instant.'}`;
  }

  return null;
}
