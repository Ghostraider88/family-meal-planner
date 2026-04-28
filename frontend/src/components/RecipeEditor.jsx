import { useState, useRef } from 'react';

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
    images: [],
  });

  const [ingredientInput, setIngredientInput] = useState({ name: '', quantity: '', unit: '' });
  const [instructionInput, setInstructionInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(initialRecipe?.images || []);

  const ingredientNameRef = useRef(null);
  const ingredientQuantityRef = useRef(null);
  const ingredientUnitRef = useRef(null);
  const instructionRef = useRef(null);

  // Handle image upload (file or camera)
  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData({
          ...formData,
          images: [...formData.images, base64],
        });
        setImagePreview([...imagePreview, base64]);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Fehler beim Laden des Bildes');
    }
  };

  const handleRemoveImage = (idx) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== idx),
    });
    setImagePreview(imagePreview.filter((_, i) => i !== idx));
  };

  // Handle ingredient with auto-focus
  const handleAddIngredient = () => {
    if (!ingredientInput.name.trim()) {
      setError('Zutat erforderlich');
      return;
    }

    const newIngredient = {
      name: ingredientInput.name.trim(),
      quantity: ingredientInput.quantity || '',
      unit: ingredientInput.unit || '',
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient],
    });

    setIngredientInput({ name: '', quantity: '', unit: '' });
    setError('');

    setTimeout(() => ingredientNameRef.current?.focus(), 0);
  };

  const handleRemoveIngredient = (idx) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== idx),
    });
  };

  // Handle instruction with auto-focus
  const handleAddInstruction = () => {
    if (!instructionInput.trim()) {
      setError('Schritt erforderlich');
      return;
    }

    setFormData({
      ...formData,
      instructions: [...formData.instructions, instructionInput.trim()],
    });

    setInstructionInput('');
    setError('');

    setTimeout(() => instructionRef.current?.focus(), 0);
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

          {/* Images Section */}
          <div style={styles.section}>
            <label style={styles.label}>📷 Bilder</label>
            <div style={styles.imageInputRow}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={styles.fileBtn}>📁 Datei</label>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                style={{ display: 'none' }}
                id="camera-upload"
              />
              <label htmlFor="camera-upload" style={styles.fileBtn}>📷 Kamera</label>
            </div>

            {imagePreview.length > 0 && (
              <div style={styles.imageGrid}>
                {imagePreview.map((img, i) => (
                  <div key={i} style={styles.imageContainer}>
                    <img src={img} alt={`Rezept ${i + 1}`} style={styles.imageThumbnail} />
                    <button
                      style={styles.imageDeleteBtn}
                      onClick={() => handleRemoveImage(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <label style={styles.label}>🏷️ Tags</label>
            <div style={styles.tagInputRow}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="z.B. vegetarisch"
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

          {/* Ingredients with Quantity */}
          <div style={styles.section}>
            <label style={styles.label}>📦 Zutaten</label>
            <div style={styles.ingredientInputs}>
              <input
                ref={ingredientNameRef}
                type="text"
                value={ingredientInput.name}
                onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && ingredientQuantityRef.current?.focus()}
                placeholder="Zutat"
                style={styles.ingredientNameInput}
              />
              <input
                ref={ingredientQuantityRef}
                type="text"
                value={ingredientInput.quantity}
                onChange={(e) => setIngredientInput({ ...ingredientInput, quantity: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && ingredientUnitRef.current?.focus()}
                placeholder="Menge"
                style={styles.ingredientQuantityInput}
              />
              <input
                ref={ingredientUnitRef}
                type="text"
                value={ingredientInput.unit}
                onChange={(e) => setIngredientInput({ ...ingredientInput, unit: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                placeholder="Einheit"
                style={styles.ingredientUnitInput}
              />
              <button style={styles.addIngrBtn} onClick={handleAddIngredient}>+</button>
            </div>

            {formData.ingredients.length > 0 && (
              <div style={styles.ingredientsList}>
                {formData.ingredients.map((ing, i) => (
                  <div key={i} style={styles.ingredientItem}>
                    <span>
                      <strong>{ing.name}</strong>
                      {ing.quantity && <span> - {ing.quantity}</span>}
                      {ing.unit && <span> {ing.unit}</span>}
                    </span>
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
            <label style={styles.label}>👨‍🍳 Anleitung</label>
            <div style={styles.instructionInputRow}>
              <textarea
                ref={instructionRef}
                value={instructionInput}
                onChange={(e) => setInstructionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleAddInstruction()}
                placeholder="Schritt eingeben (Ctrl+Enter zum Speichern)"
                style={styles.textarea}
              />
              <button style={styles.addInstructionBtn} onClick={handleAddInstruction}>
                Schritt hinzufügen
              </button>
            </div>

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

  imageInputRow: {
    display: 'flex',
    gap: '8px',
  },
  fileBtn: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: '#00C5FF',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    border: 'none',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
    marginTop: '8px',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '100%',
  },
  imageThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  imageDeleteBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#FF0048',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
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

  ingredientInputs: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr auto',
    gap: '8px',
    alignItems: 'end',
  },
  ingredientNameInput: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  ingredientQuantityInput: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  ingredientUnitInput: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  addIngrBtn: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  ingredientsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  ingredientItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#F0F2F9',
    borderRadius: '6px',
    fontSize: '14px',
  },

  instructionInputRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
