// Local development server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const openrouterHandler = require('./api/openrouter');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// API endpoint
app.all('/api/openrouter', async (req, res) => {
  try {
    // Handle OPTIONS requests for CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      return res.status(200).end();
    }
    
    // Forward to the serverless function handler
    await openrouterHandler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/openrouter`);
});
