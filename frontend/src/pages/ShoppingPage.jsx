import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from './ShoppingPage.module.css';

export default function ShoppingPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', quantity: '', unit: '' });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const data = await api.get('/shopping/lists');
      setLists(data || []);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await api.post('/shopping/lists', { name: newListName });
      fetchLists();
      setNewListName('');
      setShowNewList(false);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedListId || !itemForm.name.trim()) return;
    try {
      await api.post(`/shopping/lists/${selectedListId}/items`, itemForm);
      fetchLists();
      setItemForm({ name: '', quantity: '', unit: '' });
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleToggleItem = async (itemId, checked) => {
    try {
      await api.put(`/shopping/items/${itemId}`, { checked: !checked });
      fetchLists();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/shopping/items/${itemId}`);
      fetchLists();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('Liste löschen?')) return;
    try {
      await api.delete(`/shopping/lists/${listId}`);
      fetchLists();
      if (selectedListId === listId) {
        setSelectedListId(null);
      }
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  const selectedList = lists.find((l) => l.id === selectedListId);
  const items = (selectedList?.ShoppingItems || selectedList?.shoppingItems || []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛒 Einkaufsliste</h1>
        <button
          className="btn-primary"
          onClick={() => setShowNewList(!showNewList)}
        >
          {showNewList ? 'Abbrechen' : '+ Liste'}
        </button>
      </div>

      {showNewList && (
        <form onSubmit={handleCreateList} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Listenname..."
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Erstellen
          </button>
        </form>
      )}

      <div className={styles.content}>
        <div className={styles.listsSidebar}>
          <h3>Listen</h3>
          {loading ? (
            <p>Lädt...</p>
          ) : lists.length === 0 ? (
            <p className={styles.empty}>Keine Listen vorhanden</p>
          ) : (
            <div className={styles.listsTabs}>
              {lists.map((list) => (
                <button
                  key={list.id}
                  className={`${styles.listTab} ${selectedListId === list.id ? styles.active : ''}`}
                  onClick={() => setSelectedListId(list.id)}
                >
                  <span>{list.name}</span>
                  <button
                    className={styles.deleteListBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedList && (
          <div className={styles.listContent}>
            <form onSubmit={handleAddItem} className={styles.addItemForm}>
              <input
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Artikel hinzufügen..."
                required
              />
              <input
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                placeholder="Menge"
                step="0.01"
              />
              <input
                type="text"
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                placeholder="Einheit"
              />
              <button type="submit" className={styles.addBtn}>
                +
              </button>
            </form>

            <div className={styles.itemsList}>
              {items.length === 0 ? (
                <p className={styles.empty}>Keine Artikel in dieser Liste</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.item} ${item.checked ? styles.checked : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={() => handleToggleItem(item.id, item.checked)}
                      className={styles.checkbox}
                    />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      {item.quantity && (
                        <span className={styles.itemQuantity}>
                          {item.quantity} {item.unit || ''}
                        </span>
                      )}
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
