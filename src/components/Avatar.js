import './avatar.css';

// Photo de profil ronde, ou les initiales quand il n'y a pas de photo.
// Décorative : le nom de la personne est toujours écrit à côté.
export default function Avatar({ photoUrl = '', initiales = '?', taille = 'm' }) {
  return (
    <span className={`pdp pdp-${taille}`} aria-hidden="true">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" loading="lazy" />
      ) : (
        initiales
      )}
    </span>
  );
}
