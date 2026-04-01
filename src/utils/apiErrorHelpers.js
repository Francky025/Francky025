export const extractErrors = (error) => {
  const extracted = {
    submit: null,
    field: {},
  };

  if (!error.response) {
    extracted.submit = 'Erreur réseau. Veuillez vérifier votre connexion.';
    return extracted;
  }

  const { status, data } = error.response;

  // Erreur 400: Validation ou erreur client
  if (status === 400) {
    if (data.errors && typeof data.errors === 'object') {
      // Erreurs par champ
      Object.keys(data.errors).forEach((field) => {
        extracted.field[field] = data.errors[field];
      });
    }
    extracted.submit = data.message || 'Erreur de validation. Veuillez vérifier vos données.';
  }

  // Erreur 401: Non authentifié
  if (status === 401) {
    extracted.submit = 'Email ou mot de passe incorrect.';
  }

  // Erreur 403: Non autorisé
  if (status === 403) {
    extracted.submit = 'Vous n\'avez pas les permissions nécessaires.';
  }

  // Erreur 404: Non trouvé
  if (status === 404) {
    extracted.submit = 'La ressource demandée n\'existe pas.';
  }

  // Erreur 500+: Serveur
  if (status >= 500) {
    extracted.submit = 'Erreur serveur. Veuillez réessayer plus tard.';
  }

  return extracted;
};

export const getFieldError = (error, fieldName) => {
  if (error?.field && error.field[fieldName]) {
    return error.field[fieldName];
  }
  return null;
};