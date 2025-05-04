// Netlify serverless function for OpenRouter API
const fetch = require('node-fetch');

// Get API key from environment variable
// You'll need to set this in your Netlify dashboard
// Go to Site settings > Build & deploy > Environment > Environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

exports.handler = async (event, context) => {
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body - handle both JSON and form data
    let prompt, context = '';
    
    // Check if the request is form data or JSON
    const contentType = event.headers['content-type'] || '';
    console.log('Content-Type:', contentType);
    
    if (contentType.includes('application/json')) {
      // Handle JSON data
      const parsedBody = JSON.parse(event.body);
      prompt = parsedBody.prompt;
      context = parsedBody.context || '';
      console.log('Parsed JSON body');
    } else if (contentType.includes('multipart/form-data')) {
      // Handle form data
      // Simple parsing for form data boundaries
      const formData = event.body.toString();
      console.log('Form data received:', formData.substring(0, 100) + '...');
      
      // Extract prompt from form data
      const promptMatch = formData.match(/name="prompt"[^\r\n]*\r\n([^\r\n]*)/i);
      prompt = promptMatch ? promptMatch[1] : null;
      
      // Extract context from form data
      const contextMatch = formData.match(/name="context"[^\r\n]*\r\n([^\r\n]*)/i);
      context = contextMatch ? contextMatch[1] : '';
      
      console.log('Parsed form data, prompt:', prompt);
    } else {
      // Try to parse as JSON as fallback
      try {
        const parsedBody = JSON.parse(event.body);
        prompt = parsedBody.prompt;
        context = parsedBody.context || '';
        console.log('Fallback: Parsed as JSON');
      } catch (e) {
        console.log('Could not parse body as JSON:', e);
      }
    }
    
    // Log the parsed data
    console.log('Parsed prompt:', prompt);
    console.log('Parsed context:', context ? context.substring(0, 50) + '...' : '');
    
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
        'Access-Control-Allow-Origin': '*', // Allow CORS
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
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
