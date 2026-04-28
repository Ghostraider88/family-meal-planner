# 🚀 Phase 2 Implementierungs-Guide für Claude

Dieser Guide ist für Claude Code gedacht, um Phase 2 Features mit dir zusammen zu implementieren.

---

## 📋 Phase 2 Scope & Reihenfolge

### Feature 1: Email-Einladungen & Family Sharing ⭐ (Priorität 1)
**Dauer:** ~2 Sessions

#### Backend:
- [ ] `POST /api/family/invite` — Email-Einladung senden (nodemailer)
- [ ] `GET /api/family/invites` — Ausstehende Einladungen abrufen
- [ ] `POST /api/family/invites/:id/accept` — Einladung akzeptieren
- [ ] `POST /api/family/invites/:id/decline` — Einladung ablehnen
- [ ] Email-Template erstellen (HTML-Email)
- [ ] Validierung: nur Owner kann einladen

#### Frontend:
- [ ] `<InviteModal />` Component
- [ ] Family Members Page (`/family`)
- [ ] Invite Form mit Email-Input
- [ ] Invites Dialog mit Accept/Decline Buttons
- [ ] Toast Notifications für Success/Error

#### DB:
- [ ] `FamilyInvites` Table hinzufügen
- [ ] Migration Script

---

### Feature 2: UI Improvements & Components (Priorität 2)
**Dauer:** ~1.5 Sessions

#### RecipeDetail Page:
- [ ] Zutaten-Liste mit Checkboxes
- [ ] Anleitung als nummerierte Schritte
- [ ] "Zur Einkaufsliste hinzufügen" Button
- [ ] "Zur Woche hinzufügen" Button + Datum/Mahlzeittyp-Selector

#### MealPlanner Page:
- [ ] Week Selector (Prev/Next buttons)
- [ ] 7-Day Grid mit 4 Mahlzeittypen pro Tag
- [ ] Meal Slot Items (klickbar, zeigt Rezeptnamen)
- [ ] Empty Slot = "+ Hinzufügen" Button
- [ ] Modal zum Meal Selection

#### ShoppingList Page:
- [ ] Store Mode Toggle (oben persistent)
- [ ] Items gruppiert nach Kategorien (collapsible)
- [ ] Große Checkboxes (40px) im Store Mode
- [ ] "Erledigt" Section (separate, am Ende)
- [ ] Drag & Drop Reihenfolge (Phase 2.5)

---

### Feature 3: Recipe Importing ⭐ (Priorität 3)
**Dauer:** ~2 Sessions

#### Backend:
- [ ] `POST /api/recipes/import` — URL zu Rezept-Parser
- [ ] Scraper Service für:
  - [ ] Chefkoch.de
  - [ ] Hello Fresh (Markdown)
  - [ ] REWE-Rezepte
- [ ] Zutaten normalisieren (Units: g, kg, ml, l, Stk)
- [ ] Fehlerbehandlung & Timeouts

#### Frontend:
- [ ] Import Modal (`<ImportRecipeModal />`)
- [ ] URL-Input + Source-Selector
- [ ] Loading State während Scraping
- [ ] Preview der gescrapten Daten
- [ ] "Bestätigen" oder "Bearbeiten" vor Save

#### Optional:
- [ ] OpenAI API zur Zutaten-Normalisierung
- [ ] Automatische Kategorie-Erkennung

---

### Feature 4: Smart Recommendations (Priorität 4)
**Dauer:** ~1.5 Sessions

#### Backend:
- [ ] Audit Log auswerten (welche Rezepte, wann)
- [ ] Häufigste Rezepte identifizieren
- [ ] Ähnliche Rezepte vorschlagen (Tags-basiert)
- [ ] `GET /api/recommendations/weekly` — KI-Vorschlag für nächste Woche

#### Frontend:
- [ ] "Wochenplan Auto-Fill" Feature
- [ ] "Empfohlene Rezepte" Section auf Dashboard
- [ ] Recommendation Cards mit Gründen ("Du hattest das vor 2 Wochen")

---

## 🛠️ Implementation Checklist für Claude

### Session 1: Email-Invites Setup
```bash
# Verwende diese Befehle:
npm install nodemailer                    # Backend
npm install react-hot-toast              # Frontend
```

**Tasks in dieser Reihenfolge:**
1. [ ] FamilyInvites Model hinzufügen
2. [ ] `POST /api/family/invite` Endpoint
3. [ ] Email-Service mit Nodemailer
4. [ ] Email-Template (HTML)
5. [ ] Accept/Decline Endpoints
6. [ ] Frontend: <InviteModal /> Component
7. [ ] Frontend: Family Members Page
8. [ ] Test mit Postman

---

### Session 2: UI Components & Pages
1. [ ] RecipeDetail Page vollständig implementieren
2. [ ] MealPlanner Page mit Week View
3. [ ] ShoppingList Page mit Categories
4. [ ] Modal Components (Meal Selection, Item Add)
5. [ ] Responsive Mobile Styles
6. [ ] Test im Browser

---

### Session 3: Recipe Importing
1. [ ] Scraper Services für Chefkoch, Hello Fresh, REWE
2. [ ] `POST /api/recipes/import` mit Parser
3. [ ] Frontend: <ImportRecipeModal />
4. [ ] URL-Input + Loading State
5. [ ] Preview & Edit vor Save
6. [ ] Error Handling
7. [ ] Test mit realen URLs

---

### Session 4: Recommendations & Polish
1. [ ] Recommendation Service
2. [ ] Frontend: Recommendation Cards
3. [ ] Auto-Fill Wochenplan Feature
4. [ ] Tests & Bug Fixes
5. [ ] Performance Optimization
6. [ ] Documentation Update

