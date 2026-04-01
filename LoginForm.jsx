import { useState } from 'react';
import InputField from './InputField';
import { apiClient } from '../../services/apiClient';
import { extractErrors } from '../../utils/apiErrorHelpers';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, PENDING, APPROUVÉ, REJETÉ
  const [requestId, setRequestId] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const validatePassword = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Adresse email invalide.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setStatus('PENDING');

    try {
      // Appel API pour soumettre la demande de connexion
      const { data } = await apiClient.post('/api/auth/login/', { email, password });

      setRequestId(data.requestId);
      setStatus('PENDING');
      setAdminMessage('Votre demande de connexion est en attente d'approbation...');
      
    } catch (err) {
      setStatus('REJETÉ');
      if (err.response?.status === 401) {
        setError('Email ou mot de passe incorrect.');
        setAdminMessage('Credentials invalides');
      } else {
        const extracted = extractErrors(err);
        if (extracted.submit) {
          setError(extracted.submit);
          setAdminMessage(extracted.submit);
        } else {
          setError('Erreur lors de la connexion. Veuillez réessayer.');
          setAdminMessage('Erreur système');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/api/auth/approve/', { requestId });
      setStatus('APPROUVÉ');
      onLogin?.(data.access);
    } catch (err) {
      setError('Erreur lors de l\'approbation.');
      setStatus('REJETÉ');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await apiClient.post('/api/auth/reject/', { requestId });
      setStatus('REJETÉ');
      setAdminMessage('Votre demande a été rejetée.');
    } catch (err) {
      setError('Erreur lors du rejet.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setError('');
    setStatus('IDLE');
    setRequestId(null);
    setAdminMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {/* État IDLE: Formulaire de connexion */}
      {status === 'IDLE' && (
        <>
          <InputField
            label="Adresse email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            required
          />
          <InputField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            required
          />

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </>
      )}

      {/* État PENDING: Attente d'approbation */}
      {status === 'PENDING' && (
        <div className="status-container pending">
          <div className="status-icon">⏳</div>
          <h3>Demande en attente</h3>
          <p className="admin-message">{adminMessage}</p>
          <div className="request-info">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>ID Demande:</strong> {requestId}</p>
          </div>
          <div className="admin-actions">
            <button 
              type="button"
              className="button button-approve" 
              onClick={handleApprove}
              disabled={loading}
            >
              ✓ Approuver
            </button>
            <button 
              type="button"
              className="button button-reject" 
              onClick={handleReject}
              disabled={loading}
            >
              ✗ Rejeter
            </button>
          </div>
          <button 
            type="button"
            className="button button-secondary" 
            onClick={handleReset}
          >
            Annuler
          </button>
        </div>
      )}

      {/* État APPROUVÉ: Connexion acceptée */}
      {status === 'APPROUVÉ' && (
        <div className="status-container approved">
          <div className="status-icon">✓</div>
          <h3>Connexion approuvée!</h3>
          <p className="success-message">Bienvenue {email}</p>
          <button 
            type="button"
            className="button button-secondary" 
            onClick={handleReset}
          >
            Nouvelle connexion
          </button>
        </div>
      )}

      {/* État REJETÉ: Connexion refusée */}
      {status === 'REJETÉ' && (
        <div className="status-container rejected">
          <div className="status-icon">✗</div>
          <h3>Connexion rejetée</h3>
          <p className="error-message">{adminMessage || 'Votre demande a été rejetée.'}</p>
          <button 
            type="button"
            className="button button-secondary" 
            onClick={handleReset}
          >
            Réessayer
          </button>
        </div>
      )}
    </form>
  );
}

export default LoginForm;