// Normalise un numéro camerounais au format international E.164 (+237...).
// Accepte par exemple : 676978878, +237676978878, +237 67 69 78 878.
export function normaliserTelephone(saisie) {
  if (typeof saisie !== 'string') return null;

  let chiffres = saisie.replace(/[\s.\-()]/g, '');
  if (chiffres.startsWith('+')) chiffres = chiffres.slice(1);
  if (chiffres.startsWith('237')) chiffres = chiffres.slice(3);

  // Les numéros mobiles camerounais ont 9 chiffres après l'indicatif du pays.
  if (!/^[6-9]\d{8}$/.test(chiffres)) return null;
  return `+237${chiffres}`;
}

// L'API WhatsApp attend le numéro sans le signe « + ».
export function telephoneWhatsapp(e164) {
  return typeof e164 === 'string' ? e164.replace(/\D/g, '') : '';
}
