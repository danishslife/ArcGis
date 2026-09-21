# ArcGIS fullstack app

Monorepo with a Vite + React client and an Express + MongoDB API.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string

## Setup

```bash
npm install
```

Copy environment files and fill in values:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

`client/.env` needs your ArcGIS API key (`VITE_ARCGIS_API_KEY`).  
`server/.env` requires `JWT_SECRET` (32+ characters) and defaults to `mongodb://127.0.0.1:27017/arcgis` if `MONGODB_URI` is omitted.

## Development

Run the client and API together:

```bash
npm run dev
```

- Client: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:5000

Or run them separately:

```bash
npm run dev:client
npm run dev:server
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | - | Service and database status |
| POST | `/api/auth/register` | - | Create an account `{ firstName, lastName, email, password }`, returns `{ token, user }` |
| POST | `/api/auth/login` | - | Sign in `{ email, password }`, returns `{ token, user }` |
| GET | `/api/auth/me` | Bearer | Current user |

Authenticated requests send the login/register token as `Authorization: Bearer <token>`.

## Production build

```bash
npm run build
npm start
```

Build output: `client/dist` (static) and `server/dist` (Node).
