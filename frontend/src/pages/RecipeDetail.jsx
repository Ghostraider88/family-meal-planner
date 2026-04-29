import { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recipes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Rezept nicht gefunden');
      const data = await res.json();
      setRecipe(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!confirm('Rezept wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Fehler beim Löschen');
      navigate('/recipes');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddToShoppingList = async (ingredient) => {
    // Später implementieren - Shopping List Integration
    alert(`"${ingredient.name}" würde zur Einkaufsliste hinzugefügt`);
  };

  const handleAddToWeek = () => {
    // Pass recipe info to week planner
    navigate(`/week?addRecipe=${id}`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Lädt...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div style={styles.container}>
        <Link to="/recipes" style={styles.backLink}>← Zurück</Link>
        <div style={styles.error}>{error || 'Rezept nicht gefunden'}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link to="/recipes" style={styles.backLink}>← Zurück</Link>
        <h1 style={styles.title}>🍳 Rezepte</h1>
      </header>

      <div style={styles.content}>
        {/* Recipe Header */}
        <div style={styles.recipeHeader}>
          {recipe.images && recipe.images.length > 0 && (
            <div style={styles.imageCarousel}>
              <img src={recipe.images[0]} alt={recipe.name} style={styles.headerImage} />
            </div>
          )}
          <div style={styles.recipeEmoji}>🍽️</div>
          <h2 style={styles.recipeName}>{recipe.name}</h2>

          <div style={styles.recipeMetadata}>
            {recipe.time_minutes && (
              <span style={styles.metaItem}>⏱️ {recipe.time_minutes} min</span>
            )}
            {recipe.servings && (
              <span style={styles.metaItem}>👥 {recipe.servings} Portionen</span>
            )}
            {recipe.difficulty && (
              <span style={styles.metaItem}>
                {recipe.difficulty === 'easy' ? '⭐' : recipe.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
              </span>
            )}
          </div>

          {recipe.source && (
            <div style={styles.source}>Quelle: {recipe.source}</div>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div style={styles.tagsContainer}>
              {recipe.tags.map((tag, idx) => (
                <span key={idx} style={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients Section */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>📦 Zutaten</h3>
            <div style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, idx) => {
                const isString = typeof ingredient === 'string';
                const name = isString ? ingredient : ingredient.name || '';
                const quantity = !isString && ingredient.quantity ? ingredient.quantity : '';
                const unit = !isString && ingredient.unit ? ingredient.unit : '';

                return (
                  <div key={idx} style={styles.ingredientItem}>
                    <input
                      type="checkbox"
                      checked={checkedIngredients[idx] || false}
                      onChange={(e) => setCheckedIngredients({
                        ...checkedIngredients,
                        [idx]: e.target.checked
                      })}
                      style={styles.checkbox}
                    />
                    <div style={styles.ingredientContent}>
                      <span style={{
                        ...styles.ingredientName,
                        ...(checkedIngredients[idx] ? styles.checkedIngredient : {}),
                      }}>
                        {name}
                        {quantity && <span> - {quantity}</span>}
                        {unit && <span> {unit}</span>}
                      </span>
                    </div>
                    <button
                      style={styles.addToListBtn}
                      onClick={() => handleAddToShoppingList({ name, quantity, unit })}
                      title="Zur Einkaufsliste"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Instructions Section */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>👨‍🍳 Anleitung</h3>
            <div style={styles.instructionsList}>
              {recipe.instructions.map((step, idx) => (
                <div key={idx} style={styles.instructionItem}>
                  <div style={styles.stepNumber}>{idx + 1}</div>
                  <p style={styles.stepText}>
                    {typeof step === 'string' ? step : step.text || JSON.stringify(step)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button style={styles.addToWeekBtn} onClick={handleAddToWeek}>
            📅 Zur Woche hinzufügen
          </button>
          <button style={styles.deleteBtn} onClick={handleDeleteRecipe}>
            🗑️ Löschen
          </button>
        </div>
      </div>
    </div>
  );
};

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
    marginTop: '16px',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#8B91A3',
  },
  recipeHeader: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  imageCarousel: {
    width: '100%',
    height: '240px',
    backgroundColor: '#F0F2F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  recipeEmoji: {
    fontSize: '56px',
    marginBottom: '12px',
  },
  recipeName: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
  },
  recipeMetadata: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  metaItem: {
    fontSize: '14px',
    color: '#8B91A3',
    padding: '4px 8px',
    backgroundColor: '#F0F2F9',
    borderRadius: '6px',
  },
  source: {
    fontSize: '12px',
    color: '#8B91A3',
    marginTop: '12px',
    fontStyle: 'italic',
  },
  tagsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: '12px',
    backgroundColor: '#D4EDFC',
    color: '#00C5FF',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
  },
  ingredientsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  ingredientItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#F0F2F9',
    borderRadius: '8px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: '14px',
    color: '#000',
  },
  checkedIngredient: {
    textDecoration: 'line-through',
    color: '#8B91A3',
  },
  addToListBtn: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  instructionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  instructionItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#00C5FF',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },
  stepText: {
    margin: 0,
    fontSize: '14px',
    color: '#000',
    lineHeight: '1.6',
    paddingTop: '2px',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginTop: '20px',
  },
  addToWeekBtn: {
    padding: '14px 16px',
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    padding: '14px 16px',
    backgroundColor: '#FF0048',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default RecipeDetail;
