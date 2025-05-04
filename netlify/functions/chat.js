// Netlify serverless function for OpenRouter API
const fetch = require('node-fetch');

// Get API key from environment variable
// You'll need to set this in your Netlify dashboard
// Go to Site settings > Build & deploy > Environment > Environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { prompt, context = '' } = JSON.parse(event.body);
    
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          { role: 'system', content: `You are an assistant for Erkin Ovlyagulyyev, a Flutter Developer. ${context}` },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('OpenRouter API error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error from OpenRouter API' })
      };
    }
    
    const data = await response.json();
    
    // Return the response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Allow CORS
      },
      body: JSON.stringify({ content: data.choices[0].message.content })
    };
  } catch (error) {
    console.log('Server error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
