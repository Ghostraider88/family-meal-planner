import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MealEditor from '../components/MealEditor';

const MealPlanner = () => {
  const { token } = useContext(AuthContext);
  const [meals, setMeals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchMeals();
    fetchRecipes();
  }, [weekStart]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/meals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMeal = async (mealData) => {
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });
      if (!res.ok) throw new Error('Failed to add meal');
      const newMeal = await res.json();
      setMeals([...meals, newMeal]);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete meal');
      setMeals(meals.filter(m => m.id !== mealId));
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const prevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(getMonday(prev));
  };

  const nextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(getMonday(next));
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
  const mealTypeLabels = {
    breakfast: '🌅 Frühstück',
    lunch: '🍽️ Mittagessen',
    snack: '🍿 Snack',
    dinner: '🌙 Abendessen',
  };

  const getMealForSlot = (date, mealType) => {
    const dateStr = formatDate(date);
    return meals.find(m => m.date === dateStr && m.meal_type === mealType);
  };

  const getRecipeName = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe ? recipe.name : '?';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>← Zurück</Link>
        <h1 style={styles.title}>📅 Wochenplan</h1>
      </header>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Week Selector */}
        <div style={styles.weekSelector}>
          <button onClick={prevWeek} style={styles.navBtn}>←</button>
          <div style={styles.weekLabel}>
            <div>KW {getWeekNumber(weekStart)}</div>
            <div style={styles.dateRange}>
              {weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - {weekEnd.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </div>
          </div>
          <button onClick={nextWeek} style={styles.navBtn}>→</button>
        </div>

        {loading ? (
          <p style={styles.loading}>Lädt...</p>
        ) : (
          <div style={styles.weekGrid}>
            {days.map((date) => (
              <div key={formatDate(date)} style={styles.dayCard}>
                <div style={styles.dayHeader}>
                  <div style={styles.dayName}>
                    {date.toLocaleDateString('de-DE', { weekday: 'short' })}
                  </div>
                  <div style={styles.dayDate}>
                    {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>

                <div style={styles.mealSlots}>
                  {mealTypes.map((mealType) => {
                    const meal = getMealForSlot(date, mealType);
                    return (
                      <div
                        key={`${formatDate(date)}-${mealType}`}
                        style={{
                          ...styles.mealSlot,
                          ...(meal ? styles.mealSlotFilled : styles.mealSlotEmpty),
                        }}
                        onClick={() => setSelectedSlot({ date: formatDate(date), mealType })}
                      >
                        <div style={styles.mealTypeLabel}>{mealTypeLabels[mealType].split(' ')[0]}</div>
                        {meal ? (
                          <div style={styles.mealContent}>
                            <div style={styles.mealName}>
                              {meal.custom_name || getRecipeName(meal.recipe_id)}
                            </div>
                            {meal.for_people && (
                              <div style={styles.mealPeople}>{meal.for_people}</div>
                            )}
                            <button
                              style={styles.deleteBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMeal(meal.id);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={styles.addPlaceholder}>+ Hinzufügen</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSlot && (
        <MealEditor
          date={selectedSlot.date}
          mealType={selectedSlot.mealType}
          recipes={recipes}
          onSave={handleAddMeal}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const diff = d - yearStart;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#F0F2F9',
  },
  header: {
    padding: '16px',
    backgroundColor: '#00C5FF',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  backLink: {
    color: 'white',
    textDecoration: 'none',
    marginBottom: '8px',
    display: 'inline-block',
    fontSize: '14px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
  },
  error: {
    backgroundColor: '#FF0048',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#8B91A3',
  },
  weekSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  navBtn: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.2s',
  },
  weekLabel: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
    fontSize: '16px',
  },
  dateRange: {
    fontSize: '12px',
    color: '#8B91A3',
    marginTop: '4px',
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '12px',
    fontWeight: 'bold',
    color: '#000',
  },
  dayName: {
    fontSize: '16px',
  },
  dayDate: {
    fontSize: '12px',
    color: '#8B91A3',
  },
  mealSlots: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
  },
  mealSlot: {
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '44px',
    position: 'relative',
  },
  mealSlotFilled: {
    backgroundColor: '#D4EDFC',
    border: '1px solid #00C5FF',
  },
  mealSlotEmpty: {
    backgroundColor: '#F0F2F9',
    border: '1px dashed #B2B7C7',
  },
  mealTypeLabel: {
    fontSize: '14px',
    minWidth: '24px',
    fontWeight: 'bold',
    color: '#00C5FF',
  },
  mealContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mealName: {
    flex: 1,
    fontSize: '14px',
    color: '#000',
    fontWeight: '500',
  },
  mealPeople: {
    fontSize: '11px',
    backgroundColor: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#8B91A3',
  },
  addPlaceholder: {
    flex: 1,
    fontSize: '14px',
    color: '#B2B7C7',
    fontStyle: 'italic',
  },
  deleteBtn: {
    backgroundColor: '#FF0048',
    color: 'white',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'background 0.2s',
  },
};

export default MealPlanner;
