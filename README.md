# 🍽️ Family Meal Planner

Ein vollständiger Familien-Essensplan mit Einkaufslisten-Integration.

**Stack:** React + Express + PostgreSQL + Docker

## 📋 MVP Phase 1 - Funktionen

✅ Benutzer-Authentifizierung (JWT)
✅ Rezept-Verwaltung (CRUD)
✅ Wochenplan für Mahlzeiten
✅ Einkaufslisten mit Kategorien
✅ Multi-Benutzer / Familie-Sharing
✅ Responsive Mobile + Desktop UI

## 🚀 Schnelleinstieg mit Docker

```bash
# Clone & Setup
git clone <repo>
cd family-meal-planner

# Start alle Services (Frontend, Backend, DB)
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Datenbank: localhost:5432
```

### Ohne Docker (Lokal entwickeln)

```bash
# Backend
cd backend
npm install
npm run dev        # Läuft auf http://localhost:3001

# Frontend (neues Terminal)
cd frontend
npm install
npm run dev        # Läuft auf http://localhost:3000
```

## 📚 API Dokumentation

### Auth
```
POST /api/auth/register      # {email, password, name}
POST /api/auth/login         # {email, password}
POST /api/auth/refresh       # {refreshToken}
POST /api/auth/logout        # {}
```

### Rezepte
```
GET    /api/recipes          # Alle Rezepte
POST   /api/recipes          # Neues Rezept
GET    /api/recipes/:id      # Rezept-Detail
PUT    /api/recipes/:id      # Rezept aktualisieren
DELETE /api/recipes/:id      # Rezept löschen
```

### Mahlzeiten
```
GET    /api/meals            # Wochenplan
POST   /api/meals            # Mahlzeit hinzufügen
PUT    /api/meals/:id        # Mahlzeit aktualisieren
DELETE /api/meals/:id        # Mahlzeit löschen
```

### Einkaufslisten
```
GET    /api/shopping/lists                # Alle Listen
POST   /api/shopping/lists                # Neue Liste
PUT    /api/shopping/lists/:id            # Liste aktualisieren
DELETE /api/shopping/lists/:id            # Liste löschen

GET    /api/shopping/lists/:id/items      # Items einer Liste
POST   /api/shopping/lists/:id/items      # Item hinzufügen
PUT    /api/shopping/items/:id            # Item aktualisieren
DELETE /api/shopping/items/:id            # Item löschen
```

### Benutzer
```
GET    /api/users/me                      # Profil
PUT    /api/users/me                      # Profil aktualisieren
GET    /api/users/family/members          # Familienmitglieder
POST   /api/users/family/invite           # Einladung (Phase 2)
DELETE /api/users/family/members/:id      # Mitglied entfernen
```

## 🏗️ Projektstruktur

```
family-meal-planner/
├── backend/
│   ├── src/
│   │   ├── models/           # Database Models
│   │   ├── routes/           # API Routes
│   │   ├── middleware/       # Auth, Error Handler
│   │   ├── services/         # Business Logic
│   │   ├── config/           # DB Config
│   │   └── app.js            # Express App
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # React Pages
│   │   ├── components/       # Reusable Components
│   │   ├── context/          # Auth Context
│   │   ├── styles/           # CSS
│   │   ├── services/         # API Calls
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── docker-compose.yml
```

## 🛠️ Entwicklung

### Environment Variablen

Backend: `backend/.env`
```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=family_meal_planner
DB_USER=planner_user
DB_PASSWORD=secure_password_123
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testen der API

```bash
# Mit curl
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Mit Token Rezepte holen
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3001/api/recipes
```

## 📦 Phase 2+ (Geplant)

- Email-Einladungen
- Smart Recommendations (AI-basiert)
- Recipe Importing (Hello Fresh, Chefkoch, REWE)
- Notifications
- Public REST API
- Advanced Analytics

## 🔒 Sicherheit

- Passwörter gehashed mit bcryptjs
- JWT Token-basierte Auth (24h expiration)
- CORS konfigurierbar
- Environment Variables für Secrets

## 🐳 Production Deployment

1. `.env` mit Production-Secrets aktualisieren
2. `docker-compose build`
3. `docker-compose up -d`
4. HAProxy konfigurieren (optional)
5. SSL mit Let's Encrypt (optional)

## 📝 Lizenz

MIT - Free to use

---

**Made with ❤️ by Claude Code**
