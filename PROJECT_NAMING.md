# Project Naming — FamilyMealPlanner

## Official Names

**GitHub Repository:** `family-meal-planner`
**App Name:** `FamilyMealPlanner`
**Domain:** `familymealplanner.de` (später optional)
**Docker Images:**
- Frontend: `family-meal-planner-frontend:latest`
- Backend: `family-meal-planner-api:latest`
- Database: (standard postgres:15-alpine)

---

## Directory Structure

```
family-meal-planner/
├── README.md                    # Project Overview
├── ARCHITECTURE.md              # Tech Stack & Design Decisions
├── SETUP.md                     # Local Development Setup
├── docker-compose.yml           # Production Docker Setup
├── .env.example                 # Environment Variables Template
├── .gitignore
├── LICENSE (MIT)
│
├── frontend/                    # React App
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .dockerignore
│
├── backend/                     # Express API
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── recipes.js
│   │   │   ├── meals.js
│   │   │   ├── shopping.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── config/
│   │   └── app.js
│   ├── tests/
│   └── .dockerignore
│
├── database/
│   ├── init.sql                 # Schema + Seed Data
│   └── migrations/              # Future: DB Migrations
│
└── docs/
    ├── API.md                   # REST API Documentation
    ├── DATABASE.md              # Schema Details
    ├── DEPLOYMENT.md            # Docker & HAProxy Setup
    └── FUTURE_FEATURES.md       # Phase 2, 3, 4 Roadmap
```

---

## GitHub Setup Command

```bash
# Create repo locally
mkdir family-meal-planner
cd family-meal-planner
git init

# Add remote (nach GitHub Repo Erstellung)
git remote add origin https://github.com/YOUR_USERNAME/family-meal-planner.git
git branch -M main
git add .
git commit -m "Initial commit: Project structure & documentation"
git push -u origin main
```

---

## Package Names (npm)

**Frontend:** `family-meal-planner-frontend` (für separate Publication)
**Backend:** `family-meal-planner-api` (für separate Publication)
**CLI Tool (später):** `fmp-cli` (kurzes Alias)

---

## Environment Variables

```bash
# .env.example
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=family_meal_planner
DB_USER=fmp_user
DB_PASSWORD=your_secure_password

JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

NODE_ENV=development
PORT=3001
```

---

## Docker Naming

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    image: family-meal-planner-frontend:latest
    container_name: fmp-frontend
    ports:
      - "3000:3000"

  api:
    build: ./backend
    image: family-meal-planner-api:latest
    container_name: fmp-api
    ports:
      - "3001:3001"

  postgres:
    image: postgres:15-alpine
    container_name: fmp-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: family_meal_planner
      POSTGRES_USER: fmp_user
```

---

## HAProxy Config (openSense)

```
# /etc/haproxy/haproxy.cfg
frontend family-meal-planner
    bind *:80
    bind *:443 ssl crt /etc/ssl/familymealplanner.pem
    
    acl is_api path_beg /api
    
    use_backend fmp-api if is_api
    use_backend fmp-frontend if !is_api

backend fmp-frontend
    balance roundrobin
    server frontend localhost:3000 check

backend fmp-api
    balance roundrobin
    server api localhost:3001 check
```

---

## Social/Documentation Naming

- **GitHub Issues:** Label with `[fmp]` prefix
- **Commits:** `[fmp] Add recipe API endpoints`
- **Docs:** `FamilyMealPlanner Docs`
- **License:** MIT
- **Author:** Dein Name

---

## Ready to Go! 🚀

Du kannst jetzt das Repo anlegen:
1. GitHub → New Repository → `family-meal-planner`
2. Description: "Family meal planner with shopping lists, weekly planning & smart recommendations"
3. Clone lokal
4. Alle Dateien (Handoff, Design Reference, HTML) hinzufügen
5. Zu Claude Code pushen
6. Claude Code: Implementierung starten!
