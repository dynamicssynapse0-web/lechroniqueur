import './globals.css';
import './publics.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'lechroniqueur : la plateforme des journalistes',
    template: '%s | lechroniqueur',
  },
  description:
    'Lisez les articles de journalistes vérifiés et découvrez leur travail sur lechroniqueur.',
  openGraph: {
    type: 'website',
    siteName: 'lechroniqueur',
    locale: 'fr_FR',
    title: 'lechroniqueur : la plateforme des journalistes',
    description: 'Articles et annuaire de journalistes vérifiés.',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport = { themeColor: '#0b1733' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <a href="#contenu" className="lien-evitement">Aller au contenu</a>
        <Header />
        <main id="contenu" className="conteneur contenu">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
