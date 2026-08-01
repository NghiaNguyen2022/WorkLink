
## Environment loading update

Database and API commands load the monorepo root `.env` with `dotenv-cli`.
No `dotenv.config()` call or `DATABASE_URL` is used in migration/seed files.
