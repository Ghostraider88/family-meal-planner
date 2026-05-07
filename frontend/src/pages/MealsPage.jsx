import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from './MealsPage.module.css';

export default function MealsPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: selectedDate,
    meal_type: 'breakfast',
    custom_name: '',
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const data = await api.get('/meals');
      setMeals(data || []);
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meals', formData);
      fetchMeals();
      setShowForm(false);
      setFormData({ date: selectedDate, meal_type: 'breakfast', custom_name: '' });
    } catch (err) {
      console.error('Failed to create meal:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Mahlzeit löschen?')) return;
    try {
      await api.delete(`/meals/${id}`);
      fetchMeals();
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  const mealsByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {});

  const dates = Object.keys(mealsByDate).sort();

  return (
    <div className={styles.container} style={{ minHeight: '100vh' }}>
      <div className={styles.header}>
        <h1>📅 Wochenplaner</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Abbrechen' : '+ Mahlzeit'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Datum</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="meal_type">Mahlzeittyp</label>
            <select
              id="meal_type"
              value={formData.meal_type}
              onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
            >
              <option value="breakfast">Frühstück</option>
              <option value="lunch">Mittag</option>
              <option value="snack">Snack</option>
              <option value="dinner">Abendessen</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="custom_name">Name (optional)</label>
            <input
              id="custom_name"
              type="text"
              value={formData.custom_name}
              onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
              placeholder="z.B. Pasta Carbonara"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Speichern
          </button>
        </form>
      )}

      <div className={styles.mealsList}>
        {loading ? (
          <p>Lädt...</p>
        ) : dates.length === 0 ? (
          <p className={styles.empty}>Keine Mahlzeiten geplant</p>
        ) : (
          dates.map((date) => (
            <div key={date} className={styles.dateGroup}>
              <h3>{formatDateLabel(date)}</h3>
              {mealsByDate[date].map((meal) => (
                <div key={meal.id} className={styles.mealCard}>
                  <div className={styles.mealInfo}>
                    <span className={styles.mealType}>{formatMealType(meal.meal_type)}</span>
                    <span className={styles.mealName}>{meal.custom_name || '(Keine Bezeichnung)'}</span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(meal.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatMealType(type) {
  const types = {
    breakfast: 'Frühstück',
    lunch: 'Mittag',
    snack: 'Snack',
    dinner: 'Abendessen',
  };
  return types[type] || type;
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
