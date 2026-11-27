import { creerClientServeur } from '../../../lib/supabase/serveur';
import { creerClientAdmin } from '../../../lib/supabase/admin';
import { normaliserTelephone, telephoneWhatsapp } from '../../../lib/telephone';
import { SITE_URL } from '../../../lib/site-url';

// Envoyer la décision (acceptation ou refus) par email et, si l'utilisateur a
// consenti, sur le numéro WhatsApp fourni à l'inscription.
// Ce handler est public : l'identité de l'administrateur est vérifiée ci-dessous.

function echapper(valeur) {
  return String(valeur ?? '').replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caractere]);
}

function preparerMessage(prenom, statut, motif) {
  const accepte = statut === 'accepte';
  const motifAffiche = motif || 'Aucun motif indiqué.';

  const sujet = accepte
    ? 'Votre demande a été acceptée — lechroniqueur'
    : 'Votre demande n’a pas été acceptée — lechroniqueur';

  const texte = accepte
    ? `Bonjour ${prenom},\n\n` +
      `Votre carte de presse a été vérifiée et votre demande est acceptée.\n` +
      `Complétez votre profil pour commencer à publier : ${SITE_URL}/profil\n\n` +
      `L’équipe lechroniqueur`
    : `Bonjour ${prenom},\n\n` +
      `Votre demande n’a pas été acceptée.\n` +
      `Motif indiqué par l’équipe : ${motifAffiche}\n` +
      `Vous pouvez envoyer une nouvelle carte de presse depuis votre espace : ${SITE_URL}/suivi\n\n` +
      `L’équipe lechroniqueur`;

  const html = accepte
    ? `<p>Bonjour ${echapper(prenom)},</p>` +
      `<p>Votre carte de presse a été vérifiée et votre demande est acceptée.</p>` +
      `<p><a href="${SITE_URL}/profil">Compléter mon profil</a></p>`
    : `<p>Bonjour ${echapper(prenom)},</p>` +
      `<p>Votre demande n’a pas été acceptée.</p>` +
      `<p><strong>Motif indiqué par l’équipe :</strong> ${echapper(motifAffiche)}</p>` +
      `<p><a href="${SITE_URL}/suivi">Envoyer une nouvelle carte de presse</a></p>`;

  return { sujet, texte, html };
}

async function envoyerEmail(adresse, message) {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) return { ok: false, detail: 'Clé Resend absente' };
  if (!adresse) return { ok: false, detail: 'Adresse email absente' };

  try {
    const reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cle}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'lechroniqueur <onboarding@resend.dev>',
        to: [adresse],
        subject: message.sujet,
        text: message.texte,
        html: message.html,
      }),
    });
    const data = await reponse.json().catch(() => ({}));
    return reponse.ok
      ? { ok: true, id: data.id ?? null }
      : { ok: false, detail: data.message || `HTTP ${reponse.status}` };
  } catch (erreur) {
    return { ok: false, detail: erreur.message };
  }
}

async function envoyerWhatsapp({ telephone, consentement, prenom, statut, motif }) {
  if (!consentement) return { ok: false, detail: 'Consentement WhatsApp absent' };

  const numero = telephoneWhatsapp(normaliserTelephone(telephone));
  if (!numero) return { ok: false, detail: 'Numéro WhatsApp invalide' };

  const token = process.env.WHATSAPP_TOKEN;
  const identifiant = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !identifiant) {
    return { ok: false, detail: 'WhatsApp Cloud API non configurée' };
  }

  const accepte = statut === 'accepte';
  // Meta exige désormais des variables nommées ({{prenom}}, {{motif}}) et non
  // plus des variables positionnelles ({{1}}, {{2}}). Chaque valeur est donc
  // envoyée avec son parameter_name.
  const parametres = accepte
    ? [{ type: 'text', parameter_name: 'prenom', text: prenom || '' }]
    : [
        { type: 'text', parameter_name: 'prenom', text: prenom || '' },
        {
          type: 'text',
          parameter_name: 'motif',
          text: motif || 'Aucun motif indiqué.',
        },
      ];

  const version = process.env.WHATSAPP_API_VERSION || 'v25.0';

  try {
    const reponse = await fetch(
      `https://graph.facebook.com/${version}/${identifiant}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: numero,
          type: 'template',
          template: {
            name: accepte ? 'demande_acceptee' : 'demande_refusee',
            language: { code: 'fr' },
            components: [{ type: 'body', parameters: parametres }],
          },
        }),
      }
    );
    const data = await reponse.json().catch(() => ({}));
    return reponse.ok
      ? { ok: true, id: data.messages?.[0]?.id ?? null }
      : { ok: false, detail: data.error?.message || `HTTP ${reponse.status}` };
  } catch (erreur) {
    return { ok: false, detail: erreur.message };
  }
}

export async function POST(request) {
  let corps;
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: 'Requête invalide' }, { status: 400 });
  }

  const { id, statut } = corps ?? {};
  if (
    typeof id !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(id) ||
    !['accepte', 'refuse'].includes(statut)
  ) {
    return Response.json({ erreur: 'Paramètres invalides' }, { status: 400 });
  }

  // Vérification de l'administrateur, côté serveur, indépendamment du client.
  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const administrateurId = session?.claims?.sub;
  if (!administrateurId) {
    return Response.json({ erreur: 'Non connecté' }, { status: 401 });
  }

  const { data: moi } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', administrateurId)
    .maybeSingle();
  if (moi?.role !== 'admin') {
    return Response.json({ erreur: 'Accès refusé' }, { status: 403 });
  }

  const { data: profil } = await supabase
    .from('profiles')
    .select('prenom, email, motif_refus')
    .eq('id', id)
    .maybeSingle();
  if (!profil) {
    return Response.json({ erreur: 'Demande introuvable' }, { status: 404 });
  }

  // Le numéro et le consentement sont enregistrés dans les métadonnées
  // d'inscription. Repli sur la colonne profiles.telephone si elle existe.
  const admin = creerClientAdmin();
  let telephone = null;
  let consentement = false;

  if (admin) {
    try {
      const { data } = await admin.auth.admin.getUserById(id);
      telephone = data?.user?.user_metadata?.telephone ?? null;
      consentement = Boolean(data?.user?.user_metadata?.whatsapp_consent);
    } catch {
      // Lecture impossible : on tente le repli ci-dessous.
    }
  }

  if (!telephone) {
    const { data } = await supabase
      .from('profiles')
      .select('telephone')
      .eq('id', id)
      .maybeSingle();
    telephone = data?.telephone ?? null;
  }

  const prenom = (profil.prenom || '').trim() || 'Bonjour';
  const motif = statut === 'refuse' ? (profil.motif_refus || '').trim() : '';
  const message = preparerMessage(prenom, statut, motif);

  const [email, whatsapp] = await Promise.all([
    envoyerEmail(profil.email, message),
    envoyerWhatsapp({ telephone, consentement, prenom, statut, motif }),
  ]);

  return Response.json({ email, whatsapp });
}
