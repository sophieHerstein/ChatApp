# ChatApp

ChatApp ist eine lokale Full-Stack-Chat-Anwendung mit Angular, Spring Boot,
PostgreSQL und STOMP-WebSockets.

## Voraussetzungen

- Java 21
- Maven 3.9+
- Node.js 20.19+, 22.12+ oder 24+
- Yarn
- Docker mit Docker Compose

## Anwendung starten

### 1. Datenbank

```bash
cd Backend
docker compose up -d
```

PostgreSQL läuft anschließend auf Port `5433`. Liquibase führt die
Datenbankmigrationen beim Backend-Start automatisch aus.

### 2. Backend

```bash
cd Backend
mvn spring-boot:run
```

Das Backend ist unter `http://localhost:8080` erreichbar. Die Swagger UI liegt
unter `http://localhost:8080/swagger-ui/index.html`.

### Optional: Backend mit Demo-Daten

```bash
cd Backend
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

Das Profil legt beim ersten Start reproduzierbare Nutzer, Kontakte, Chats und
Nachrichten an. Weitere Starts erzeugen keine Duplikate.

| Nutzer   | Passwort   |
| -------- | ---------- |
| `sophie` | `Demo123!` |
| `alex`   | `Demo123!` |
| `mia`    | `Demo123!` |
| `noah`   | `Demo123!` |

`noah` demonstriert einen verborgenen Online-Status. Der Account `sophie`
enthält unter anderem eine ungelesene Nachricht von `alex`.

### 3. Frontend

Zuerst Abhängigkeiten installieren:

```bash
cd Frontend
yarn install
```

Nach Änderungen an REST-Endpunkten den Client aktualisieren, während das Backend
läuft:

```bash
yarn openapi:refresh
```

Anschließend:

```bash
yarn start
```

Das Frontend ist unter `http://localhost:4200` erreichbar.

Für einen Echtzeittest mit zwei Nutzern können zwei getrennte Browserprofile
oder ein normales und ein privates Browserfenster verwendet werden.

Formatierung:

```bash
cd Backend
mvn spotless:apply

cd ../Frontend
yarn format
```

## OpenAPI-Client aktualisieren

Das Backend muss dafür laufen:

```bash
cd Frontend
yarn openapi:refresh
```

Der generierte Angular-Client liegt unter `Frontend/src/app/generated/api`.
Spec und Client werden gemeinsam versioniert. Generierte Dateien dürfen nicht
manuell bearbeitet werden.

## Architektur in Kürze

- HTTP lädt Benutzer, Chatlisten und den bisherigen Nachrichtenverlauf.
- WebSockets übertragen Presence, neue Nachrichten und Lesebestätigungen.
- Nur das JWT wird lokal gespeichert. Der aktuelle Nutzer wird beim App-Start
  über `GET /api/users/me` aus dem Backend geladen.
- Nachrichten verwenden eine Client-ID, damit ein erneuter Sendeversuch keine
  Duplikate erzeugt.
- Benachrichtigungston und Browser-Benachrichtigungen werden pro Nutzer lokal
  gespeichert. Browser-Benachrichtigungen benötigen eine ausdrückliche
  Freigabe und außerhalb von `localhost` eine HTTPS-Verbindung.
- Die Sichtbarkeit von Online-Status und „zuletzt online“ wird serverseitig
  gespeichert und kann in den Einstellungen deaktiviert werden.
- Demo-Daten werden nur mit dem ausdrücklich aktivierten Spring-Profil `demo`
  erzeugt.

## Konfiguration

Die lokale Backend-Konfiguration liegt in
`Backend/src/main/resources/application.yaml`.

Relevante Backend-Umgebungsvariablen:

| Variable                   | Standardwert                  |
| -------------------------- | ----------------------------- |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:4200`       |
| `JWT_SECRET`               | lokaler Development-Schlüssel |
| `JWT_EXPIRATION`           | `3600000`                     |

Mehrere erlaubte Origins werden kommasepariert angegeben:

```bash
APP_CORS_ALLOWED_ORIGINS=https://chat.example.com,https://admin.example.com \
JWT_SECRET=replace-with-a-secure-production-secret \
mvn spring-boot:run
```

Die Frontend-Konfiguration liegt unter `Frontend/src/environments`:

- `environment.development.ts` verwendet das lokale Backend auf Port `8080`.
- `environment.ts` verwendet für Produktions-Builds denselben Host wie das
  ausgelieferte Frontend. REST und WebSockets sollten dort über einen Reverse
  Proxy an das Backend weitergeleitet werden.

Für ein getrennt gehostetes Backend können `apiBaseUrl` und `websocketUrl` in
der passenden Environment-Datei angepasst werden.

Produktive Secrets und Datenbankzugänge sollten vor einem Deployment ebenfalls
über Umgebungsvariablen beziehungsweise Spring-Profile konfiguriert werden.