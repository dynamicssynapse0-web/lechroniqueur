// Renomme « MediaPress » en « lechroniqueur » dans tout le dossier src
// et renseigne les informations légales par défaut (src/lib/site.js).
//
// Utilisation, depuis le dossier du site (celui qui contient « src ») :
//   node renommer-lechroniqueur.mjs
//
// Le script peut être relancé sans risque.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const NOUVEAU_NOM = 'lechroniqueur';

const INFOS = {
  editeur: 'lechroniqueur',
  adresse: 'Paris, France',
  email: 'dynamicssynapse0@gmail.com',
};

const EXTENSIONS = new Set(['.js', '.css']);

const REMPLACEMENTS = [
  // Le logo : « le » en blanc, « chroniqueur » en rouge
  ['Media<span>Press</span>', 'le<span>chroniqueur</span>'],
  // Le nom partout ailleurs
  ['MediaPress', NOUVEAU_NOM],
  ['mediapress', NOUVEAU_NOM],
  // Initiale affichée quand un article n'a pas d'auteur
  ["initiales(j) : 'M'", "initiales(j) : 'L'"],
  ["initiales(auteur) : 'M'", "initiales(auteur) : 'L'"],
];

function lister(dossier) {
  const resultat = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) resultat.push(...lister(chemin));
    else if (EXTENSIONS.has(extname(entree.name))) resultat.push(chemin);
  }
  return resultat;
}

function remplacerLigne(texte, cle, valeur) {
  const motif = new RegExp(`^(\\s*${cle}:\\s*)'.*?'(,.*)$`, 'm');
  return texte.replace(motif, (_, avant, apres) => `${avant}'${valeur}'${apres}`);
}

const racine = 'src';
if (!existsSync(racine)) {
  console.error('Dossier « src » introuvable. Lancez ce script depuis le dossier du site.');
  process.exit(1);
}

let fichiersModifies = 0;
let remplacements = 0;

for (const fichier of lister(racine)) {
  const original = readFileSync(fichier, 'utf8');
  let texte = original;

  for (const [ancien, nouveau] of REMPLACEMENTS) {
    const morceaux = texte.split(ancien);
    if (morceaux.length > 1) {
      remplacements += morceaux.length - 1;
      texte = morceaux.join(nouveau);
    }
  }

  if (fichier.replaceAll('\\', '/').endsWith('src/lib/site.js')) {
    for (const [cle, valeur] of Object.entries(INFOS)) {
      texte = remplacerLigne(texte, cle, valeur);
    }
  }

  if (texte !== original) {
    writeFileSync(fichier, texte, 'utf8');
    fichiersModifies += 1;
    console.log('modifié :', fichier);
  }
}

console.log(`\nTerminé : ${fichiersModifies} fichier(s) modifié(s), ${remplacements} remplacement(s).`);
