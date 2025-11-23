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

    // Ensure targetUrl is absolute (starts with http:// or https://)
    let redirectUrl = link.targetUrl.trim();
    
    // Log the redirect for debugging
    console.log(`[REDIRECT DEBUG] Code: ${code}`);
    console.log(`[REDIRECT DEBUG] targetUrl from DB: "${redirectUrl}"`);
    console.log(`[REDIRECT DEBUG] targetUrl length: ${redirectUrl.length}`);
    console.log(`[REDIRECT DEBUG] Starts with http: ${redirectUrl.startsWith('http://')}`);
    console.log(`[REDIRECT DEBUG] Starts with https: ${redirectUrl.startsWith('https://')}`);
    
    // If it doesn't start with http:// or https://, it's invalid
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      console.error(`[REDIRECT ERROR] Invalid targetUrl for code ${code}: "${redirectUrl}"`);
      console.error(`[REDIRECT ERROR] Full link object:`, JSON.stringify(link, null, 2));
      return res.status(500).json({
        error: 'Invalid target URL configuration',
        details: `Target URL must start with http:// or https://. Got: "${redirectUrl}"`,
      });
    }

    // Redirect to target URL (use 302 for temporary redirect)
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('[REDIRECT ERROR] Error redirecting:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = router;
