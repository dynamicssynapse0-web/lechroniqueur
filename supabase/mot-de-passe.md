# Réinitialisation du mot de passe

Le parcours est maintenant réel :

1. `/mot-de-passe-oublie` appelle `supabase.auth.resetPasswordForEmail()`.
2. Supabase envoie un email avec un `token_hash`.
3. `/auth/confirmation` vérifie le lien, crée la session et redirige vers `/nouveau-mot-de-passe`.
4. `/nouveau-mot-de-passe` appelle `supabase.auth.updateUser({ password })`.

## Configuration Supabase à vérifier

### 1. URL du site

Dans **Authentication → URL Configuration** :

- **Site URL** : `https://lechroniqueur.com`
- **Redirect URLs** : ajouter
  - `https://lechroniqueur.com/nouveau-mot-de-passe`
  - `http://localhost:3000/nouveau-mot-de-passe` pour les tests locaux

### 2. Template d’email de récupération

Dans **Authentication → Email Templates → Recovery**, remplacer le contenu par :

```html
<h2>Réinitialisation du mot de passe</h2>

<p>Nous avons reçu une demande de réinitialisation du mot de passe de votre compte lechroniqueur.</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirmation?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
    Choisir un nouveau mot de passe
  </a>
</p>

<p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
```

Sans ce template, le lien envoyé par défaut ne passe pas par `/auth/confirmation` et la session ne sera pas créée.

### 3. Envoi des emails

Le service email intégré à Supabase fonctionne mais est limité (best effort). Pour la production, configurez un **SMTP personnalisé** dans **Authentication → SMTP Settings**. Resend fournit un SMTP utilisable avec la même clé que `RESEND_API_KEY`.

## Test

1. Ouvrir `/mot-de-passe-oublie`, saisir une adresse de compte existante.
2. Recevoir l’email, cliquer sur le lien.
3. Vous devez arriver sur `/nouveau-mot-de-passe` avec le formulaire actif.
4. Choisir un mot de passe d’au moins 8 caractères, enregistrer.
5. Se connecter avec le nouveau mot de passe.

Si le message « lien invalide ou expiré » apparaît, le template d’email ou la `Site URL` n’est pas correcte.
