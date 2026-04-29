import { useState } from 'react';

const PDFImportModal = ({ onImportSuccess, onClose, token }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [editingPreview, setEditingPreview] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Nur PDF-Dateien erlaubt');
      return;
    }

    setFile(selectedFile);
    setError('');
    await parsePDF(selectedFile);
  };

  const parsePDF = async (pdfFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const res = await fetch('/api/recipes/import/pdf', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'PDF-Parsing fehlgeschlagen');
      }

      const data = await res.json();
      setPreview(data.preview);
      setEditingPreview(JSON.parse(JSON.stringify(data.preview)));
    } catch (err) {
      setError(err.message);
      setPreview(null);
      setEditingPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPreview || !editingPreview.name.trim()) {
      setError('Rezeptname erforderlich');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingPreview,
          name: editingPreview.name.trim(),
          time_minutes: editingPreview.time_minutes ? parseInt(editingPreview.time_minutes) : null,
          servings: editingPreview.servings ? parseInt(editingPreview.servings) : null,
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Speichern');
      const newRecipe = await res.json();
      onImportSuccess(newRecipe);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = (field, value) => {
    setEditingPreview({ ...editingPreview, [field]: value });
  };

  const addIngredient = () => {
    setEditingPreview({
      ...editingPreview,
      ingredients: [...editingPreview.ingredients, { name: '', quantity: '', unit: '' }],
    });
  };

  const updateIngredient = (idx, field, value) => {
    const newIngredients = [...editingPreview.ingredients];
    newIngredients[idx] = { ...newIngredients[idx], [field]: value };
    setEditingPreview({ ...editingPreview, ingredients: newIngredients });
  };

  const removeIngredient = (idx) => {
    setEditingPreview({
      ...editingPreview,
      ingredients: editingPreview.ingredients.filter((_, i) => i !== idx),
    });
  };

  const addInstruction = () => {
    setEditingPreview({
      ...editingPreview,
      instructions: [...editingPreview.instructions, ''],
    });
  };

  const updateInstruction = (idx, value) => {
    const newInstructions = [...editingPreview.instructions];
    newInstructions[idx] = value;
    setEditingPreview({ ...editingPreview, instructions: newInstructions });
  };

  const removeInstruction = (idx) => {
    setEditingPreview({
      ...editingPreview,
      instructions: editingPreview.instructions.filter((_, i) => i !== idx),
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>📄 PDF-Rezept importieren</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          {!preview ? (
            // File Upload Section
            <div style={styles.uploadSection}>
              <div style={styles.uploadBox}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  style={{ display: 'none' }}
                  id="pdf-input"
                  disabled={loading}
                />
                <label htmlFor="pdf-input" style={styles.uploadLabel}>
                  {loading ? '⏳ PDF wird geparst...' : '📤 PDF auswählen'}
                </label>
              </div>
              <p style={styles.uploadHint}>
                Wähle eine PDF-Datei mit dem Rezept. Der Parser versucht automatisch, die Struktur zu erkennen.
              </p>
            </div>
          ) : (
            // Preview & Edit Section
            <div style={styles.previewSection}>
              <h3 style={styles.previewTitle}>✅ Rezept erkannt! Bearbeite es:</h3>

              <div style={styles.section}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  value={editingPreview.name}
                  onChange={(e) => updatePreview('name', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.twoCol}>
                <div style={styles.section}>
                  <label style={styles.label}>Zeit (min)</label>
                  <input
                    type="number"
                    value={editingPreview.time_minutes || ''}
                    onChange={(e) => updatePreview('time_minutes', e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.section}>
                  <label style={styles.label}>Portionen</label>
                  <input
                    type="number"
                    value={editingPreview.servings || ''}
                    onChange={(e) => updatePreview('servings', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <label style={styles.label}>📦 Zutaten ({editingPreview.ingredients.length})</label>
                  <button style={styles.addBtn} onClick={addIngredient}>+ Zutat</button>
                </div>
                <div style={styles.ingredientsList}>
                  {editingPreview.ingredients.map((ing, idx) => (
                    <div key={idx} style={styles.ingredientRow}>
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                        placeholder="Zutat"
                        style={styles.ingredientInput}
                      />
                      <input
                        type="text"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                        placeholder="Menge"
                        style={styles.quantityInput}
                      />
                      <input
                        type="text"
                        value={ing.unit}
                        onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                        placeholder="Einheit"
                        style={styles.unitInput}
                      />
                      <button
                        style={styles.deleteBtn}
                        onClick={() => removeIngredient(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <label style={styles.label}>👨‍🍳 Anleitung ({editingPreview.instructions.length})</label>
                  <button style={styles.addBtn} onClick={addInstruction}>+ Schritt</button>
                </div>
                <div style={styles.instructionsList}>
                  {editingPreview.instructions.map((inst, idx) => (
                    <div key={idx} style={styles.instructionRow}>
                      <span style={styles.stepNum}>{idx + 1}</span>
                      <textarea
                        value={inst}
                        onChange={(e) => updateInstruction(idx, e.target.value)}
                        placeholder={`Schritt ${idx + 1}`}
                        style={styles.instructionInput}
                      />
                      <button
                        style={styles.deleteBtn}
                        onClick={() => removeInstruction(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          {preview && (
            <button
              style={styles.backBtn}
              onClick={() => {
                setPreview(null);
                setEditingPreview(null);
                setFile(null);
              }}
              disabled={loading}
            >
              ← Zurück
            </button>
          )}
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Abbrechen
          </button>
          {preview && (
            <button
              style={styles.saveBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? '⏳ Speichern...' : '💾 Speichern'}
            </button>
          )}
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
  uploadSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '40px 20px',
  },
  uploadBox: {
    width: '100%',
  },
  uploadLabel: {
    display: 'block',
    padding: '40px',
    backgroundColor: '#D4EDFC',
    border: '2px dashed #00C5FF',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#00C5FF',
    transition: 'all 0.2s',
  },
  uploadHint: {
    margin: 0,
    fontSize: '14px',
    color: '#8B91A3',
    textAlign: 'center',
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  previewTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#000',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#000',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  addBtn: {
    backgroundColor: '#00C5FF',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  ingredientsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  ingredientRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr auto',
    gap: '8px',
    alignItems: 'center',
  },
  ingredientInput: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  quantityInput: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  unitInput: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  deleteBtn: {
    backgroundColor: '#FF0048',
    color: 'white',
    border: 'none',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  instructionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  instructionRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '8px',
    alignItems: 'start',
  },
  stepNum: {
    fontWeight: 'bold',
    color: '#00C5FF',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4EDFC',
    borderRadius: '6px',
    fontSize: '13px',
  },
  instructionInput: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #E3E6EF',
    fontSize: '13px',
    fontFamily: 'inherit',
    minHeight: '60px',
    resize: 'vertical',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    borderTop: '1px solid #E3E6EF',
    backgroundColor: '#F0F2F9',
  },
  backBtn: {
    padding: '10px 16px',
    backgroundColor: '#F0F2F9',
    color: '#403E4E',
    border: '1px solid #B2B7C7',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
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

export default PDFImportModal;
