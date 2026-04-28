import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ShoppingPage = () => {
  const { token } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/shopping/lists', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shopping/lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
      });
      if (!res.ok) throw new Error('Failed to add list');
      const data = await res.json();
      setLists([...lists, data]);
      setNewListName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '32px 16px', minHeight: '100vh', backgroundColor: '#F0F2F9' }}>
      <Link to="/dashboard">← Zurück</Link>
      <h1>🛒 Einkaufslisten</h1>

      <div style={{ marginTop: '32px' }}>
        <h2>Neue Liste erstellen</h2>
        <form onSubmit={handleAddList} style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <input
            type="text"
            placeholder="Listenname"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            required
            style={{ flex: 1, padding: '12px', border: '1px solid #E3E6EF', borderRadius: '8px' }}
          />
          <button type="submit" style={{ padding: '12px 24px', background: '#00C5FF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Erstellen
          </button>
        </form>
      </div>

      {loading ? (
        <p>Lädt...</p>
      ) : (
        <div style={{ marginTop: '32px' }}>
          <h2>Meine Listen ({lists.length})</h2>
          {lists.length === 0 ? (
            <p>Keine Listen vorhanden. Erstellen Sie eine oben!</p>
          ) : (
            <ul>
              {lists.map((list) => (
                <li key={list.id} style={{ marginBottom: '12px', padding: '12px', background: 'white', borderRadius: '8px' }}>
                  {list.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingPage;
