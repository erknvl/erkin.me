// API Server for local development
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';

// Import the OpenRouter handler
import openrouterHandler from './api/openrouter.js';

// For loading .env files
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API endpoint
app.all('/api/openrouter', async (req, res) => {
  try {
    console.log('Received request:', req.method);
    
    // Handle OPTIONS requests for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Forward to the serverless function handler
    await openrouterHandler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/openrouter`);
});
