const express = require('express');
const router = express.Router();
const prisma = require('../../config/database');
const { isValidUrl, normalizeUrl } = require('../../utils/urlValidator');
const { generateShortCode, isValidShortCode } = require('../../utils/codeGenerator');

/**
 * POST /api/links
 * Create a new shortened link
 */
router.post('/', async (req, res) => {
  try {
    const { url, code } = req.body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL. Please provide a valid URL.',
      });
    }

    const normalizedUrl = normalizeUrl(url);
    let shortCode = code;

    // If custom code provided, validate it
    if (shortCode) {
      if (!isValidShortCode(shortCode)) {
        return res.status(400).json({
          error: 'Invalid short code. Code must be 6-8 alphanumeric characters.',
        });
      }

      // Check if code already exists
      const existingLink = await prisma.link.findUnique({
        where: { shortCode },
      });

      if (existingLink) {
        return res.status(409).json({
          error: 'Short code already exists. Please choose a different code.',
        });
      }
    } else {
      // Generate a unique code
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        shortCode = generateShortCode(7);
        const existing = await prisma.link.findUnique({
          where: { shortCode },
        });
        
        if (!existing) {
          break;
        }
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          error: 'Failed to generate a unique short code. Please try again.',
        });
      }
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        shortCode,
        targetUrl: normalizedUrl,
        totalClicks: 0,
      },
    });

    res.status(201).json({
      id: link.id,
      shortCode: link.shortCode,
      targetUrl: link.targetUrl,
      totalClicks: link.totalClicks,
      createdAt: link.createdAt,
    });
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/links
 * Get all links
 */
router.get('/', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/links/:code
 * Get stats for a specific link
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).json({
        error: 'Link not found',
      });
    }

    res.json({
      id: link.id,
      shortCode: link.shortCode,
      targetUrl: link.targetUrl,
      totalClicks: link.totalClicks,
      lastClickedTime: link.lastClickedTime,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching link stats:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/links/:code
 * Delete a link
 */
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).json({
        error: 'Link not found',
      });
    }

    await prisma.link.delete({
      where: { shortCode: code },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = router;

