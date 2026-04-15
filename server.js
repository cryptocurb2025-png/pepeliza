// $PEPELIZA Local Server
// Serves all HTML files + proxies Anthropic API (keeps key out of frontend)

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Serve static HTML files ──────────────────────────────────────────────
// Put all your HTML files in a /public folder next to this server.js
app.use(express.static(path.join(__dirname, 'public')));

// Routes for each page
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public/pepeliza.html')));
app.get('/manifesto', (req, res) => res.sendFile(path.join(__dirname, 'public/eliza_manifesto.html')));
app.get('/memegen',   (req, res) => res.sendFile(path.join(__dirname, 'public/eliza_memegen.html')));
app.get('/command',   (req, res) => res.sendFile(path.join(__dirname, 'public/eliza_command.html')));

// ── Anthropic API Proxy ──────────────────────────────────────────────────
// Frontend calls /api/claude instead of Anthropic directly
// This keeps your API key server-side only
app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: 'Agent connection failed' });
  }
});

// ── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    agent: 'eliza',
    network: 'ethereum',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  $PEPELIZA Protocol Server');
  console.log('  ─────────────────────────────────────');
  console.log(`  Main site:  http://localhost:${PORT}`);
  console.log(`  Manifesto:  http://localhost:${PORT}/manifesto`);
  console.log(`  Meme Gen:   http://localhost:${PORT}/memegen`);
  console.log(`  Command:    http://localhost:${PORT}/command`);
  console.log('  ─────────────────────────────────────');
  console.log('  Eliza agent: ONLINE');
  console.log('  feels good man 🐸');
  console.log('');
});
