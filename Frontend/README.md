# ChatApp Frontend

## Entwicklung

```bash
yarn install
yarn start
```

Weitere Prüfungen:

```bash
yarn lint
yarn test
yarn build
yarn format:check
```

## OpenAPI-Client

Das Backend muss auf `http://localhost:8080` laufen. Anschließend:

```bash
yarn openapi:refresh
```

Der Befehl lädt die aktuelle OpenAPI-Spezifikation und generiert den
TypeScript-Angular-Client neu.

Generierte Dateien unter `src/app/generated/api` sollten nicht manuell
bearbeitet werden. Die gespeicherte Spec und der daraus erzeugte Client werden
gemeinsam versioniert, damit ein frischer Clone direkt kompilierbar bleibt.

## Umgebungen

Die REST- und WebSocket-Adressen liegen unter `src/environments`:

- Development: `environment.development.ts`
- Production: `environment.ts`

Der Development-Build verwendet `http://localhost:8080`. Der Production-Build
verwendet standardmäßig denselben Host wie das Frontend und erwartet einen
Reverse Proxy für `/api`, `/uploads` und `/ws`.
