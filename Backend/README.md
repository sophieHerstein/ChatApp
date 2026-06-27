# ChatApp Backend

## Entwicklung

Datenbank starten:

```bash
docker compose up -d
```

Backend starten:

```bash
mvn spring-boot:run
```

Die Anwendung verwendet Java 21 und PostgreSQL auf Port `5433`.

Demo-Daten aktivieren:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

Die Demo-Nutzer `sophie`, `alex`, `mia` und `noah` verwenden alle das Passwort
`Demo123!`. Der Seeder ist idempotent und läuft ausschließlich im Profil
`demo`.

Die erlaubte Frontend-Origin kann konfiguriert werden:

```bash
APP_CORS_ALLOWED_ORIGINS=http://localhost:4200 mvn spring-boot:run
```

Mehrere Origins werden kommasepariert angegeben.

## Code Quality

Dieses Projekt nutzt Maven-basierte Tools für Formatierung und statische Analyse.

### Tools

- Spotless: Code Formatter, ähnlich wie Prettier
- Checkstyle: Code-Style-Prüfung, ähnlich wie ESLint-Regeln
- SpotBugs: Statische Analyse zur Erkennung potenzieller Bugs

### Kommandos

Code automatisch formatieren:

```bash
mvn spotless:apply
```

Formatierung prüfen:

```bash
mvn spotless:check
```

Checkstyle ausführen:

```bash
mvn checkstyle:check
```

SpotBugs ausführen:

```bash
mvn spotbugs:check
```

Tests und alle Quality Checks ausführen:

```bash
mvn clean verify
```

Anwendung starten:

```bash
mvn spring-boot:run
```

Hinweis: Der Maven Wrapper ist in diesem Repository derzeit nicht vollständig
vorhanden. Deshalb werden die Beispiele mit einem lokal installierten `mvn`
ausgeführt.
