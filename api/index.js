// API Router for Vercel Serverless Functions
import openrouterHandler from './openrouter.js';

// This is the main entry point for all API routes
export default async function handler(req, res) {
  // Extract the path from the URL
  const path = req.url.split('/api/')[1]?.split('?')[0] || '';
  
  // Route to the appropriate handler based on the path
  if (path === 'openrouter' || path === '') {
    return openrouterHandler(req, res);
  }
  
  // Handle 404 for unknown routes
  return res.status(404).json({ error: 'API route not found' });
}
