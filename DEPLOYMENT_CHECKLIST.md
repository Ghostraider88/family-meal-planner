# 🚀 Deployment Checklist

Verwende diese Checkliste, um sicherzustellen, dass alles vor dem Deployment bereit ist.

---

## 📋 Vor dem Lokal Testen (Docker)

### Vorbereitung
- [ ] Repository geforkt/geklont
- [ ] Branch: `claude/build-family-meal-planner-gaixR`
- [ ] Node.js 18+ installiert (optional, für lokale Entwicklung)
- [ ] Docker Desktop installiert und läuft
- [ ] `docker --version` funktioniert
- [ ] `docker-compose --version` funktioniert

### Konfiguration
- [ ] `backend/.env` vorhanden (from `.env.example`)
- [ ] `SMTP_SERVICE` gesetzt (gmail, sendgrid, etc.)
- [ ] `SMTP_USER` mit echtem Email-Account
- [ ] `SMTP_PASSWORD` korrekt (Gmail: App Password, nicht Passwort)
- [ ] `JWT_SECRET` ist nicht "your-secret" (random string)
- [ ] `CORS_ORIGIN` = `http://localhost:3000`
- [ ] `DB_PASSWORD` nicht default (egal lokal, aber good practice)

### Abhängigkeiten
- [ ] `npm install` im `/backend` durchgeführt
- [ ] `npm install` im `/frontend` durchgeführt
- [ ] Alle Dependencies installiert (check `package-lock.json`)

---

## 🐳 Docker Build & Start

### Build Phase
- [ ] `docker-compose build` erfolgreich (kein Error)
- [ ] Beide Images gebaut: `backend` und `frontend`
- [ ] Postgres Image gedownloadet
- [ ] Build logs anschauen für Warnungen

### Start Phase
- [ ] `docker-compose up -d` startet alle Services
- [ ] Alle 3 Container laufen: `docker ps` zeigt 3 running containers
- [ ] Keine Container crashen nach 30 Sekunden

### Health Checks
- [ ] `docker-compose logs postgres` — "server started" message
- [ ] `docker-compose logs backend` — "🚀 Server running"
- [ ] `docker-compose logs frontend` — "Network: http://localhost:3000"
- [ ] `curl http://localhost:3001/api/health` returns `{"status":"ok"}`

---

## 🧪 Feature Tests (im Browser)

### Auth Flow
- [ ] `http://localhost:3000` zeigt Login-Screen
- [ ] Registrieren-Link funktioniert
- [ ] Registrierung mit Email/Password/Name funktioniert
- [ ] Nach Registrierung zum Dashboard redirected
- [ ] Dashboard zeigt "Willkommen, [Name]"
- [ ] Logout Button existiert und funktioniert
- [ ] Nach Logout zurück zu Login

### Recipes Feature
- [ ] `/recipes` Seite lädt
- [ ] Neues Rezept-Form sichtbar
- [ ] Rezept erstellen funktioniert
- [ ] Rezept in der Liste angezeigt
- [ ] Rezept-Link klickbar

### Meal Planning
- [ ] `/week` Seite lädt
- [ ] Woche angezeigt
- [ ] Kann zu Woche navigieren

### Shopping Lists
- [ ] `/shopping` Seite lädt
- [ ] Neue Liste erstellen funktioniert
- [ ] Liste in der Liste angezeigt

### Family Management (Phase 2)
- [ ] `/family` Seite lädt
- [ ] "+ Einladen" Button vorhanden
- [ ] Modal öffnet sich beim Klick
- [ ] Email-Input akzeptiert Email
- [ ] Einladung senden Button funktioniert
- [ ] Error/Success Nachricht angezeigt
- [ ] Familie Members List nicht leer (mindestens du selbst)

---

## 🔧 API Tests

### Mit Postman oder curl

```bash
# 1. Registrieren
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.de",
    "password":"test123456",
    "name":"Test User"
  }'
# [ ] Returns token + user data
# [ ] Token speichern für nächste Requests

# 2. Recipes abrufen
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://localhost:3001/api/recipes
# [ ] Returns empty array [] oder Rezepte

# 3. Rezept erstellen
curl -X POST http://localhost:3001/api/recipes \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Spaghetti",
    "time_minutes":30,
    "servings":4,
    "difficulty":"easy"
  }'
# [ ] Returns created recipe with ID

# 4. Einladung testen (optional, nur wenn SMTP funktioniert)
curl -X POST http://localhost:3001/api/users/family/invite \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"friend@test.de"
  }'
# [ ] Returns success message (oder error wenn SMTP nicht configured)
```

---

## 🌐 Production Checklist (Nur bei Deployment)

### Server Vorbereitung
- [ ] VPS/Server mit mindestens 2GB RAM
- [ ] Ubuntu 20.04 oder neuer
- [ ] SSH Access funktioniert
- [ ] `sudo` Zugang vorhanden

