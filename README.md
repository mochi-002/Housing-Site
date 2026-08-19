# Student Housing Finder — Backend

A RESTful backend for a student housing finder. Supports two user
roles — **Lister** and **Seeker** — with listings, interest requests,
messaging, favorites, and role-aware dashboard stats.

## Requirements

- [Node.js](https://nodejs.org/) 18 or later
- npm
- MongoDB (local or Atlas connection string)

## Installation

```bash
git clone https://github.com/mochi-002/Shaqty.git
cd Shaqty
npm install
```

Create a `.env` file in the project root:

```env
PORT=your-port
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
```

Run the server:

```bash
npm run dev     # development, with auto-reload
npm run build   # compile TypeScript to dist/
npm start       # run compiled build
```

API docs are served at `/api-docs` via Swagger once the server is running.
You can visit it now with [swagger-api-docs](https://shaqty-production.up.railway.app/api-docs/)

## Roles

| Role   | Can do                                                                             |
| ------ | ---------------------------------------------------------------------------------- |
| Lister | Create/update/delete listings, view interest requests, message Seekers             |
| Seeker | Browse/search listings, send interest requests, favorite listings, message Listers |

## API Overview

```txt
POST   /auth/register
POST   /auth/login

GET    /listings                     # Get all apartment listings, supports paginated, sortable, filterable
GET    /listings/:id                 # Get a single apartment
POST   /listings/:id/requests        # Send an interest request - a seeker shows interest in an apartment

POST   /listings/                    # Create a new apartment listing, listers only
PATCH  /listings/:id                 # Update an apartment, owner lister only
DELETE /listings/:id                 # Delete an apartment, owner lister only
GET    /listings/:id/requests        # Get interest requests for a listing, owner only

GET    /requests/mine                # Get interest requests, lister only
DELETE /requests/:requestId/delete   # Cancel an interest request, sender only
PATCH  /requests/:requestId/accept   # Accept an interest request, lister only
PATCH  /requests/:requestId/decline  # Decline an interest request, lister only

POST   /favorites/:listingId         # Save a listing to favorites
GET    /favorites/mine               # Get every listing the logged-in seeker has saved as favorite
DELET  /favorites/:listingId         # Remove a listing from favorites

POST   /messages                     # Send a message to another user
GET    /messages/mine                # Get my conversations
GET    /messages/:userId             # Get the full message thread

GET    /stats/me                     # role-aware stats — listers get their listings/requests
GET    /stats/overview               # role-aware stats, admin overview
```

### Listings query params

```txt
?page=1&limit=10&sort=price&order=asc&city=Cairo&minPrice=500&maxPrice=2000
```

Sorting is opt-in — omitting `sort` returns results in insertion order,
kept consistent across pages.

## Data models

### User

| Field       | Description            |
| ----------- | ---------------------- |
| `name`      | Full name              |
| `email`     | Unique, used for login |
| `password`  | Hashed with bcrypt     |
| `role`      | `lister` or `seeker`   |
| `createdAt` | ISO-8601 timestamp     |

### Listing

| Field         | Description                          |
| ------------- | ------------------------------------ |
| `title`       | Listing title                        |
| `description` | Full description                     |
| `price`       | Monthly rent                         |
| `city`        | Location                             |
| `owner`       | Reference to the Lister's User `_id` |
| `createdAt`   | ISO-8601 timestamp                   |
| `updatedAt`   | ISO-8601 timestamp                   |

### InterestRequest

| Field       | Description                            |
| ----------- | -------------------------------------- |
| `listing`   | Reference to Listing `_id`             |
| `seeker`    | Reference to the requesting User `_id` |
| `status`    | `pending`, `accepted`, or `rejected`   |
| `createdAt` | ISO-8601 timestamp                     |

### Message

| Field       | Description                         |
| ----------- | ----------------------------------- |
| `sender`    | Reference to sender's User `_id`    |
| `recipient` | Reference to recipient's User `_id` |
| `content`   | Message text                        |
| `createdAt` | ISO-8601 timestamp                  |

## Project structure

```txt
src/
├── models/           User, Listing, InterestRequest, Message
├── routers/          Route definitions per resource
├── controllers/      Request handlers / business logic
├── middlewares/      Auth, role guards, error handling
├── validators/       Joi schemas per resource
├── config/           DB connection, swagger.config.ts
├── server.ts         Express configuration
└── app.ts            Entry point

```

When adding a new feature, remember to update:

- `validators/<Resource>.validate.ts` — Joi schema
- `config/swagger.config.ts` — router registration

## Auth

JWT-based. Include the token on protected routes:

```txt
Authorization: Bearer <token>
```

## Testing

```bash
npm run build
npm test
```
