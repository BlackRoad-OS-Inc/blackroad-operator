import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

import config from '../config/appConfig.js';

const router = express.Router();
const AUDIO_PATTERN = /\.(wav|mp3|ogg|flac)$/i;

router.get('/clips', async (req, res, next) => {
  try {
    const directory = config.music.directory;
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && AUDIO_PATTERN.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    return res.json({ files });
  } catch (error) {
    req.log?.warn({ err: error }, 'failed to list music clips');
    return res.status(500).json({ error: 'Failed to list music clips', files: [] });
  }
});

router.get('/clips/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!AUDIO_PATTERN.test(filename)) {
      return res.status(400).json({ error: 'Unsupported media type requested' });
    }
    const filePath = path.resolve(config.music.directory, filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        req.log?.warn({ err }, 'failed to stream music clip');
        if (!res.headersSent) {
          res.status(err.statusCode || 500).end();
        }
      }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'unexpected error while streaming music clip');
    return next(error);
  }
});

export default router;
