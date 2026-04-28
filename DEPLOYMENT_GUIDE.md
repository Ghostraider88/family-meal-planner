# 🚀 Deployment Guide — Family Meal Planner

Vollständiger Guide zum Deployen der App lokal mit Docker und auf dem Server.

---

## 📋 Voraussetzungen

### Lokal entwickeln
- Docker Desktop installiert ([docker.com](https://www.docker.com/products/docker-desktop))
- Git
- Node.js 18+ (nur falls ohne Docker arbeiten)

### Auf einem Server deploynen
- Linux Server (Ubuntu 20.04+ empfohlen)
- Docker & Docker Compose installiert
- Domain + SSL-Zertifikat (optional, aber empfohlen)
- 2GB RAM minimum

---

## 🐳 Lokal mit Docker Starten

### 1. Repository klonen

```bash
git clone https://github.com/Ghostraider88/family-meal-planner.git
cd family-meal-planner
```

### 2. Environment-Variablen konfigurieren

```bash
# Backend .env für lokale Entwicklung (bereits vorhanden)
cat backend/.env

# Output:
# NODE_ENV=development
# DB_HOST=postgres
# SMTP_SERVICE=gmail
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

**Falls Email-Invites testen möchtest:**
- Gmail: [App Password generieren](https://support.google.com/accounts/answer/185833)
- Alternativ: Sendgrid/Mailgun verwenden (in `.env` SMTP_SERVICE anpassen)

### 3. Docker Container starten

```bash
# Build Images (beim ersten Mal)
docker-compose build

# Start Services im Background
docker-compose up -d

# Output:
# Creating family-meal-planner-db ... done
# Creating family-meal-planner-api ... done
# Creating family-meal-planner-ui ... done
```

### 4. Services prüfen

```bash
# Alle Container anzeigen
docker-compose ps

# Logs anschauen
docker-compose logs -f

# Backend Logs
docker-compose logs backend

# Frontend Logs
docker-compose logs frontend

# Database Logs
docker-compose logs postgres
```

### 5. App testen

```bash
# Frontend aufrufen
open http://localhost:3000

# Backend Health Check
curl http://localhost:3001/api/health

# Response:
# {"status":"ok"}
```

### 6. Ersten User erstellen

```bash
# 1. Im Browser zu http://localhost:3000 gehen
# 2. "Registrieren" klicken
# 3. Name, Email, Passwort eingeben
# 4. Account erstellt!
```

### 7. Features testen

```
✅ Register user
✅ Login/Logout
✅ Create recipe
✅ Add meal to week
✅ Create shopping list
✅ Invite family member (wenn SMTP konfiguriert)
```

### 8. Container stoppen

```bash
# Stop Services
docker-compose down

# Stop + Remove Volumes (DATABASE WIRD GELÖSCHT!)
docker-compose down -v
```

---

## 🖥️ Production Server Setup

### Schritt 1: Server vorbereiten

```bash
# Login auf Server
ssh user@your-server.com

# Docker installieren (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### Schritt 2: Repo klonen

```bash
# Zielverzeichnis erstellen
sudo mkdir -p /opt/family-meal-planner
cd /opt/family-meal-planner

# Repository klonen
sudo git clone https://github.com/Ghostraider88/family-meal-planner.git .

# Permissions setzen
sudo chown -R $USER:$USER /opt/family-meal-planner
```

### Schritt 3: Production Environment konfigurieren

```bash
# .env kopieren
cp backend/.env.example backend/.env

# Mit Production-Secrets editieren
nano backend/.env
```

**Production .env Beispiel:**
```env
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=family_meal_planner_prod
DB_USER=planner_prod_user
DB_PASSWORD=VERY_STRONG_RANDOM_PASSWORD_HERE
JWT_SECRET=GENERATE_WITH: openssl rand -base64 32
JWT_REFRESH_SECRET=GENERATE_WITH: openssl rand -base64 32
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
SMTP_SERVICE=gmail
SMTP_USER=your-app-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Secrets generieren:**
```bash
# JWT Secrets
openssl rand -base64 32
openssl rand -base64 32

# Database Password (min 20 chars)
openssl rand -base64 20
```

### Schritt 4: Docker Compose für Production

```bash
# Production docker-compose.yml erstellen
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: family-meal-planner-db
    environment:
      POSTGRES_DB: family_meal_planner_prod
      POSTGRES_USER: planner_prod_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U planner_prod_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: family-meal-planner-api
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: family_meal_planner_prod
      DB_USER: planner_prod_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      FRONTEND_URL: ${FRONTEND_URL}
      SMTP_SERVICE: ${SMTP_SERVICE}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    command: npm start

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: family-meal-planner-ui
    environment:
      VITE_API_URL: https://your-domain.com/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
    command: npm run build && npm run preview

volumes:
  postgres_data:

networks:
  default:
    name: family-meal-planner-network
EOF
```

### Schritt 5: Build & Start

```bash
# Build (takes 2-5 minutes)
docker-compose -f docker-compose.prod.yml build

# Start Services
docker-compose -f docker-compose.prod.yml up -d

# Check Status
docker-compose -f docker-compose.prod.yml ps

# View Logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Schritt 6: Reverse Proxy (HAProxy / Nginx)

#### Mit Nginx:

```bash
# Nginx installieren
sudo apt-get install nginx

# Config erstellen
sudo nano /etc/nginx/sites-available/family-meal-planner
```

```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Zertifikat (siehe Let's Encrypt Setup unten)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable config
sudo ln -s /etc/nginx/sites-available/family-meal-planner /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Schritt 7: SSL mit Let's Encrypt

```bash
# Certbot installieren
sudo apt-get install certbot python3-certbot-nginx

# Zertifikat generieren
sudo certbot certonly --nginx -d your-domain.com

# Auto-Renew einrichten
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Schritt 8: Datenbank Backup einrichten

```bash
# Backup Script erstellen
cat > /opt/family-meal-planner/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/family-meal-planner/backups"
mkdir -p $BACKUP_DIR
docker exec family-meal-planner-db pg_dump -U planner_prod_user family_meal_planner_prod > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /opt/family-meal-planner/backup.sh

# Cron Job für täglich 2 AM
crontab -e
# Hinzufügen: 0 2 * * * /opt/family-meal-planner/backup.sh
```

---

## 🔄 Updates & Maintenance

### Update auf neue Version

```bash
cd /opt/family-meal-planner

# Latest code ziehen
git pull origin main

# Neu bauen
docker-compose -f docker-compose.prod.yml build

# Neue Version starten (alte werden gestoppt)
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs backend | head -20
```

### Problembehebung

#### Container crasht

```bash
# Logs anschauen
docker-compose logs backend

# Container neu starten
docker-compose restart backend

# Oder komplett neustarten
docker-compose down
docker-compose up -d
```

#### Datenbank-Fehler

```bash
# DB Container logs
docker-compose logs postgres

# DB neu initialisieren (VORSICHT: Daten weg!)
docker-compose down -v
docker-compose up -d
```

#### Frontend lädt nicht

```bash
# Frontend neu bauen
docker-compose build frontend
docker-compose up -d frontend

# Cache leeren
rm -rf frontend/dist
docker-compose build --no-cache frontend
```

---

## 📊 Monitoring

### Basic Health Check

```bash
# Health Status abrufen
curl https://your-domain.com/api/health

# Backend uptime
docker-compose stats backend

# Database Status
docker exec family-meal-planner-db psql -U planner_prod_user -c "SELECT version();"
```

### Log Rotation

```bash
# Docker Log Limits einstellen
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Docker neustarten
sudo systemctl restart docker
```

---

## 🚨 Production Checkliste

- [ ] `.env` mit Production-Secrets gesichert
- [ ] SSL-Zertifikat installiert (HTTPS)
- [ ] Database Backups konfiguriert
- [ ] Backup Restore getestet
- [ ] Monitoring Setup (logs, uptime)
- [ ] Email funktioniert (test invite senden)
- [ ] Performance getestet (ab, Apache Bench)
- [ ] Security: CORS origin korrekt
- [ ] Security: JWT secrets sind random
- [ ] DB Password stark (20+ chars)

---

## 📞 Support

**Probleme?**
1. Logs anschauen: `docker-compose logs -f`
2. PHASE_2_GUIDE.md lesen (Troubleshooting Sektion)
3. GitHub Issues: https://github.com/Ghostraider88/family-meal-planner/issues

---

**Happy Deploying! 🎉**

Made with ❤️ by Claude Code — 2026-04-28
