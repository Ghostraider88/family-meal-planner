import { useParams, Link } from 'react-router-dom';

const RecipeDetail = () => {
  const { id } = useParams();

  return (
    <div className="container" style={{ padding: '32px 16px', minHeight: '100vh' }}>
      <Link to="/recipes">← Zurück zu Rezepten</Link>
      <h1>Rezept-Detail: {id}</h1>
      <p>Diese Seite zeigt Details eines einzelnen Rezepts mit Zutaten und Anleitung.</p>
      <p style={{ color: '#8B91A3', marginTop: '20px' }}>Phase 1 MVP: Grundstruktur vorhanden</p>
    </div>
  );
};

export default RecipeDetail;
