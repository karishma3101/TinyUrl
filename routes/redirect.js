const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

/**
 * GET /:code
 * Redirect to the target URL and track clicks
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Exclude reserved paths
    const reservedPaths = ['api', 'stats', 'healthz', 'favicon.ico'];
    if (reservedPaths.includes(code.toLowerCase())) {
      return res.status(404).json({
        error: 'Link not found',
      });
    }

    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).json({
        error: 'Link not found',
      });
    }

    // Update click count and last clicked time
    await prisma.link.update({
      where: { shortCode: code },
      data: {
        totalClicks: {
          increment: 1,
        },
        lastClickedTime: new Date(),
      },
    });

    // Redirect to target URL
    res.redirect(302, link.targetUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = router;

