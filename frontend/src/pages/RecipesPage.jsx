import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/recipes.css';

const RecipesPage = () => {
  const { token } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRecipe, setNewRecipe] = useState({ name: '', time_minutes: '', servings: '', difficulty: '' });

  useEffect(() => {
    fetchRecipes();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipe),
      });
      if (!res.ok) throw new Error('Failed to add recipe');
      const data = await res.json();
      setRecipes([...recipes, data]);
      setNewRecipe({ name: '', time_minutes: '', servings: '', difficulty: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="recipes-page">
      <header className="page-header">
        <h1>🍳 Rezepte</h1>
        <Link to="/dashboard" className="btn-back">← Zurück</Link>
      </header>

      <div className="container">
        <section className="add-recipe-section">
          <h2>Neues Rezept hinzufügen</h2>
          <form onSubmit={handleAddRecipe} className="recipe-form">
            <input
              type="text"
              placeholder="Rezeptname"
              value={newRecipe.name}
              onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Zeit (min)"
              value={newRecipe.time_minutes}
              onChange={(e) => setNewRecipe({ ...newRecipe, time_minutes: e.target.value })}
            />
            <input
              type="number"
              placeholder="Portionen"
              value={newRecipe.servings}
              onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
            />
            <select
              value={newRecipe.difficulty}
              onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value })}
            >
              <option value="">Schwierigkeit</option>
              <option value="easy">Einfach</option>
              <option value="medium">Mittel</option>
              <option value="hard">Schwer</option>
            </select>
            <button type="submit" className="btn-primary">Hinzufügen</button>
          </form>
        </section>

        <section className="recipes-list">
          <h2>Meine Rezepte ({recipes.length})</h2>
          {loading ? (
            <p>Lädt...</p>
          ) : recipes.length === 0 ? (
            <p>Noch keine Rezepte. Erstellen Sie eines oben! 👆</p>
          ) : (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="recipe-card">
                  <div className="recipe-emoji">🍽️</div>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.time_minutes} min · {recipe.servings} Portionen</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RecipesPage;
