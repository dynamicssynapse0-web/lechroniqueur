# Notifications de décision (email + WhatsApp)

Lorsque l’administrateur accepte ou refuse une demande (`AdminDemandes.js`), le site appelle
`POST /api/notifier-decision`. Le handler vérifie que l’appelant est admin, lit le profil et
envoie :

1. un **email** via Resend ;
2. un **message WhatsApp** via le Cloud API Meta, au numéro fourni à l’inscription,
   uniquement si la case de consentement a été cochée.

Si WhatsApp échoue (templates pas encore approuvés, numéro invalide, identifiants absents),
l’email part quand même et l’administrateur voit « WhatsApp indisponible » dans le message
de confirmation. Le refus ou l’acceptation est **jamais** bloqué par un problème de notification.

## 1. Variables à renseigner

Dans `.env.local` en local, et dans les variables d’environnement Vercel en production
(voir `.env.example`) :

| Variable | Rôle |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | relire `telephone` et `whatsapp_consent` dans `auth.users` |
| `RESEND_API_KEY` | envoi des emails |
| `EMAIL_FROM` | expéditeur vérifié dans Resend |
| `WHATSAPP_TOKEN` | token permanent Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | identifiant du numéro Business dans Meta |
| `WHATSAPP_API_VERSION` | optionnel, `v25.0` par défaut |

`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sont déjà présents.

## 2. Mise en place WhatsApp Cloud API

1. Dans [Meta Business Suite](https://business.facebook.com), créer/vérifier l’entreprise.
2. Aller dans **WhatsApp → Configuration du numéro** et ajouter le numéro Business.
   Un numéro utilisé dans l’application WhatsApp Business doit être migré vers l’API :
   il ne peut pas servir dans les deux en même temps.
3. Récupérer le **Phone number ID** et générer un **token d’accès permanent**.
4. Créer deux modèles (`Templates`) en français, catégorie *Utility*, et attendre leur
   approbation :

### `demande_acceptee`

> Bonjour {{prenom}}, votre demande de journaliste sur lechroniqueur a été acceptée.
> Complétez votre profil pour commencer à publier : https://lechroniqueur.com/profil

### `demande_refusee`

> Bonjour {{prenom}}, votre demande de journaliste sur lechroniqueur n’a pas été acceptée.
> Motif : {{motif}}. Vous pouvez envoyer une nouvelle carte de presse : https://lechroniqueur.com/suivi

Variables : `{{prenom}}` = prénom, `{{motif}}` = motif du refus. Langue du modèle : `fr`.
Meta exige des variables nommées en minuscules : pas de `{{1}}` / `{{2}}`.

Le code envoie ces modèles avec `language.code = "fr"` et chaque valeur avec son
`parameter_name` (`prenom`, `motif`).
Tant que les modèles ne sont pas approuvés, Meta renvoie une erreur : l’email continue de
fonctionner et l’interface affiche « WhatsApp indisponible ».

## 3. Mise en place Resend

1. Créer un compte sur [resend.com](https://resend.com) et vérifier un domaine d’envoi.
2. Mettre `RESEND_API_KEY` et `EMAIL_FROM` (par exemple
   `lechroniqueur <notification@lechroniqueur.com>`).
3. Sans clé Resend, le handler répond `email non envoyé` sans bloquer la décision.

## 4. Vérification

- Faire une inscription de test avec un numéro `+237...` valide et cocher le consentement.
- Vérifier dans Supabase → Authentication → Users → *User metadata* que `telephone`
  et `whatsapp_consent` sont présents.
- Refuser puis accepter la demande depuis `/admin` : la confirmation doit indiquer
  « email envoyé » et, une fois les templates approuvés, « WhatsApp envoyé ».
- Si l’erreur « La création du profil a échoué côté base de données » apparaît à
  l’inscription, exécuter `supabase/fix-inscription.sql` dans le SQL Editor.
