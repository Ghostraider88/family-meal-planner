import { useState } from 'react';

const RecipeEditor = ({ onSave, onClose, initialRecipe = null }) => {
  const [formData, setFormData] = useState(initialRecipe || {
    name: '',
    time_minutes: '',
    servings: '',
    difficulty: '',
    ingredients: [],
    instructions: [],
    tags: [],
    source: '',
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [instructionInput, setInstructionInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) return;
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredientInput.trim()],
    });
    setIngredientInput('');
  };

  const handleRemoveIngredient = (idx) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== idx),
    });
  };

  const handleAddInstruction = () => {
    if (!instructionInput.trim()) return;
    setFormData({
      ...formData,
      instructions: [...formData.instructions, instructionInput.trim()],
    });
    setInstructionInput('');
  };

  const handleRemoveInstruction = (idx) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== idx),
    });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (idx) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== idx),
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setError('Rezeptname ist erforderlich');
      return;
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      time_minutes: formData.time_minutes ? parseInt(formData.time_minutes) : null,
      servings: formData.servings ? parseInt(formData.servings) : null,
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {initialRecipe ? '✏️ Rezept bearbeiten' : '📝 Neues Rezept'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          {/* Basic Info */}
          <div style={styles.section}>
            <label style={styles.label}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Spaghetti Bolognese"
              style={styles.input}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Quelle</label>
            <input
              type="text"
              value={formData.source || ''}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="z.B. https://..."
              style={styles.input}
            />
          </div>

          <div style={styles.twoCol}>
            <div style={styles.section}>
              <label style={styles.label}>Zeit (min)</label>
              <input
                type="number"
                value={formData.time_minutes || ''}
                onChange={(e) => setFormData({ ...formData, time_minutes: e.target.value })}
                placeholder="30"
                style={styles.input}
              />
            </div>
            <div style={styles.section}>
              <label style={styles.label}>Portionen</label>
              <input
                type="number"
                value={formData.servings || ''}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                placeholder="4"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Schwierigkeit</label>
            <select
              value={formData.difficulty || ''}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              style={styles.input}
            >
              <option value="">— Wählen —</option>
              <option value="easy">⭐ Einfach</option>
              <option value="medium">⭐⭐ Mittel</option>
              <option value="hard">⭐⭐⭐ Schwer</option>
            </select>
          </div>

          {/* Tags */}
          <div style={styles.section}>
            <label style={styles.label}>Tags</label>
            <div style={styles.tagInputRow}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="z.B. vegetarisch, schnell, glutenfrei"
                style={styles.input}
              />
              <button style={styles.addTagBtn} onClick={handleAddTag}>+</button>
            </div>
            {formData.tags.length > 0 && (
              <div style={styles.tagList}>
                {formData.tags.map((tag, i) => (
                  <div key={i} style={styles.tagItem}>
                    <span>{tag}</span>
                    <button
                      style={styles.removeTagBtn}
                      onClick={() => handleRemoveTag(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div style={styles.section}>
            <label style={styles.label}>Zutaten</label>
            <div style={styles.tagInputRow}>
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                placeholder="z.B. 500g Mehl"
                style={styles.input}
              />
              <button style={styles.addTagBtn} onClick={handleAddIngredient}>+</button>
            </div>
            {formData.ingredients.length > 0 && (
              <div style={styles.ingredientsList}>
                {formData.ingredients.map((ing, i) => (
                  <div key={i} style={styles.ingredientItem}>
                    <span>{ing}</span>
                    <button
                      style={styles.removeTagBtn}
                      onClick={() => handleRemoveIngredient(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={styles.section}>
            <label style={styles.label}>Anleitung</label>
            <textarea
              value={instructionInput}
              onChange={(e) => setInstructionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleAddInstruction()}
              placeholder="Schritt eingeben (Ctrl+Enter zum Hinzufügen)"
              style={styles.textarea}
            />
            <button style={styles.addInstructionBtn} onClick={handleAddInstruction}>
              Schritt hinzufügen
            </button>
            {formData.instructions.length > 0 && (
              <div style={styles.instructionsList}>
                {formData.instructions.map((inst, i) => (
                  <div key={i} style={styles.instructionItem}>
                    <span style={styles.stepNum}>{i + 1}</span>
                    <span>{inst}</span>
                    <button
                      style={styles.removeTagBtn}
                      onClick={() => handleRemoveInstruction(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
    gap: '16px',
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
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#000',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
    minHeight: '80px',
    resize: 'vertical',
  },
  tagInputRow: {
    display: 'flex',
    gap: '8px',
  },
  addTagBtn: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  tagList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  tagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#D4EDFC',
    color: '#00C5FF',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  removeTagBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
    width: '16px',
    height: '16px',
  },
  ingredientsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  ingredientItem: {
    display: 'flex',
    alignItems: 'center',
    justify: 'space-between',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#F0F2F9',
    borderRadius: '6px',
    fontSize: '14px',
  },
  addInstructionBtn: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    marginTop: '8px',
  },
  instructionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  instructionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#F0F2F9',
    borderRadius: '6px',
    fontSize: '14px',
  },
  stepNum: {
    fontWeight: 'bold',
    color: '#00C5FF',
    minWidth: '20px',
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
  },
};

export default RecipeEditor;
