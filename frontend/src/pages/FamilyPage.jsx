import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import InviteModal from '../components/InviteModal';
import '../styles/family.css';

const FamilyPage = () => {
  const { token, user } = useContext(AuthContext);
  const { notification, showSuccess, showError } = useNotification();
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch('/api/users/family/members', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/users/family/invites', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());
      if (invitesRes.ok) setPendingInvites(await invitesRes.json());
    } catch (err) {
      showError('Fehler beim Laden der Familie');
    }
  };

  const handleInvite = async (email) => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/family/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      showSuccess('Einladung gesendet!');
      setIsModalOpen(false);
      fetchFamilyData();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Wirklich entfernen?')) return;

    try {
      const res = await fetch(`/api/users/family/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to remove');
      showSuccess('Mitglied entfernt');
      fetchFamilyData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      const res = await fetch(`/api/users/family/invites/${inviteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to cancel');
      showSuccess('Einladung storniert');
      fetchFamilyData();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="family-page">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="page-header">
        <h1>👨‍👩‍👧‍👦 Meine Familie</h1>
        <Link to="/dashboard" className="btn-back">← Zurück</Link>
      </header>

      <div className="container">
        <section className="family-section">
          <div className="section-header">
            <h2>Familienmitglieder ({members.length})</h2>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              + Einladen
            </button>
          </div>

          {members.length === 0 ? (
            <p className="empty">Noch keine Mitglieder. Lade jemanden ein!</p>
          ) : (
            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p>{member.email}</p>
                    {member.role === 'owner' && <span className="badge owner">Owner</span>}
                    {member.role === 'member' && <span className="badge member">Member</span>}
                  </div>
                  {user?.id !== member.id && user?.role === 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="btn-danger"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {pendingInvites.length > 0 && (
          <section className="family-section">
            <h2>Ausstehende Einladungen ({pendingInvites.length})</h2>
            <div className="invites-list">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="invite-card">
                  <div className="invite-info">
                    <p className="invite-email">{invite.invited_email}</p>
                    <p className="invite-meta">
                      Eingeladen von {invite.InvitedBy?.name} • Ausstehend
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="btn-link"
                  >
                    Stornieren
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvite={handleInvite}
        loading={loading}
      />
    </div>
  );
};

export default FamilyPage;
