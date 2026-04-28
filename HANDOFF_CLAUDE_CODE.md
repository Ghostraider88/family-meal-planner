# Handoff: Essensplan App — Full-Stack MVP

## 🎯 Projekt-Übersicht

**Essensplan App** = Familien-Meal-Planner mit Einkaufslisten-Integration.

- **Frontend:** React (responsive, Mobile-First)
- **Backend:** Node.js + Express REST API
- **Datenbank:** PostgreSQL
- **Deployment:** Docker + Docker-Compose
- **Authentifizierung:** JWT + bcrypt
- **Reverse Proxy:** HAProxy (auf OpenSense Firewall)

**Fidelity:** High-Fidelity (Pixel-Perfect Design bereits definiert)

---

## 📋 MVP-Scope (Phase 1 - Diese Phase)

**MUSS enthalten:**
- ✅ User Management (Register/Login/JWT)
- ✅ Recipe Management (CRUD)
- ✅ Weekly Meal Planner (Wochenplan mit 4 Mahlzeitstypen)
- ✅ Shopping Lists (Multi-Store, kategorisiert, Checkbox)
- ✅ Multi-User Sharing (Familie teilt Listen)
- ✅ Responsive Mobile + Desktop UI

**Nicht in Phase 1:**
- ❌ Recipe Import/Scraping (Hello Fresh, Chefkoch)
- ❌ Smart Recommendations (Angebot-Vorschläge)
- ❌ Wochenplan-KI (basierend auf Historie)
- ❌ Instagram-Feed Integration
- ❌ Public REST API (optional später)

---

## 🏗️ Architektur - Modular & Erweiterbar

```
essensplan-app/
├── docker-compose.yml          # 3 Services: Frontend, Backend, DB
├── frontend/
│   ├── src/
│   │   ├── components/         # Wiederverwendbar
│   │   ├── pages/              # 5 Screens
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── services/           # API Calls
│   │   ├── context/            # Auth + App State
│   │   ├── utils/              # Helper
│   │   └── styles/             # Global CSS
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── routes/             # API Endpoints
│   │   │   ├── auth.js         # Register/Login
│   │   │   ├── recipes.js      # Recipe CRUD
│   │   │   ├── meals.js        # Meal Plan CRUD
│   │   │   ├── shopping.js     # Shopping List CRUD
│   │   │   └── users.js        # User Management
│   │   ├── middleware/         # JWT Auth, Error Handler
│   │   ├── models/             # Database Models (Sequelize/TypeORM)
│   │   ├── controllers/        # Business Logic
│   │   ├── services/           # DB Queries (Clean Layer)
│   │   ├── config/             # DB, Env
│   │   └── app.js              # Express App
│   └── Dockerfile
│
├── database/
│   ├── init.sql                # Schema + Seed Data
│   └── migrations/             # Future: Migrations
│
└── docs/
    ├── API.md                  # REST API Docs
    ├── DATABASE.md             # Schema
    ├── ARCHITECTURE.md         # Tech Decisions
    └── FUTURE_FEATURES.md      # Phase 2, 3, etc.
```

---

## 🔧 Tech Stack (Minimal, Production-Ready)

| Layer | Tech | Grund |
|-------|------|-------|
| Frontend | React 18 + Vite | Modern, schnell |
| Backend | Node.js + Express | Einfach, robust |
| Database | PostgreSQL | Zuverlässig, Beziehungen |
| ORM | Sequelize oder TypeORM | Migrations, Models |
| Auth | JWT + bcrypt | Stateless, sicher |
| API | REST | Standard, HAProxy-freundlich |
| Container | Docker + Docker-Compose | Self-hosted ready |

---

## 🗄️ Datenbankschema (PostgreSQL)

