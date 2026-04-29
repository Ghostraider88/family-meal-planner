import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [meals, setMeals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = getGreeting();
  const weekInfo = getWeekInfo();
  const weekStart = getWeekStart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...');
        const [mealsRes, recipesRes, shoppingRes] = await Promise.all([
          api.get(`/meals?weekStart=${weekStart}`),
          api.get('/recipes'),
          api.get('/shopping/lists'),
        ]);
        console.log('Dashboard data loaded:', { meals: mealsRes?.length, recipes: recipesRes?.length, lists: shoppingRes?.length });
        setMeals(mealsRes || []);
        setRecipes(recipesRes || []);
        setShoppingLists(shoppingRes || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err.message, err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTodayMeals = () => {
    const today = new Date().toISOString().split('T')[0];
    return meals.filter((m) => m.date === today);
  };

  const getMealsForDay = (day) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 1 + day);
    const dateStr = date.toISOString().split('T')[0];
    return meals.filter((m) => m.date === dateStr);
  };

  if (loading) {
    return <div className={styles.dashboard}><p>Lädt...</p></div>;
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.greeting}>
        <h1>{greeting} 👋</h1>
        <p>{weekInfo}</p>
      </section>

      <section className={styles.todayStrip}>
        <h2>Heute · {getTodayLabel()}</h2>
        <div className={styles.mealsList}>
          {getTodayMeals().length > 0 ? (
            getTodayMeals().map((meal) => (
              <div key={meal.id} className={styles.mealItem}>
                <span className={styles.mealType}>{formatMealType(meal.meal_type)}</span>
                <span className={styles.mealName}>{meal.custom_name || 'Mahlzeit'}</span>
              </div>
            ))
          ) : (
            <div className={styles.mealItem}>
              <span className={styles.mealType}>Frühstück</span>
              <span className={styles.mealName}>Keine Mahlzeit geplant</span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.actions}>
        <h2>Schnellaktionen</h2>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard} onClick={() => navigate('/meals')}>
            <div className={styles.icon} style={{ background: 'var(--primary-bg)' }}>📅</div>
            <div className={styles.label}>Planer</div>
            <div className={styles.count}>{meals.length} Mahlzeiten</div>
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/recipes')}>
            <div className={styles.icon} style={{ background: 'var(--accent-bg)' }}>🍳</div>
            <div className={styles.label}>Rezepte</div>
            <div className={styles.count}>{recipes.length} Rezepte</div>
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/shopping')}>
            <div className={styles.icon} style={{ background: '#eef4ff' }}>🛒</div>
            <div className={styles.label}>Einkaufsliste</div>
            <div className={styles.count}>{shoppingLists.length} Listen</div>
          </button>
          <button className={styles.actionCard}>
            <div className={styles.icon} style={{ background: '#f3eeff' }}>📥</div>
            <div className={styles.label}>Importieren</div>
            <div className={styles.count}>PDF-Upload</div>
          </button>
        </div>
      </section>

      <section className={styles.week}>
        <div className={styles.weekHeader}>
          <h2>Diese Woche</h2>
          <a href="#" className={styles.seeAll} onClick={(e) => { e.preventDefault(); navigate('/meals'); }}>Alle →</a>
        </div>
        <div className={styles.daysList}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const dayMeals = getMealsForDay(day);
            return (
              <div key={day} className={styles.dayRow}>
                <div className={styles.dayInfo}>
                  <div className={styles.dayName}>{getDayName(day)}</div>
                  <div className={styles.dayDate}>{getDayDate(day)}</div>
                </div>
                <div className={styles.mealPreview}>
                  {dayMeals.length > 0 ? (
                    <span>{dayMeals.length} Mahlzeit{dayMeals.length > 1 ? 'en' : ''}</span>
                  ) : (
                    <em>Keine Mahlzeiten</em>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Guten Morgen';
  if (hour < 18) return 'Guten Nachmittag';
  return 'Guten Abend';
}

function getWeekInfo() {
  const now = new Date();
  const week = Math.ceil((now.getDate() - now.getDay() + 1) / 7);
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const monthStart = start.toLocaleDateString('de-DE', { month: 'numeric', day: 'numeric' });
  const monthEnd = end.toLocaleDateString('de-DE', { month: 'numeric', day: 'numeric', year: 'numeric' });

  return `KW ${week} · ${monthStart} – ${monthEnd}`;
}

function getTodayLabel() {
  const now = new Date();
  const day = now.toLocaleDateString('de-DE', { weekday: 'long' });
  const date = now.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  return `${day}, ${date}`;
}

function getWeekStart() {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1);
  return date.toISOString().split('T')[0];
}

function getDayName(offset) {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1 + offset);
  return date.toLocaleDateString('de-DE', { weekday: 'short' });
}

function getDayDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1 + offset);
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
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
