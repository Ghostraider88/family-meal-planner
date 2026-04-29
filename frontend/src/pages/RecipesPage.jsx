import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from './RecipesPage.module.css';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    time_minutes: '',
    servings: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const data = await api.get('/recipes');
      setRecipes(data || []);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recipes', formData);
      fetchRecipes();
      setShowForm(false);
      setFormData({ name: '', time_minutes: '', servings: '', difficulty: 'medium' });
    } catch (err) {
      console.error('Failed to create recipe:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Rezept löschen?')) return;
    try {
      await api.delete(`/recipes/${id}`);
      fetchRecipes();
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🍳 Rezepte</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Abbrechen' : '+ Rezept'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Rezeptname</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Pasta Carbonara"
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="time_minutes">Zeit (Minuten)</label>
              <input
                id="time_minutes"
                type="number"
                value={formData.time_minutes}
                onChange={(e) => setFormData({ ...formData, time_minutes: e.target.value })}
                placeholder="30"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="servings">Portionen</label>
              <input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                placeholder="4"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="difficulty">Schwierigkeit</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="easy">Einfach</option>
                <option value="medium">Mittel</option>
                <option value="hard">Schwer</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Speichern
          </button>
        </form>
      )}

      <div className={styles.recipesList}>
        {loading ? (
          <p>Lädt...</p>
        ) : recipes.length === 0 ? (
          <p className={styles.empty}>Keine Rezepte vorhanden</p>
        ) : (
          <div className={styles.grid}>
            {recipes.map((recipe) => (
              <div key={recipe.id} className={styles.recipeCard}>
                <div className={styles.cardContent}>
                  <h3>{recipe.name}</h3>
                  <div className={styles.metadata}>
                    {recipe.time_minutes && (
                      <span className={styles.tag}>⏱️ {recipe.time_minutes} min</span>
                    )}
                    {recipe.servings && (
                      <span className={styles.tag}>👥 {recipe.servings}</span>
                    )}
                    {recipe.difficulty && (
                      <span className={styles.tag}>
                        {recipe.difficulty === 'easy' ? '⭐' : recipe.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(recipe.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
