import { useState } from 'react';
import '../styles/modal.css';

const InviteModal = ({ isOpen, onClose, onInvite, loading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Gültige E-Mail erforderlich');
      return;
    }

    try {
      await onInvite(email);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Fehler beim Senden der Einladung');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👨‍👩‍👧‍👦 Familienmitglied einladen</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="einladen@example.de"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Abbrechen
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Wird gesendet...' : 'Einladung senden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
