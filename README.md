# spec-data

Storage branch for the last-reviewed Digital Samba OpenAPI spec (`openapi-stored.yaml`).
Used by the `check-updates` workflow on `main` to diff against the live spec.
Kept off `main` so skill installs (submodule checkouts of `main`) stay lean.

To update after reviewing spec changes:
```bash
curl -s https://developer.digitalsamba.com/rest-api/openapi.yaml -o openapi-stored.yaml
git commit -am "update stored spec" && git push origin spec-data
```
