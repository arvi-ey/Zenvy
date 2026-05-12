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
