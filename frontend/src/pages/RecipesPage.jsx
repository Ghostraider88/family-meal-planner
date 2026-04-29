import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RecipeEditor from '../components/RecipeEditor';
import PDFImportModal from '../components/PDFImportModal';

const RecipesPage = () => {
  const { token } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showPDFImport, setShowPDFImport] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recipes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Fehler beim Laden');
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (recipeData) => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });
      if (!res.ok) throw new Error('Fehler beim Speichern');
      const data = await res.json();
      setRecipes([...recipes, data]);
      setShowEditor(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePDFImportSuccess = (newRecipe) => {
    setRecipes([...recipes, newRecipe]);
    setShowPDFImport(false);
  };

  // Get all unique tags from recipes
  const allTags = Array.from(new Set(
    recipes.flatMap(r => r.tags || [])
  )).sort();

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (recipe.tags && recipe.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>← Zurück</Link>
        <h1 style={styles.title}>🍳 Rezepte</h1>
      </header>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Search & Add Button */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Rezepte durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.addBtn} onClick={() => setShowEditor(true)}>
            + Neues Rezept
          </button>
          <button style={styles.addBtn} onClick={() => setShowPDFImport(true)}>
            📄 PDF Import
          </button>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Filter:</div>
            <div style={styles.filterTags}>
              <button
                style={{
                  ...styles.filterTag,
                  ...(selectedTag === '' ? styles.filterTagActive : {}),
                }}
                onClick={() => setSelectedTag('')}
              >
                Alle
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  style={{
                    ...styles.filterTag,
                    ...(selectedTag === tag ? styles.filterTagActive : {}),
                  }}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {loading ? (
          <p style={styles.loading}>Lädt...</p>
        ) : filteredRecipes.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              {recipes.length === 0
                ? '📚 Noch keine Rezepte. Erstellen Sie eines mit dem Button oben!'
                : '🔍 Keine Rezepte gefunden.'}
            </p>
          </div>
        ) : (
          <div style={styles.recipeGrid}>
            {filteredRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                style={styles.recipeCard}
              >
                <div style={styles.recipeEmoji}>🍽️</div>
                <h3 style={styles.recipeName}>{recipe.name}</h3>
                <div style={styles.recipeMeta}>
                  {recipe.time_minutes && (
                    <span style={styles.metaItem}>⏱️ {recipe.time_minutes}m</span>
                  )}
                  {recipe.servings && (
                    <span style={styles.metaItem}>👥 {recipe.servings}</span>
                  )}
                </div>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div style={styles.recipeTags}>
                    {recipe.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} style={styles.recipeTag}>{tag}</span>
                    ))}
                    {recipe.tags.length > 2 && (
                      <span style={styles.recipeTag}>+{recipe.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {showEditor && (
        <RecipeEditor
          onSave={handleAddRecipe}
          onClose={() => setShowEditor(false)}
        />
      )}

      {showPDFImport && (
        <PDFImportModal
          onImportSuccess={handlePDFImportSuccess}
          onClose={() => setShowPDFImport(false)}
          token={token}
        />
      )}
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
    marginBottom: '16px',
    fontSize: '14px',
  },
  searchBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  addBtn: {
    padding: '10px 16px',
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  filterSection: {
    marginBottom: '16px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#8B91A3',
    marginBottom: '8px',
  },
  filterTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterTag: {
    padding: '6px 12px',
    backgroundColor: 'white',
    border: '1px solid #E3E6EF',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#403E4E',
    transition: 'all 0.2s',
  },
  filterTagActive: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: '1px solid #00C5FF',
  },
  loading: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#8B91A3',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    marginTop: '20px',
  },
  emptyText: {
    margin: 0,
    fontSize: '16px',
    color: '#8B91A3',
  },
  recipeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  recipeEmoji: {
    fontSize: '32px',
    flexShrink: 0,
  },
  recipeName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  recipeMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#8B91A3',
  },
  metaItem: {
    backgroundColor: '#F0F2F9',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  recipeTags: {
    display: 'flex',
    gap: '4px',
  },
  recipeTag: {
    fontSize: '10px',
    backgroundColor: '#D4EDFC',
    color: '#00C5FF',
    padding: '2px 6px',
    borderRadius: '3px',
  },
};

export default RecipesPage;
