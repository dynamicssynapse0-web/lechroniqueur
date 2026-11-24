'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { creerClientNavigateur } from '../lib/supabase/client';
import { destinationApresConnexion } from '../lib/destination';
import './header-statut.css';
import './header-menu.css';

const liens = [
  { href: '/journalistes', texte: 'Journalistes' },
  { href: '/a-propos', texte: 'À propos' },
];

const LIBELLES_STATUT = {
  email_a_confirmer: 'Email à confirmer',
  en_attente: 'Vérification en cours',
  accepte: 'Demande acceptée',
  refuse: 'Demande refusée',
};

export default function Header({ rubriques = [] }) {
  const [ouvert, setOuvert] = useState(false);
  const [menuArticlesOuvert, setMenuArticlesOuvert] = useState(false);
  const [moi, setMoi] = useState(null);
  const utilisateur = useRef(null);
  const dernierStatut = useRef(null);
  const menuArticles = useRef(null);
  const chemin = usePathname();
  const router = useRouter();

  const estActif = (href) =>
    href === '/' ? chemin === '/' : chemin.startsWith(href);

  useEffect(() => {
    const surTouche = (e) => {
      if (e.key === 'Escape') {
        setOuvert(false);
        setMenuArticlesOuvert(false);
      }
    };
    const horsMenu = (e) => {
      if (menuArticles.current && !menuArticles.current.contains(e.target)) {
        setMenuArticlesOuvert(false);
      }
    };
    document.addEventListener('keydown', surTouche);
    document.addEventListener('pointerdown', horsMenu);
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.removeEventListener('pointerdown', horsMenu);
    };
  }, []);

  useEffect(() => {
    const supabase = creerClientNavigateur();
    let vivant = true;

    async function charger() {
      const id = utilisateur.current;
      if (!id) {
        dernierStatut.current = null;
        if (vivant) setMoi(null);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('prenom, role, statut')
        .eq('id', id)
        .maybeSingle();
      if (!vivant) return;

      const profil = data ?? { prenom: '', role: 'journaliste', statut: 'en_attente' };
      const avant = dernierStatut.current;
      dernierStatut.current = profil.statut;
      setMoi(profil);

      // Le statut vient de changer : on actualise la page affichée.
      if (avant && avant !== profil.statut) router.refresh();
    }

    // Tant que le compte n'est pas actif, on surveille le statut.
    function surveiller() {
      if (document.visibilityState !== 'visible') return;
      if (!utilisateur.current) return;
      if (dernierStatut.current === 'actif') return;
      charger();
    }

    supabase.auth.getSession().then(({ data }) => {
      utilisateur.current = data.session?.user.id ?? null;
      charger();
    });

    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, session) => {
      utilisateur.current = session?.user.id ?? null;
      setTimeout(charger, 0);
    });

    const minuteur = setInterval(surveiller, 30000);
    document.addEventListener('visibilitychange', surveiller);

    return () => {
      vivant = false;
      clearInterval(minuteur);
      document.removeEventListener('visibilitychange', surveiller);
      abonnement.subscription.unsubscribe();
    };
  }, [router]);

  async function deconnecter() {
    const supabase = creerClientNavigateur();
    await supabase.auth.signOut();
    setMoi(null);
    setOuvert(false);
    setMenuArticlesOuvert(false);
    router.push('/');
    router.refresh();
  }

  const enCours = moi && moi.role !== 'admin' && moi.statut !== 'actif';
  const groupeArticlesActif = chemin.startsWith('/rubrique');

  return (
    <header className="entete">
      <div className="conteneur entete-interne">
        <div className="entete-barre">
          <Link href="/" className="logo">le<span>chroniqueur</span></Link>
          <button
            type="button"
            className="burger"
            aria-expanded={ouvert}
            aria-controls="navigation"
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOuvert(!ouvert)}
          >
            <span aria-hidden="true">{ouvert ? '✕' : '☰'}</span>
          </button>
        </div>

        <div
          id="navigation"
          className={ouvert ? 'navigation ouvert' : 'navigation'}
          onClick={(e) => {
            if (e.target.closest('a')) {
              setOuvert(false);
              setMenuArticlesOuvert(false);
            }
          }}
        >
          <nav className="menu" aria-label="Navigation principale">
            <Link
              href="/"
              aria-current={estActif('/') ? 'page' : undefined}
            >
              Accueil
            </Link>

            <div
              ref={menuArticles}
              className={[
                'menu-groupe',
                groupeArticlesActif ? 'actif' : '',
                menuArticlesOuvert ? 'ouvert' : '',
              ].filter(Boolean).join(' ')}
            >
              <button
                type="button"
                className="menu-articles"
                aria-haspopup="true"
                aria-expanded={menuArticlesOuvert}
                aria-controls="sous-menu-articles"
                onClick={() => setMenuArticlesOuvert((v) => !v)}
              >
                Articles
              </button>

              <div id="sous-menu-articles" className="sous-menu-articles">
                <Link href="/#articles">Tous les articles</Link>
                {rubriques.map((r) => (
                  <Link key={r.slug} href={`/rubrique/${r.slug}`}>
                    {r.nom}
                  </Link>
                ))}
              </div>
            </div>

            {liens.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                aria-current={estActif(lien.href) ? 'page' : undefined}
              >
                {lien.texte}
              </Link>
            ))}
          </nav>

          <div className="acces">
            {moi ? (
              <>
                {enCours && LIBELLES_STATUT[moi.statut] && (
                  <Link
                    href={destinationApresConnexion(moi)}
                    className="pastille-statut"
                    data-statut={moi.statut}
                    aria-live="polite"
                  >
                    {LIBELLES_STATUT[moi.statut]}
                  </Link>
                )}
                {moi.role === 'admin' && (
                  <Link href="/admin" className="lien-bouton">
                    Administration
                  </Link>
                )}
                <button type="button" className="lien-bouton" onClick={deconnecter}>
                  Se déconnecter
                </button>
                <Link
                  href={moi.role === 'admin' ? '/espace' : destinationApresConnexion(moi)}
                  className="bouton"
                >
                  {moi.role === 'admin' ? 'Mon espace / Publier' : 'Mon espace'}
                </Link>
              </>
            ) : (
              <>
                <Link href="/connexion">Se connecter</Link>
                <Link href="/inscription" className="bouton">Devenir journaliste</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
