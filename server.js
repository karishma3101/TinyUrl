require('dotenv').config();
const express = require('express');
const path = require('path');
const prisma = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
  });
});

// API routes
app.use('/api/links', require('./routes/api/links'));

// Frontend routes
app.get('/', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.render('dashboard', {
      links,
      appUrl: APP_URL,
    });
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).render('error', {
      message: 'Failed to load dashboard',
    });
  }
});

app.get('/stats/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).render('error', {
        message: 'Link not found',
      });
    }

    res.render('stats', {
      link,
      appUrl: APP_URL,
    });
  } catch (error) {
    console.error('Error rendering stats:', error);
    res.status(500).render('error', {
      message: 'Failed to load stats',
    });
  }
});

// Redirect route (must be last to avoid conflicts)
// This will only match paths that haven't been matched by previous routes
app.use('/', require('./routes/redirect'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: ${APP_URL}/healthz`);
  console.log(`📊 Dashboard: ${APP_URL}/`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