### Docker Installation
- [ ] `curl -fsSL https://get.docker.com -o get-docker.sh` ausgeführt
- [ ] Docker installiert: `docker --version` funktioniert
- [ ] Docker Compose installiert: `docker-compose --version` funktioniert
- [ ] User in docker group: `groups $USER` zeigt docker

### Repo & Config
- [ ] Repository auf `/opt/family-meal-planner` geklont
- [ ] `backend/.env` mit Production-Secrets erstellt:
  - [ ] Neue `JWT_SECRET` (aus `openssl rand -base64 32`)
  - [ ] Neue `JWT_REFRESH_SECRET` (aus `openssl rand -base64 32`)
  - [ ] Neue `DB_PASSWORD` (min 20 chars, sehr stark)
  - [ ] `DB_NAME` auf "family_meal_planner_prod" geändert
  - [ ] `DB_USER` auf "planner_prod_user" geändert
  - [ ] `CORS_ORIGIN` auf `https://your-domain.com`
  - [ ] `FRONTEND_URL` auf `https://your-domain.com`
  - [ ] SMTP mit echtem Email-Account konfiguriert
  - [ ] Alle Secrets sind NICHT Default-Werte

### DNS & Domain
- [ ] Domain zeigt auf Server IP (A Record)
- [ ] DNS Propagation abgewartet (~10 min)
- [ ] `nslookup your-domain.com` zeigt richtige IP

### SSL Zertifikat
- [ ] Let's Encrypt Zertifikat generiert mit Certbot
- [ ] Zertifikat in `/etc/letsencrypt/live/your-domain.com/`
- [ ] Certbot auto-renew konfiguriert
- [ ] Test renewal erfolgreich: `certbot renew --dry-run`

### Reverse Proxy (Nginx)
- [ ] Nginx config erstellt und aktiviert
- [ ] `sudo nginx -t` zeigt "ok"
- [ ] Frontend Proxy auf `:3000` konfiguriert
- [ ] API Proxy auf `:3001` konfiguriert
- [ ] HTTPS redirect von HTTP konfiguriert
- [ ] Nginx gestartet und enabled: `sudo systemctl enable nginx`

### Docker Containers
- [ ] `docker-compose build` erfolgreich
- [ ] `docker-compose up -d` startet alle Container
- [ ] `docker-compose ps` zeigt 3 running
- [ ] `docker-compose logs backend | grep "Server running"` erfolgreich
- [ ] `curl http://localhost:3001/api/health` funktioniert
- [ ] `curl http://localhost:3000` zeigt React App

### Firewall & Sicherheit
- [ ] UFW Firewall Port 80 offen: `sudo ufw allow 80`
- [ ] UFW Firewall Port 443 offen: `sudo ufw allow 443`
- [ ] SSH Port offen (default 22): `sudo ufw allow 22`
- [ ] UFW aktiv: `sudo ufw enable`
- [ ] Nur Frontend+API öffentlich, Database privat (5432 nur localhost)

### Backup
- [ ] Backup Script erstellt: `/opt/family-meal-planner/backup.sh`
- [ ] Backup Script executable: `chmod +x backup.sh`
- [ ] Cron job erstellt: `0 2 * * * /opt/family-meal-planner/backup.sh`
- [ ] Test backup durchgeführt: `./backup.sh`
- [ ] Backup Datei vorhanden: `ls -la backups/`

### Final Tests
- [ ] `https://your-domain.com` zeigt Login-Screen
- [ ] Registrierung funktioniert
- [ ] Login funktioniert
- [ ] Rezept erstellen funktioniert
- [ ] Familie Invite funktioniert
- [ ] HTTPS lädt ohne Warnung (grünes Schloss)

---

## 🚨 Fallback Plan

Falls etwas schiefgeht:

### Container stürzen ab
```bash
docker-compose logs backend  # Fehler anschauen
docker-compose restart backend  # Neustarten
```

### Database Fehler
```bash
docker-compose down -v  # Alle Daten löschen (VORSICHT!)
docker-compose up -d  # Fresh start
```

### SMTP funktioniert nicht
- [ ] Gmail: [App Password](https://support.google.com/accounts/answer/185833) verwenden
- [ ] Alternative: Sendgrid API Key verwenden
- [ ] Fallback: Email-Invites können auch manuell gemacht werden

### Datenbank wiederherstellen
```bash
docker exec family-meal-planner-db psql -U planner_user \
  family_meal_planner < backup.sql
```

---

## ✅ Fertig Deployt!

Wenn alle Checkboxen ✅ sind:

🎉 **Herzlichen Glückwunsch! Die App läuft!**

Nächste Schritte:
- Mehr Benutzer einladen
- Phase 2 Feature 2 (Recipe Importing) implementieren
- Monitoring einrichten
- Regular Backups überprüfen

---

Made with ❤️ by Claude Code

Letzte Aktualisierung: 2026-04-28
