# Quick Start Guide

## Prerequisites
- Node.js installed (v16+)
- A PostgreSQL database (Neon, Railway, or local)

## Step 1: Create .env File

Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL="your-postgresql-connection-string-here"
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
```

### Getting a Free PostgreSQL Database:

**Option 1: Neon (Recommended)**
1. Go to https://console.neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string from the dashboard
5. Paste it as `DATABASE_URL` in your `.env` file

**Option 2: Railway**
1. Go to https://railway.app
2. Sign up for free
3. Create a new project
4. Add a PostgreSQL service
5. Copy the connection string from service settings
6. Paste it as `DATABASE_URL` in your `.env` file

## Step 2: Run Database Migrations

After setting up your `.env` file with a valid `DATABASE_URL`, run:

```bash
npm run prisma:migrate
```

This will create the necessary database tables.

## Step 3: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

The server will start on `http://localhost:3000`

## Step 4: Access the Application

- **Dashboard**: http://localhost:3000
- **Health Check**: http://localhost:3000/healthz

## Troubleshooting

### "Database connection error"
- Make sure your `.env` file exists and has a valid `DATABASE_URL`
- Verify your database is accessible
- Check that you've run `npm run prisma:migrate`

### "Port already in use"
- Change the `PORT` in your `.env` file to a different port (e.g., 3001)
- Or stop the process using port 3000

### "Prisma Client not generated"
- Run: `npm run prisma:generate`

