# ChatAppFrontend

OpenAPI spec:
```bash
mkdir -p src/api-spec
curl http://localhost:8080/v3/api-docs -o src/api-spec/openapi.json
```

API-Client generieren:
```bash
npx openapi-generator-cli generate \
  -i src/api-spec/openapi.json \
  -g typescript-angular \
  -o src/app/generated/api \
  --additional-properties=providedInRoot=true
```