```sql
-- Users (mit Familie-Konzept)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  family_id UUID REFERENCES families(id),
  name VARCHAR NOT NULL,
  role ENUM ('owner', 'member') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Families (für Sharing)
CREATE TABLE families (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recipes (pro Familie)
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  name VARCHAR NOT NULL,
  time_minutes INT,
  servings INT,
  difficulty VARCHAR,
  ingredients JSONB,  -- [{name, amount, unit}]
  instructions JSONB, -- [step1, step2, ...]
  tags JSONB,         -- ['vegetarisch', 'schnell']
  source VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- MealPlans (Wochenplan)
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  date DATE NOT NULL,
  meal_type ENUM ('breakfast', 'lunch', 'snack', 'dinner'),
  recipe_id UUID REFERENCES recipes(id),
  custom_name VARCHAR,
  for_people VARCHAR,  -- 'Alle', 'Kinder', 'Erwachsene'
  created_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- ShoppingLists (pro Familie, pro Laden)
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  name VARCHAR NOT NULL,
  store VARCHAR,
  store_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- ShoppingItems
CREATE TABLE shopping_items (
  id UUID PRIMARY KEY,
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  quantity DECIMAL,
  unit VARCHAR,  -- 'kg', 'Stk', 'l', etc.
  category VARCHAR,
  price DECIMAL,
  checked BOOLEAN DEFAULT FALSE,
  item_order INT,  -- Für Drag-Drop Reihenfolge
  created_at TIMESTAMP
);

-- Audit Log (für Phase 2: History/Recommendations)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  action VARCHAR,  -- 'recipe_added_to_plan', 'item_purchased'
  data JSONB,
  created_at TIMESTAMP
);
```

---

## 🎨 Frontend Screens (React Pages)

| Screen | Route | Purpose |
|--------|-------|---------|
| Auth | `/` | Login/Register |
| Dashboard | `/dashboard` | Home, Quick Actions |
| Recipes | `/recipes` | Browse, Add, Edit |
| Recipe Detail | `/recipes/:id` | Ingredients, Instructions, "Add to Week" |
| Meal Planner | `/week` | Weekly View, Add Meals |
| Meal Editor | `/week/:date/:type` | Select Recipe or Custom Entry |
| Shopping | `/shopping` | Lists, Items, Store Mode |

---

## 🔐 Authentifizierung

```
1. User registriert sich: POST /api/auth/register
   - Email, Password → Password Hash (bcrypt)
   - Family Auto-erstellt
   - JWT Token zurück

2. User loggt ein: POST /api/auth/login
   - Email, Password → Verify Hash
   - JWT Token + Refresh Token zurück

3. Jede API-Anfrage: Header: "Authorization: Bearer <JWT>"
   - Middleware prüft Token
   - user_id + family_id aus Token extrahiert
   - Request mit User-Context weitergeleitet

4. Token Refresh: POST /api/auth/refresh
   - Refresh Token → neuer JWT Token
```

---

## 📡 REST API Endpoints (MVP)

### Auth
```
POST /api/auth/register        # {email, password}
POST /api/auth/login           # {email, password}
POST /api/auth/refresh         # {refresh_token}
POST /api/auth/logout          # {}
```

### Recipes (CRUD)
```
GET    /api/recipes            # List all (family's)
POST   /api/recipes            # Create
GET    /api/recipes/:id        # Detail
PUT    /api/recipes/:id        # Update
DELETE /api/recipes/:id        # Delete
```

### Meal Plans
```
GET    /api/meals?week=2024-18 # Week View
POST   /api/meals              # Add Meal
PUT    /api/meals/:id          # Update
DELETE /api/meals/:id          # Delete
```

### Shopping Lists
```
GET    /api/shopping-lists     # All Lists
POST   /api/shopping-lists     # Create List
PUT    /api/shopping-lists/:id # Update (name, store, store_mode)
DELETE /api/shopping-lists/:id # Delete

GET    /api/shopping-lists/:id/items  # Items in List
POST   /api/shopping-lists/:id/items  # Add Item
PUT    /api/shopping-items/:id        # Update Item (quantity, unit, checked, order)
DELETE /api/shopping-items/:id        # Delete Item
```

### Users (Sharing)
```
GET    /api/users/me           # Current User
PUT    /api/users/me           # Update Profile
GET    /api/family/members     # Family Members
POST   /api/family/invite      # Invite Member (Email)
DELETE /api/family/members/:id # Remove Member
```

---

## 🚀 Deployment Plan

