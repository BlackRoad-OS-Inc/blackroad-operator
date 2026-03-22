const express = require('express');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/health', healthRouter);

app.get('/', (req, res) => {
  res.json({
    service: 'blackroad-os-pack-research-lab',
    message: 'Welcome to BlackRoad OS Pack Research Lab'
  });
});

app.listen(PORT, () => {
  console.log(`blackroad-os-pack-research-lab running on port ${PORT}`);
});
