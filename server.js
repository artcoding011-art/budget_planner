require('dotenv').config();
const express = require('express');
const path = require('path');
const dbHandler = require('./api/db.js');

const app = express();
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '/')));

// Proxy /api/db to the Vercel handler
app.all('/api/db', async (req, res) => {
  await dbHandler(req, res);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
