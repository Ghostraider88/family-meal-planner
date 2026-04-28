import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MealPlanner = () => {
  const { token } = useContext(AuthContext);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const res = await fetch('/api/meals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 16px', minHeight: '100vh', backgroundColor: '#F0F2F9' }}>
      <Link to="/dashboard">← Zurück</Link>
      <h1>📅 Wochenplan</h1>
      {loading ? (
        <p>Lädt...</p>
      ) : (
        <>
          <p>Insgesamt {meals.length} Mahlzeiten geplant</p>
          <p style={{ color: '#8B91A3', marginTop: '20px' }}>Phase 1: Wochenplan anzeigen</p>
        </>
      )}
    </div>
  );
};

export default MealPlanner;
