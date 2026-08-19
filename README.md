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

## Roles

<div align="center">
  <table width="100%">
    <thead>
      <tr>
        <th align="center">Role</th>
        <th align="center">Can do</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center"><strong>Lister</strong></td>
        <td align="center">Create/update/delete listings, view interest requests, message Seekers</td>
      </tr>
      <tr>
        <td align="center"><strong>Seeker</strong></td>
        <td align="center">Browse/search listings, send interest requests, favorite listings, message Listers</td>
      </tr>
    </tbody>
  </table>
</div>

## Data model

### User

<div align="center">
  <table width="100%">
    <thead>
      <tr>
        <th align="center">Field</th>
        <th align="center">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center"><code>name</code></td>
        <td align="center">Full name</td>
      </tr>
      <tr>
        <td align="center"><code>email</code></td>
        <td align="center">Unique, used for login</td>
      </tr>
      <tr>
        <td align="center"><code>password</code></td>
        <td align="center">Hashed with bcrypt</td>
      </tr>
      <tr>
        <td align="center"><code>role</code></td>
        <td align="center"><code>lister</code> or <code>seeker</code></td>
      </tr>
      <tr>
        <td align="center"><code>createdAt</code></td>
        <td align="center">ISO-8601 timestamp</td>
      </tr>
    </tbody>
  </table>
</div>

### Listing

<div align="center">
  <table width="100%">
    <thead>
      <tr>
        <th align="center">Field</th>
        <th align="center">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center"><code>title</code></td>
        <td align="center">Listing title</td>
      </tr>
      <tr>
        <td align="center"><code>description</code></td>
        <td align="center">Full description</td>
      </tr>
      <tr>
        <td align="center"><code>price</code></td>
        <td align="center">Monthly rent</td>
      </tr>
      <tr>
        <td align="center"><code>city</code></td>
        <td align="center">Location</td>
      </tr>
      <tr>
        <td align="center"><code>owner</code></td>
        <td align="center">Reference to the Lister's User <code>_id</code></td>
      </tr>
      <tr>
        <td align="center"><code>createdAt</code></td>
        <td align="center">ISO-8601 timestamp</td>
      </tr>
      <tr>
        <td align="center"><code>updatedAt</code></td>
        <td align="center">ISO-8601 timestamp</td>
      </tr>
    </tbody>
  </table>
</div>

### InterestRequest

<div align="center">
  <table width="100%">
    <thead>
      <tr>
        <th align="center">Field</th>
        <th align="center">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center"><code>listing</code></td>
        <td align="center">Reference to Listing <code>_id</code></td>
      </tr>
      <tr>
        <td align="center"><code>seeker</code></td>
        <td align="center">Reference to the requesting User <code>_id</code></td>
      </tr>
      <tr>
        <td align="center"><code>status</code></td>
        <td align="center"><code>pending</code>, <code>accepted</code>, or <code>rejected</code></td>
      </tr>
      <tr>
        <td align="center"><code>createdAt</code></td>
        <td align="center">ISO-8601 timestamp</td>
      </tr>
    </tbody>
  </table>
</div>

### Message

<div align="center">
  <table width="100%">
    <thead>
      <tr>
        <th align="center">Field</th>
        <th align="center">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center"><code>sender</code></td>
        <td align="center">Reference to sender's User <code>_id</code></td>
      </tr>
      <tr>
        <td align="center"><code>recipient</code></td>
        <td align="center">Reference to recipient's User <code>_id</code></td>
      </tr>
      <tr>
        <td align="center"><code>content</code></td>
        <td align="center">Message text</td>
      </tr>
      <tr>
        <td align="center"><code>createdAt</code></td>
        <td align="center">ISO-8601 timestamp</td>
      </tr>
    </tbody>
  </table>
</div>

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
