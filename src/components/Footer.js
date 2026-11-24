import Link from 'next/link';
import './footer.css';

export default function Footer() {
  return (
    <footer className="pied">
      <nav aria-label="Informations" className="pied-liens">
        <ul>
          <li><Link href="/a-propos">À propos</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/mentions-legales">Mentions légales</Link></li>
          <li><Link href="/confidentialite">Confidentialité</Link></li>
          <li><Link href="/conditions">Conditions d’utilisation</Link></li>
        </ul>
      </nav>
      <p>© {new Date().getFullYear()} lechroniqueur, la plateforme des journalistes</p>
    </footer>
  );
}
