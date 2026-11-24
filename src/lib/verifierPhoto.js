const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TAILLE_MAX = 5 * 1024 * 1024;
const DIMENSION_MIN = 200;

export const EXTENSIONS_PHOTO = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function lireDimensions(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({ largeur: image.naturalWidth, hauteur: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

// Retourne un message d'erreur, ou null si la photo convient.
export async function verifierPhoto(fichier) {
  if (!TYPES.includes(fichier.type)) {
    return 'Format non accepté. Utilisez une image JPG, PNG ou WebP.';
  }
  if (fichier.size > TAILLE_MAX) {
    return 'La photo est trop lourde (5 Mo maximum).';
  }

  const url = URL.createObjectURL(fichier);
  const dimensions = await lireDimensions(url);
  URL.revokeObjectURL(url);

  if (!dimensions) return 'Cette image est illisible. Essayez un autre fichier.';
  if (Math.min(dimensions.largeur, dimensions.hauteur) < DIMENSION_MIN) {
    return `La photo est trop petite (${DIMENSION_MIN} × ${DIMENSION_MIN} pixels minimum).`;
  }
  return null;
}
