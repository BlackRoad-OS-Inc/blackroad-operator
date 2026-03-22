const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'blackroad-os-pack-creator-studio'
  });
});

module.exports = router;
