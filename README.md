# Zenvy Monorepo

Modern full-stack monorepo architecture using npm workspaces.

## Apps

- `client` → Frontend Application
- `server` → Backend API
- `admin` → Admin Dashboard

---

# Project Structure

```bash
Zenvy/
│
├── client/
├── server/
├── admin/
│
├── package.json
└── README.md
```

---

# Installation

Install all dependencies:

```bash
npm install
```

---

# Run Applications

## Run Entire Monorepo

```bash
npm run dev
```

## Run Client

```bash
npm run client
```

## Run Server

```bash
npm run server
```

## Run Admin

```bash
npm run admin
```

---

# Authentication

The client provides `/sign-in` and `/sign-up` pages. Authentication uses
HttpOnly access and refresh cookies; tokens are not stored in browser
JavaScript-accessible storage. The API rotates refresh tokens and stores only
their hashes in PostgreSQL.

Before using authentication for the first time, apply the auth schema to the
same PostgreSQL database used by the server:

```bash
psql "$DATABASE_URL" -f server/src/sql/auth.sql
```

Configure the server's `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, and
`ACCESS_TOKEN_MAX_AGE` environment variables. Use distinct, strong secrets;
`ACCESS_TOKEN_MAX_AGE` is in milliseconds. Production cookie delivery requires
HTTPS, and the configured frontend origin must match the server CORS settings.

Google sign-in/up buttons are demo placeholders and do not authenticate users
until OAuth is configured.

---

# Tech Stack

## Frontend

- React / Next.js
- TypeScript
- Tailwind CSS

## Backend

- Node.js
- Express.js
- TypeScript
- ES Modules

---

# Monorepo

This project uses:

- npm workspaces
- concurrently
- centralized dependency management

---

# Install Packages In Workspace

Example:

```bash
npm install axios --workspace=client
npm install express --workspace=server
```

---

# License

MIT
