export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    "Vous avez refusé l'accès. Veuillez réessayer et accepter les permissions.",
  invalid_request:
    "La demande d'authentification est invalide. Veuillez réessayer.",
  unauthorized_client:
    "L'application n'est pas autorisée. Contactez le support.",
  invalid_scope: 'Les permissions demandées sont invalides.',
  server_error: 'Erreur du serveur Google. Veuillez réessayer plus tard.',
  temporarily_unavailable:
    'Le service est temporairement indisponible. Réessayez dans quelques instants.',
};

// URL for authorization request (GOOGLE)
export const GOOGLE_AUTHORIZE_REQUEST_URL =
  'https://accounts.google.com/o/oauth2/v2/auth' as const;

// URL for token request (GOOGLE)
export const GOOGLE_TOKEN_REQUEST_URL =
  'https://oauth2.googleapis.com/token' as const;

export const GOOGLE_SCOPES: string[] = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
] as const;

export const GOOGLE_USERINFO_REQUEST_URL =
  'https://www.googleapis.com/oauth2/v3/userinfo' as const;
