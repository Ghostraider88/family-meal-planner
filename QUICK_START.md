# ⚡ Quick Start — Lokal mit Docker

Die schnellste Weise, die App lokal zum Laufen zu bekommen: **5 Minuten**.

---

## 🚀 Los geht's!

### 1. Repository klonen
```bash
git clone https://github.com/Ghostraider88/family-meal-planner.git
cd family-meal-planner
```

### 2. Docker starten
```bash
docker-compose up -d
```

Das ist es! Services starten automatisch:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** PostgreSQL auf localhost:5432

### 3. Im Browser öffnen
```
http://localhost:3000
```

### 4. Registrieren & Spielen
1. Klick auf "Registrieren"
2. Email, Passwort, Name eingeben
3. Account erstellt! Du bist automatisch angemeldet

### 5. Features testen
- ✅ Rezepte erstellen
- ✅ Wochenplan planen
- ✅ Einkaufslisten erstellen
- ✅ Familie einladen (wenn Email konfiguriert)

---

## 🛑 Stoppen

```bash
docker-compose down
```

Alle Container stoppen. Daten bleiben in der Database.

---

## 🔧 Probleme?

### Ports bereits in Benutzung
```bash
# Change ports in docker-compose.yml
# Dann erneut: docker-compose up -d
```

### Container crasht
```bash
docker-compose logs backend  # Logs anschauen
docker-compose restart backend  # Neustarten
```

### Fresh Start (Daten werden gelöscht!)
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📚 Mehr Infos

- **Detailliertes Setup:** `DEPLOYMENT_GUIDE.md`
- **Deployment auf Server:** `DEPLOYMENT_GUIDE.md` → "Production Server Setup"
- **Phase 2 Features:** `PHASE_2_GUIDE.md`
- **API Dokumentation:** `README.md`

---

**Happy coding!** 🎉

Made with ❤️ by Claude Code
