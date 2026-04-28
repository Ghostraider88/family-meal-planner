# 🤖 Claude Collaboration Guide

**Dieses Dokument ist für Claude Code gedacht — um mit dir zusammen die App zu entwickeln.**

Wenn du Claude fragst: *"Implementier Phase 2 Feature X mit mir zusammen"* — Claude sollte diese Anleitung folgen.

---

## 🎯 Grundprinzipien

### 1. **Lese PHASE_2_GUIDE.md zuerst**
   - Verstehe den Scope des Features
   - Folge der Implementation Checklist
   - Code Standards beachten

### 2. **Eine Feature pro Session**
   - Nicht zu viel auf einmal
   - Nach jedem Feature testen & committen
   - Fortschritt transparent zeigen

### 3. **Test-First Ansatz**
   ```
   Implementieren → Testen (Browser + API) → Commit → Deploy
   ```

### 4. **Kommunikation**
   - Klare Schritte erklären
   - Fragen bei Ambiguity stellen (AskUserQuestion)
   - Zeige dich nicht sicher, wenn du es nicht bist

---

## 📋 Workflow für Claude

### Phase 2 Feature implementieren

```
1. Feature Scope verstehen (PHASE_2_GUIDE.md lesen)
   └─ Welche Backend-Endpoints nötig?
   └─ Welche Frontend-Components nötig?
   └─ Database Changes?

2. Backend implementieren (in dieser Reihenfolge)
   ├─ Models & Migrations (falls nötig)
   ├─ Services/Business Logic
   ├─ Routes & Endpoints
   └─ Test mit Postman/curl

3. Frontend implementieren
   ├─ Components
   ├─ Pages
   ├─ Hooks
   ├─ Styling
   └─ Test im Browser

4. Integration testen
   ├─ Feature-Flow testen
   ├─ Error Cases abdecken
   ├─ Responsive Design prüfen
   └─ Performance Check

5. Commit & Push
   ├─ Aussagekräftige Commit Message
   ├─ Branch: claude/build-family-meal-planner-gaixR
   └─ Kurze Zusammenfassung für User

6. Dokumentation
   ├─ README.md updaten (falls API ändert)
   ├─ Neue Features in PHASE_2_GUIDE.md notieren
   └─ Beispiele hinzufügen
```

---

## 🛠️ Technische Details pro Feature

### Email-Invites (Phase 2.1) ✅ FERTIG
**Status:** Implemented in commit `8352a0b`

Endpoints:
```
POST /api/users/family/invite              # Send invitation
GET  /api/users/family/invites             # List pending
DELETE /api/users/family/invites/:id       # Cancel invite
GET  /api/invites/:token                   # Get invite details (public)
POST /api/invites/:token/accept            # Accept invite (public)
POST /api/invites/:token/decline           # Decline invite (public)
```

Frontend Pages:
- `/family` — FamilyPage.jsx mit InviteModal
- Modal & Notifications implementiert

---

### Recipe Importing (Phase 2.2) — NÄCHSTES FEATURE

**Was bauen:**
1. URL-Input für Rezept-Link
2. Web Scraper für:
   - Chefkoch.de
   - Hello Fresh
   - REWE-Rezepte
3. Preview der gescrapten Daten
4. Save mit Validierung

**Backend:**
```javascript
// POST /api/recipes/import
{
  url: "https://www.chefkoch.de/...",
  source: "chefkoch"  // oder "hello-fresh", "rewe"
}

Response:
{
  name: "Spaghetti Carbonara",
  time_minutes: 30,
  servings: 4,
  ingredients: [...],
  instructions: [...],
  source: "https://..."
}
```

**Frontend:**
```
/recipes page
└─ ImportRecipeModal (useState für URL, source)
   ├─ URL input
   ├─ Source selector (dropdown)
   ├─ Loading state während scraping
   ├─ Preview mit Bearbeiten-Option
   └─ Save button
```

**Code Template für Scraper:**
```javascript
// backend/src/services/scrapers/chefkoch.js
import axios from 'axios';
import cheerio from 'cheerio';

export const scrapeChefkoch = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    return {
      name: $('.recipe-title').text(),
      time_minutes: parseInt($('.recipe-time').text()),
      servings: parseInt($('.recipe-servings').text()),
      ingredients: $('.ingredient-list li').map((_, el) => ({
        name: $(el).find('.ingredient-name').text(),
        amount: $(el).find('.ingredient-amount').text(),
        unit: $(el).find('.ingredient-unit').text(),
      })).get(),
      instructions: $('.instruction-step').map((_, el) => ({
        step: $(el).text()
      })).get(),
      source: url,
    };
  } catch (err) {
    throw new Error(`Failed to scrape Chefkoch: ${err.message}`);
  }
};
```

