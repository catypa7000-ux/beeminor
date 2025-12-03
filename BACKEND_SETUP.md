# Backend Setup Guide

## Overview

The backend is now set up as a standalone server inside the `backend/` folder. It uses:
- **Hono** - Fast web framework
- **tRPC** - End-to-end typesafe APIs  
- **Bun** - Runtime and package manager

## Quick Start

### 1. Start the Backend Server

From the root directory:
```bash
bun run backend:dev    # Development mode with hot reload
# or
bun run backend:start  # Production mode
```

Or from the backend directory:
```bash
cd backend
bun run dev    # Development mode with hot reload
bun run start  # Production mode
```

The server will start on `http://localhost:3001` by default.

### 2. Configure Frontend (Optional)

The frontend will automatically use `http://localhost:3001` in development mode.

To use a different backend URL, create a `.env` file in the root directory:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3001
```

For production, you must set `EXPO_PUBLIC_RORK_API_BASE_URL` to your production API URL.

### 3. Verify Backend is Running

Check the health endpoint:
```bash
curl http://localhost:3001/
```

You should see:
```json
{"status":"ok","message":"API is running"}
```

## Project Structure

```
backend/
├── index.ts              # Server entry point
├── hono.ts               # Hono app configuration  
├── package.json          # Backend dependencies
├── tsconfig.json         # TypeScript config
├── README.md             # Backend documentation
└── trpc/
    ├── app-router.ts     # Main tRPC router
    ├── create-context.ts # tRPC context creation
    └── routes/           # tRPC route definitions
        └── example/
            └── hi/
                └── route.ts
```

## Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=3001
HOST=0.0.0.0
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3001
```

## API Endpoints

- **Health Check**: `GET /` - Returns API status
- **tRPC Endpoint**: `/api/trpc/*` - All tRPC procedures

## Adding New Routes

1. Create a route file in `backend/trpc/routes/`
2. Export a tRPC procedure
3. Add it to `backend/trpc/app-router.ts`

Example:
```typescript
// backend/trpc/routes/users/get.ts
import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

export const getUser = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    return { id: input.id, name: "John Doe" };
  });
```

Then add to router:
```typescript
// backend/trpc/app-router.ts
import { getUser } from "./routes/users/get";

export const appRouter = createTRPCRouter({
  users: createTRPCRouter({
    get: getUser,
  }),
});
```

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

**Terminal 1 - Backend:**
```bash
bun run backend:dev
```

**Terminal 2 - Frontend:**
```bash
bun run start-web
```

### Option 2: Using a Process Manager

You can use tools like `concurrently` or `foreman` to run both at once.

## Development

- The backend supports hot reload - just save your files
- Check the console for any errors
- The server logs will show the API endpoints on startup

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change the PORT in your `.env` file:
```env
PORT=3002
```

Don't forget to update the frontend URL as well.

### CORS Issues
CORS is already enabled in `backend/hono.ts`. If you encounter issues, check the CORS configuration.

### Backend Not Starting
1. Make sure Bun is installed: `bun --version`
2. Check if dependencies are installed: `bun install`
3. Check for TypeScript errors: `bun run backend:typecheck` (if script exists)

