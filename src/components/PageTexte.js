import './page-texte.css';
import { SITE_INFOS, infosIncompletes } from '../lib/site';

export default function PageTexte({ titre, children }) {
  return (
    <article className="page-texte">
      <h1>{titre}</h1>
      <p className="maj">Dernière mise à jour : {SITE_INFOS.miseAJour}</p>

      {infosIncompletes() && (
        <p className="alerte-legale" role="note">
          <strong>Page non finalisée.</strong> Complétez les informations marquées
          « À COMPLÉTER » dans le fichier <code>src/lib/site.js</code> avant la mise en ligne.
        </p>
      )}

      {children}
    </article>
  );
}