---

### Smart Recommendations (Phase 2.3)

**Idee:**
- Audit Log auswerten (welche Rezepte, wann)
- Häufigste Rezepte finden
- Ähnliche Rezepte auf Basis von Tags
- KI-Vorschlag für nächste Woche

**Einfache Version ohne KI:**
```javascript
// backend/src/services/recommendationService.js
export const getWeeklyRecommendations = async (familyId) => {
  // 1. Letzten 8 Wochen Rezepte anschauen
  // 2. Top 5 häufigste Rezepte finden
  // 3. Mit ähnlichen Tags andere Rezepte finden
  // 4. Nicht wiederholte Rezepte bevorzugen
  // 5. Rückgabe: Array von Rezepten (7 + backup)
};
```

---

## 🧪 Testing Checklist

### Backend Tests (curl)
```bash
# 1. Endpoint existiert
curl -X [METHOD] http://localhost:3001/api/[endpoint]

# 2. Mit Token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.de","password":"test123"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/[endpoint]

# 3. Error Cases
curl -X POST http://localhost:3001/api/[endpoint] \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
```

### Frontend Tests (Browser)
```
1. Component rendert ohne Fehler (DevTools Console)
2. User-Input funktioniert (onChange Events)
3. API Calls funktionieren (Network Tab)
4. Error Handling zeigt Messages (Toast/Error)
5. Responsive Design (DevTools → Responsive Mode)
6. Mobile (< 600px) sieht gut aus
7. Desktop (> 1024px) sieht gut aus
```

### Full Flow Test
```
1. Nutzer Action triggern
2. API Call sehen (Network Tab)
3. State Update überprüfen
4. UI Update sehen
5. Browser Reload → Daten noch da
```

---

## 📊 Code Standards Claude MUSS folgen

### Backend (Express)
```javascript
// ✅ IMMER Authentication nutzen
router.use(authenticate);

// ✅ Validierung ZUERST
if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}

// ✅ Error Handling konsistent
try {
  const result = await someAsyncOp();
  res.json(result);
} catch (err) {
  next(err);  // Zur Error Middleware
}

// ❌ NICHT: Response ohne Status prüfen
// ❌ NICHT: Promises ohne catch
// ❌ NICHT: Hardcoded Secrets in Code
```

### Frontend (React)
```jsx
// ✅ IMMER context für auth nutzen
const { token, user } = useContext(AuthContext);

// ✅ Error Handling
try {
  const res = await fetch('/api/...');
  if (!res.ok) throw new Error(data.error);
  showSuccess('Saved!');
} catch (err) {
  showError(err.message);
}

// ✅ Loading States
const [loading, setLoading] = useState(false);
<button disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>

// ✅ useEffect Dependencies
useEffect(() => {
  fetchData();
}, [token]);  // NICHT []!

// ❌ NICHT: setState in Event Handler ohne try/catch
// ❌ NICHT: API calls in useEffect ohne cleanup
// ❌ NICHT: Hardcoded URLs
```

### CSS/Styling
```css
/* ✅ Verwende Design System */
color: var(--primary-blue);  /* #00C5FF */
padding: var(--spacing-4);    /* 16px */
border-radius: var(--radius-md);  /* 8px */

/* ✅ Mobile First */
.container {
  display: block;  /* mobile */
}

@media (min-width: 600px) {
  .container {
    display: grid;
  }
}

/* ❌ NICHT: Hardcoded colors
/* ❌ NICHT: Desktop First (mobiles leidet)
/* ❌ NICHT: Inline styles (außer temp debugging)
```

---

## 🔍 Git & Commits

### Branch Convention
```
Neue Features: claude/phase-2-feature-name
z.B.: claude/phase-2-recipe-importing
```

### Commit Message Format
```
Feature: Kurze Beschreibung (1 Zeile)

- Was wurde implementiert
- Backend: Endpoints, Models
- Frontend: Components, Pages
- Tests: Was getestet wurde
- Next: Was kommt danach

https://claude.ai/code/session_...
```

