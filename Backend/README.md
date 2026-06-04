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