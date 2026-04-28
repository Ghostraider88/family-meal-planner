import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍽️ Family Meal Planner</h1>
          <button onClick={handleLogout} className="btn-logout">Abmelden</button>
        </div>
        <p className="welcome">Willkommen, {user?.name}! 👋</p>
      </header>

      <div className="container">
        <section className="week-overview">
          <h2>Diese Woche (KW XX)</h2>
          <p className="text-secondary">Übersicht Ihrer Mahlzeiten für diese Woche</p>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/week" className="action-card">
              <span className="action-icon">📅</span>
              <h3>Wochenplan</h3>
              <p>Planen Sie Ihre Mahlzeiten</p>
            </Link>

            <Link to="/recipes" className="action-card">
              <span className="action-icon">🍳</span>
              <h3>Rezepte</h3>
              <p>Entdecken Sie Rezepte</p>
            </Link>

            <Link to="/shopping" className="action-card">
              <span className="action-icon">🛒</span>
              <h3>Einkauf</h3>
              <p>Einkaufslisten verwalten</p>
            </Link>

            <Link to="/family" className="action-card">
              <span className="action-icon">👨‍👩‍👧‍👦</span>
              <h3>Familie</h3>
              <p>Mitglieder verwalten</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