---

## 📝 Code Standards für Phase 2

### Backend (Express/Node)
```javascript
// ✅ Alle neuen Routes mit authentication
router.use(authenticate);

// ✅ Error Handling konsistent
try {
  // ...
} catch (err) {
  next(err);  // Error Middleware
}

// ✅ Validierung am Anfang
if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### Frontend (React)
```javascript
// ✅ Context für State (nicht Redux)
const { user, token } = useContext(AuthContext);

// ✅ Error Handling mit Toast
try {
  const res = await fetch(...);
  if (!res.ok) throw new Error(data.error);
  showSuccess('Gespeichert!');
} catch (err) {
  showError(err.message);
}

// ✅ Loading States
const [loading, setLoading] = useState(false);

// ✅ useEffect Dependencies
useEffect(() => {
  fetchData();
}, [token]);  // Token als dependency
```

---

## 🧪 Testing vor Deploy

### Backend Tests
```bash
# 1. Server starten
cd backend && npm run dev

# 2. Auth testen
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.de","password":"test123","name":"Test"}'

# 3. Token speichern & verwenden
TOKEN="<token_from_response>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/recipes

# 4. Neue Endpoints testen
curl -X POST http://localhost:3001/api/family/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"friend@test.de"}'
```

### Frontend Tests
```bash
# 1. Dev Server starten
cd frontend && npm run dev

# 2. Flows testen:
# - Register new user
# - Login
# - Create recipe
# - Add meal to week
# - Add item to shopping list
# - Invite family member
# - Accept invite
```

### Docker Tests
```bash
# 1. Build & Start
docker-compose up -d

# 2. Prüfen ob Container laufen
docker ps

# 3. Logs ansehen
docker-compose logs -f backend
docker-compose logs -f frontend

# 4. API testen
curl http://localhost:3001/api/health

# 5. Frontend im Browser
# http://localhost:3000 → sollte Login sehen
```

---

## 🚀 Deployment Anleitung (nach Phase 2)

### Lokal testen (Docker)
```bash
# Build Images
docker-compose build

# Start Services
docker-compose up -d

# Check Status
docker-compose ps

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Server
```bash
# 1. Server: Clone Repo
git clone <repo> /opt/family-meal-planner
cd /opt/family-meal-planner

# 2. Environment Variables
cp backend/.env.example backend/.env
# EDIT backend/.env mit Production-Secrets:
# - JWT_SECRET=<random-string>
# - JWT_REFRESH_SECRET=<random-string>
# - DB_PASSWORD=<strong-password>
# - SMTP_USER=<email@gmail.com>
# - SMTP_PASSWORD=<app-password>

# 3. Build & Start
docker-compose build
docker-compose up -d

# 4. Check
docker-compose ps
docker-compose logs backend

# 5. HAProxy Setup (optional, falls vorhanden)
# - example.com → http://localhost:3000
# - example.com/api → http://localhost:3001
# - SSL mit Let's Encrypt

# 6. Database Backup
docker exec family-meal-planner-db pg_dump -U planner_user family_meal_planner > backup.sql

# 7. Auto-Restart
docker-compose up -d --restart=unless-stopped
```

---

## 📚 Dependencies für Phase 2

### Backend neu:
```json
{
  "nodemailer": "^6.9.0",
  "cheerio": "^1.0.0-rc.12",
  "axios": "^1.6.0",
  "openai": "^4.0.0"
}
```

### Frontend neu:
```json
{
  "react-hot-toast": "^2.4.0",
  "react-beautiful-dnd": "^13.1.0"
}
```

---

## 🐛 Häufige Probleme & Lösungen

### "Kann Email nicht senden"
- Check: SMTP_USER & SMTP_PASSWORD in .env
- Gmail: App-Password verwenden, nicht Account-Password
- Sendgrid/Mailgun Alternative falls Gmail blocked

### "Scraper gibt null zurück"
- Website-Structure geändert
- Timeout zu kurz (erhöhen auf 10s)
- User-Agent Header hinzufügen
- Fallback zu manueller URL-Eingabe

### "Docker Build fehlgeschlagen"
- `docker system prune -a` (clean up)
- package-lock.json in Frontend hinzufügen
- Node Version checken (18+ erforderlich)

### "Frontend kann Backend nicht erreichen"
- CORS_ORIGIN korrekt gesetzt?
- Vite Proxy configured?
- Backend Port 3001 offen?

---

## 📞 Claude bekommen für Phase 2

Wenn du mit Claude Phase 2 implementieren möchtest, gib ihm diese Anleitung:

```
Lese diese Datei: PHASE_2_GUIDE.md
Folge den Schritten in der "Implementation Checklist".
Implementiere Feature 1 (Email-Invites) zuerst.
Nutze die Code Standards.
Teste jeden Schritt mit den Test-Befehlen.
Commit nach jedem Feature mit aussagekräftiger Message.
```

---

## ✅ Ready für Phase 2?

Checklist bevor du startest:
- [ ] Repo geclonet
- [ ] Branch: `claude/phase-2-features` (oder dein Name)
- [ ] `backend/.env` editiert mit Secrets
- [ ] Dependencies installiert: `npm install`
- [ ] Docker auf dem Rechner funktioniert
- [ ] Diese Anleitung gelesen & verstanden

🚀 **Let's go! Viel Erfolg mit Phase 2!**

---

**Gemacht von Claude Code** — Letzte Update: 2026-04-28
