import { useState } from 'react';

const MealEditor = ({ date, mealType, recipes, onSave, onClose }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [customName, setCustomName] = useState('');
  const [forPeople, setForPeople] = useState('all');
  const [error, setError] = useState('');

  const mealTypeLabels = {
    breakfast: '🌅 Frühstück',
    lunch: '🍽️ Mittagessen',
    snack: '🍿 Snack',
    dinner: '🌙 Abendessen',
  };

  const handleSave = () => {
    if (!selectedRecipeId && !customName.trim()) {
      setError('Bitte wähle ein Rezept oder gib einen Namen ein');
      return;
    }

    const mealData = {
      date,
      meal_type: mealType,
      ...(selectedRecipeId && { recipe_id: selectedRecipeId }),
      ...(customName.trim() && { custom_name: customName.trim() }),
      ...(forPeople !== 'all' && { for_people: forPeople }),
    };

    onSave(mealData);
  };

  const dateObj = new Date(date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {mealTypeLabels[mealType]} - {dateStr}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          {/* Recipe Selection */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>📖 Aus dem Kochbuch</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => {
                setSelectedRecipeId(e.target.value);
                if (e.target.value) setCustomName('');
              }}
              style={styles.select}
            >
              <option value="">— Rezept wählen —</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} ({recipe.time_minutes ? `${recipe.time_minutes}m` : '?'})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Entry */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>✏️ Freier Eintrag</label>
            <input
              type="text"
              placeholder="z.B. Pizza selbstgemacht"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                if (e.target.value.trim()) setSelectedRecipeId('');
              }}
              style={styles.input}
            />
          </div>

          {/* For People Selection */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>👥 Für wen?</label>
            <div style={styles.radioGroup}>
              {[
                { value: 'all', label: 'Alle' },
                { value: 'kids', label: 'Kinder' },
                { value: 'adults', label: 'Erwachsene' },
              ].map((opt) => (
                <label key={opt.value} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="forPeople"
                    value={opt.value}
                    checked={forPeople === opt.value}
                    onChange={(e) => setForPeople(e.target.value)}
                    style={styles.radio}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Abbrechen</button>
          <button style={styles.saveBtn} onClick={handleSave}>Speichern</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #E3E6EF',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#8B91A3',
    padding: '4px 8px',
  },
  content: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
  },
  error: {
    backgroundColor: '#FF0048',
    color: 'white',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#000',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#000',
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    borderTop: '1px solid #E3E6EF',
    backgroundColor: '#F0F2F9',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #B2B7C7',
    backgroundColor: 'white',
    color: '#403E4E',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#00C5FF',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default MealEditor;
