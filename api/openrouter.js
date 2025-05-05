// OpenRouter API Serverless Function for Vercel
const fetch = require('node-fetch');

// This function will be automatically exposed as /api/openrouter
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Get API key from environment variables
    // In Vercel, this will be set in the project settings
    // For local development, it's loaded from .env file
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured', 
        message: 'Please set the OPENROUTER_API_KEY environment variable in your Vercel project settings' 
      });
    }
    
    // Call OpenRouter API
    const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://erkin.me',
        'X-Title': 'Erkin\'s Personal Website'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [
          { role: 'system', content: `You are an assistant for Erkin Ovlyagulyyev, a Flutter Developer. ${context || ''}` },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Error from OpenRouter API',
        details: errorText
      });
    }
    
    const data = await response.json();
    return res.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
