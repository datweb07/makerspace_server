# Backend Deployment

## 1. Runtime and commands

The GitHub workflow builds on Ubuntu with Node.js 20. TypeScript targets ES2022/NodeNext. Because `package-lock.json` exists, CI runs `npm ci`.

| Command | Behavior |
|---|---|
| `npm run dev` | Nodemon watches source and runs `tsx src/index.ts` |
| `npm run build` | Removes `dist`, runs `tsc`, then `tsc-alias` |
| `npm start` | Runs `node dist/index.js` |
| `npm run lint` | ESLint repository |
| `npm run lint:fix` | ESLint with fixes |

Review result: `npx tsc --noEmit` passed; lint failed with 85 errors. No test command exists.

## 2. Environment contract

| Variable group | Variables | Operational meaning |
|---|---|---|
| Server URL | `PORT`, `BASE_PATH`, `SERVER_PROTOCOL`, `SERVER_DOMAIN` | Listen port, API/static prefix, absolute media URLs |
| DB fallback | `POSTGRES_DB_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB_PORT` | Shared fallback values |
| VI DB | `POSTGRES_DB_HOST_VI`, `POSTGRES_USER_VI`, `POSTGRES_PASSWORD_VI`, `POSTGRES_DB_VI` | Vietnamese pool |
| EN DB | `POSTGRES_DB_HOST_EN`, `POSTGRES_USER_EN`, `POSTGRES_PASSWORD_EN`, `POSTGRES_DB_EN` | English pool |
| Auth | `SESSION_TOKEN_SECRET`, `JWT_SECRET` | First is active; second is unused |
| Mail | `EMAIL_APP_USERNAME`, `EMAIL_APP_PASS`, `EMAIL_RECEIVER`, `CORS_ORIGIN` | Gmail credentials/receiver and verification-link origin |
| Sheets | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID` | Only unreachable controller uses them |
| Media | `MEDIA_UPLOAD_FOLDER` | Defaults to `public/static` |

`config.ts` contains defaults for DB credentials and token secrets. Production must override these and rotate any value ever used. `CORS_ORIGIN` builds the email link but does not control the runtime CORS allowlist. The repository has no `.env.example`; the local `.env` is ignored and its secret values must not enter documentation.

On non-Windows systems `BASE_PATH` defaults to `/makerspace_server`; Windows defaults to empty. Verify API prefix, static prefix, reverse proxy, and rewritten media URLs together.

## 3. Database readiness

There are no migrations and no startup connection test. Both language databases must be provisioned before deployment. Validate matching schema/columns, privileges, indexes, network/TLS, backup/restore, and connection capacity. Current configuration permits 500 connections per raw language pool per process and should be reduced to infrastructure limits.

## 4. Static and uploaded files

Startup creates `<cwd>/public`; static files are served from it. Default upload storage is `<cwd>/public/static/images`. Local state requires a persistent shared volume or object storage when scaling. Working directory must remain the application root.

The clean checkout currently lacks `public`, yet CI runs:

```text
zip -r deploy.zip dist public package.json package-lock.json
```

Track a placeholder or make packaging conditional so a clean build does not fail.

## 5. Actual CI/CD flow

```mermaid
flowchart LR
    Trigger["Push main or manual dispatch"] --> Checkout["Checkout"]
    Checkout --> Detect["Detect package manager"]
    Detect --> Setup["Node 20 and cache"]
    Setup --> Install["npm ci"]
    Install --> Build["npm run build"]
    Build --> Zip["Zip dist/public/package files"]
    Zip --> Artifact["Artifact retained one day"]
    Artifact --> FTP["Upload only deploy.zip by FTP"]
    FTP --> Webhook["Call remote unzip webhook"]
```

The workflow uses `FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD` secrets. It uploads to `makerspace_server/` and invokes a production unzip URL whose key is hard-coded in the workflow. There is no lint, test, vulnerability scan, migration, smoke test, health gate, or rollback stage.

The artifact excludes `node_modules` and `.env`. The target must provide Node 20, an external `.env`, production dependencies, a restart mechanism, reverse proxy configuration, and persistent media. Whether the unzip webhook runs `npm ci --omit=dev` and restarts the app cannot be proven from this repository.

## 6. CORS and network behavior

Runtime CORS permits no-Origin requests, localhost/127.0.0.1, hostnames ending in `ueh.edu.vn`, and hostnames containing `vercel.app`. Credentials are enabled and standard API methods are allowed. The `vercel.app` substring rule is broader than a suffix rule.

## 7. Deployment checklist

### Before deployment

- [ ] Use Node 20 and run `npm ci`, type-check, lint decision, build, and tests when introduced.
- [ ] Compare and back up VI/EN databases.
- [ ] Validate every environment value; reject source fallbacks.
- [ ] Verify `BASE_PATH`, protocol, domain, and email link origin.
- [ ] Ensure `public` exists and back up persistent uploads.
- [ ] Rotate the hard-coded webhook key and compromised credentials.
- [ ] Define an artifact/version rollback target.

### After deployment

- [ ] Check root health/ping/meta routes at the deployed path.
- [ ] Exercise one VI and one EN database endpoint via `?lang=`.
- [ ] Verify static URL rewrite and upload persistence.
- [ ] Verify password login, registration email, booking/quotation email, and XLSX export.
- [ ] Confirm restart policy, logs, DB pool usage, disk, SMTP, and 5xx monitoring.

## 8. Rollback gap

No rollback mechanism is encoded. Operations should retain the previous artifact and upload snapshot, preserve external environment configuration, record deployed versions, define cPanel process restart/switch commands, and manage database rollback separately because no migration framework exists.