### Phase 1: Lokal Entwickeln
```bash
cd essensplan-app
docker-compose up -d
# Frontend: http://localhost:3000
# API: http://localhost:3001
# DB: postgres://localhost:5432
```

### Phase 2: Auf deinem Server
```bash
1. Git Clone auf Server
2. .env konfigurieren (DB_URL, JWT_SECRET, etc.)
3. docker-compose build
4. docker-compose up -d
5. HAProxy konfigurieren:
   - Frontend: example.com → http://localhost:3000
   - API: example.com/api → http://localhost:3001
6. SSL (Let's Encrypt)
7. Fertig!
```

---

## 🔮 Phase 2-3 (Später, Modular Erweiterbar)

### Phase 2: Smart Recommendations
- `services/recommendations/` — AI-basierte Vorschläge
- Audit-Log verwenden (bisherige Einkäufe, Rezepte)
- Wochenplan-Vorschläge basierend auf History

### Phase 3: External Feeds
- `services/scraper/` — Hello Fresh, Chefkoch, REWE Angebote
- Cron Jobs für Samstags-Updates
- `routes/feeds.js` — API für Vorschläge
- Notifications an User

### Phase 4: Public API
- Eigene REST API für externe Apps
- API Keys für Authentifizierung
- Rate Limiting
- Documentation (OpenAPI/Swagger)

---

## 📝 Implementierungs-Reihenfolge (Token-Effizient)

**Session 1:** Auth + Database Setup
- User Table, Password Hashing
- Login/Register Endpoints
- JWT Middleware

**Session 2:** Core API (Recipes + Meals)
- Recipe CRUD
- Meal Plan CRUD
- Tests mit Postman

**Session 3:** Frontend Auth + Recipes
- Login/Register UI (bereits designed)
- Recipe List, Detail
- Add to Week Flow

**Session 4:** Shopping Lists
- Shopping List CRUD API
- Frontend: Lists, Items, Drag-Drop
- Store Mode Mobile

**Session 5:** Polish + Docker
- Error Handling
- Validation
- Docker Setup
- API Documentation

---

## 🔗 Design-Referenz

**HTML Prototypes in diesem Projekt:**
- `Essensplan App.html` — Komplettes High-Fidelity Design
  - Alle Screens
  - Colors, Typography, Spacing (smapOne Design System)
  - Mobile + Desktop Responsive
  - Interaktive States

**Zu Implementation:** Dieses Design 1:1 in React Components umsetzen.

---

## ✅ Checkliste für Claude Code

- [ ] Node.js + Express Projekt initialisiert
- [ ] PostgreSQL Docker Container konfiguriert
- [ ] Sequelize oder TypeORM Setup
- [ ] Database Schema erstellt + Seed Data
- [ ] Auth Endpoints (Register/Login/JWT)
- [ ] Recipe CRUD Endpoints
- [ ] Meal Plan CRUD Endpoints
- [ ] Shopping List CRUD Endpoints
- [ ] React Frontend mit Auth Context
- [ ] Recipe Components + Pages
- [ ] Meal Planner Components
- [ ] Shopping List Components
- [ ] Mobile Responsiveness
- [ ] Docker-Compose fertig
- [ ] API Documentation (Postman/Swagger)
- [ ] Deployment Guide für Self-Hosted

---

## 💡 Wichtige Designentscheidungen

1. **Modular:** Alles in separaten `routes/` und `services/` — später leicht neue Features hinzufügen
2. **Stateless API:** JWT = keine Sessions, ideal für Scaling
3. **Family-Konzept:** Familie = Sharing-Unit, nicht jeder Nutzer einzeln
4. **Audit Log:** Bereits strukturiert für Phase 2 (Recommendations)
5. **JSON Felder:** Ingredients, Instructions als JSONB = flexibel + querybar

---

## 🎯 Ziel für Claude Code

**Eine fertige, deployable App nach Phase 1 mit:**
- ✅ Authentifizierung
- ✅ Vollständiger API
- ✅ React Frontend (HD Design)
- ✅ Docker Setup
- ✅ Dokumentation für Phase 2+3

**Dann später:** Recommendations, Feeds, Public API — alles vorbereitet.
