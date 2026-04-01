class APIErrorHandler {
  constructor() {
    this.errorMessages = {
      400: 'Requête invalide',
      401: 'Non authentifié',
      403: 'Accès refusé',
      404: 'Ressource non trouvée',
      408: 'Délai d\'attente dépassé',
      429: 'Trop de requêtes',
      500: 'Erreur serveur',
      503: 'Service indisponible',
      NETWORK_ERROR: 'Erreur de connexion réseau',
      TIMEOUT: 'Délai d\'attente dépassé',
      PARSE_ERROR: 'Erreur lors du traitement de la réponse'
    };

    this.errorHandlers = {};
    this.listeners = [];
  }

  registerHandler(errorType, handler) {
    this.errorHandlers[errorType] = handler;
  }

  handle(error) {
    const errorData = this.parseError(error);
    
    if (this.errorHandlers[errorData.type]) {
      this.errorHandlers[errorData.type](errorData);
    }

    this.notify(errorData);

    return errorData;
  }

  parseError(error) {
    if (error.response) {
      return {
        type: 'HTTP_ERROR',
        status: error.response.status,
        message: this.errorMessages[error.response.status] || 'Erreur HTTP',
        data: error.response.data,
        timestamp: new Date()
      };
    } else if (error.request) {
      return {
        type: 'NETWORK_ERROR',
        message: this.errorMessages.NETWORK_ERROR,
        timestamp: new Date()
      };
    } else if (error.code === 'ECONNABORTED') {
      return {
        type: 'TIMEOUT',
        message: this.errorMessages.TIMEOUT,
        timestamp: new Date()
      };
    } else {
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'Une erreur est survenue',
        timestamp: new Date()
      };
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(errorData) {
    this.listeners.forEach(listener => listener(errorData));
  }
}

export default APIErrorHandler;