### Beispiel:
```
Implement Recipe Importing (Chefkoch, Hello Fresh)

Backend:
✅ Scraper services for Chefkoch.de, Hello Fresh, REWE
✅ POST /api/recipes/import endpoint
✅ URL validation and error handling
✅ Ingredient normalization (units: g, kg, ml, l, Stk)

Frontend:
✅ ImportRecipeModal component
✅ URL input + Source selector
✅ Preview + Edit before save
✅ Loading state and error handling

Tests:
✅ Tested with real Chefkoch URLs
✅ Tested error cases (invalid URL, 404, timeout)
✅ Responsive design on mobile

Next: Recipe preview & ingredient editing
```

---

## 🚨 Häufige Fehler vermeiden

### ❌ Zu viel auf einmal
Wenn Phase 2.2 + 2.3 zusammen machen → zu komplex
→ Lösung: Eins nach dem anderen, jeweils testen

### ❌ Frontend ohne Backend testen
Wenn Button dagebaut aber API nicht implementiert → Frustration
→ Lösung: Backend ZUERST, dann Frontend

### ❌ Breaking Changes ohne Kommunikation
Wenn APIs ändern und niemand sagt es → Other Devs verloren
→ Lösung: Immer in Commit Message dokumentieren

### ❌ Keine Error Handling
Wenn API fehlschlägt und nichts passiert → silent failure
→ Lösung: IMMER try/catch, IMMER Error UI zeigen

### ❌ Datenbank Migrations vergessen
Wenn neues Model aber schema nicht updated → Runtime Error
→ Lösung: Sequelize sync() aufrufen, oder migrations schreiben

---

## 💬 When to Ask User Questions

Nutze `AskUserQuestion` wenn:

1. **Ambiguity in Requirements**
   ```
   "Sollen Rezepte nach Kategorie oder Tags gefiltert werden?"
   ```

2. **Design Decisions**
   ```
   "Modal oder neue Page für Recipe Import?"
   ```

3. **Scope Clarification**
   ```
   "Automatische Kategorie-Erkennung? Das braucht OpenAI..."
   ```

4. **Breaking Changes**
   ```
   "Sollen alte Rezepte Migration durchlaufen?"
   ```

**NICHT fragen für:**
- Technische Details (wie Sequelize funktioniert)
- Code Standards (folge dieser Anleitung!)
- Simple Debugging (einfach testen & fixen)

---

## 📈 Performance & Optimizations

Nach jedem Feature:

1. **Bundle Size Check**
   ```bash
   npm run build  # Check output size
   ```

2. **API Response Time**
   ```bash
   curl -w "@curl-format.txt" https://api/endpoint
   ```

3. **Database Query Efficiency**
   ```
   SELECT * ist schlecht → nur nötige Felder
   Eager loading für Relationships
   ```

4. **Frontend Rendering**
   ```javascript
   // ❌ Schlecht: renders alle 200 items jedesmal
   {items.map(item => <Item key={i} {...item} />)}
   
   // ✅ Besser: mit memo & useMemo
   const Item = memo(({ item }) => <div>{item.name}</div>);
   ```

---

## 🎓 Lern-Ressourcen

Falls Claude unsicher ist:

### Express/Node
- `backend/src/routes/auth.js` — existierendes Beispiel
- `backend/src/services/authService.js` — Service Pattern

### React
- `frontend/src/pages/Dashboard.jsx` — Page Structure
- `frontend/src/components/InviteModal.jsx` — Modal Example
- `frontend/src/context/AuthContext.jsx` — Context Pattern

### Sequelize
- `backend/src/models/User.js` — Model Example
- `backend/src/models/index.js` — Associations

---

## ✅ Launch Checklist für Claude

Bevor Claude "Feature Fertig!" sagt:

- [ ] Code alle Code Standards follow
- [ ] Backend Endpoints mit curl getestet
- [ ] Frontend im Browser getestet (Mobile + Desktop)
- [ ] Error Cases gehandelt
- [ ] Loading States implementiert
- [ ] Commit Message aussagekräftig
- [ ] PHASE_2_GUIDE.md updated
- [ ] README.md updated (falls API änderungen)
- [ ] Keine console.error in Produktion
- [ ] Keine hardcoded URLs/Secrets
- [ ] Git Status saubern: `git status` = nothing to commit
- [ ] Push zu claude/build-family-meal-planner-gaixR

---

## 🚀 Claude, wenn du diese Anleitung liest:

1. Lese PHASE_2_GUIDE.md für Details
2. Folge dem Workflow oben
3. Teste jeden Schritt
4. Sei transparent in Updates
5. Frag bei Unsicherheit nach

**Du schaffst das! Let's build amazing features together!** 🎉

---

Made with ❤️ by Previous Claude Code

Last Updated: 2026-04-28
