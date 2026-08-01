# Environment setup

WorkLink keeps one `.env` file at the monorepo root.

```text
WorkLink/.env
```

Create it from the template:

```powershell
Copy-Item .env.example .env -Force
```

Database commands use `dotenv-cli`, so the root file is loaded before Node starts:

```powershell
pnpm --filter @worklink/api db:migrate
pnpm --filter @worklink/api db:seed
pnpm --filter @worklink/api dev
```

Quick environment test:

```powershell
cd apps/api
pnpm exec dotenv -e ../../.env -- node -e "console.log(process.env.DB_HOST, process.env.DB_NAME, process.env.DB_USER)"
```
