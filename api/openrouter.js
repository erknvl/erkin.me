// OpenRouter API Serverless Function for Vercel
import fetch from 'node-fetch';

// This function will be automatically exposed as /api/openrouter
export default async function handler(req, res) {
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
    // Debug request body
    console.log('Request body:', JSON.stringify(req.body));
    
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Get API key from environment variables
    // In Vercel, this will be set in the project settings
    // For local development, it's loaded from .env file
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    // Debug environment variables (don't log full key in production)
    console.log('API Key available:', !!OPENROUTER_API_KEY);
    console.log('API Key prefix:', OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 10) + '...' : 'undefined');
    console.log('Environment:', process.env.NODE_ENV);
    
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured', 
        message: 'Please set the OPENROUTER_API_KEY environment variable in your Vercel project settings' 
      });
    }
    
    // Call OpenRouter API
    console.log('Calling OpenRouter API...');
    try {
      const requestBody = {
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [
          { role: 'system', content: `You are an assistant for Erkin Ovlyagulyyev, a Flutter Developer. ${context || ''}` },
          { role: 'user', content: prompt }
        ]
      };
      
      console.log('Request payload:', JSON.stringify(requestBody));
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://erkin.me',
          'X-Title': 'Erkin\'s Personal Website'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('OpenRouter API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: 'Error from OpenRouter API',
          details: errorText
        });
      }
      
      // Process successful response
      const data = await response.json();
      console.log('OpenRouter API response received:', JSON.stringify(data).substring(0, 100) + '...');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected API response format:', JSON.stringify(data));
        return res.status(500).json({ 
          error: 'Unexpected API response format',
          details: 'The API response did not contain the expected data structure'
        });
      }
      
      return res.json({ content: data.choices[0].message.content });
    } catch (apiError) {
      console.error('Error calling OpenRouter API:', apiError);
      return res.status(500).json({ 
        error: 'Error calling OpenRouter API', 
        message: apiError.message 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
