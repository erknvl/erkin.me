// Secure OpenRouter integration using middleware API
class AIAssistant {
  constructor() {
      // Check if we're in local development or production
      const hostname = window.location.hostname;
      this.isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (this.isLocalDev) {
        // For local development, use the proxy endpoint
        this.endpoint = 'http://localhost:3000/api/openrouter';
        console.log('Using local development API endpoint');
      } else {
        // For production, use the Netlify function or direct OpenRouter endpoint
        this.endpoint = 'https://api.openrouter.ai/api/v1/chat/completions';
        console.log('Using production API endpoint');
      }
  }

  // Method to securely get the API key
  async getApiKey() {
    // In production, we should fetch this from a secure backend endpoint
    // that doesn't expose the key in client-side code
    try {
      const response = await fetch('/.netlify/functions/get-api-key');
      if (!response.ok) {
        throw new Error(`Failed to get API key: ${response.status}`);
      }
      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw new Error('Could not retrieve API key. Please try again later.');
    }
  }

  async generateResponse(prompt, context = '') {
    try {
      console.log('Sending request to:', this.endpoint);
      
      if (this.isLocalDev) {
        // Local development - use the proxy server
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            context: context
          }),
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API response error:', response.status, errorText);
          throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('API response received');
        return data.content;
      } else {
        // Production - direct API call to OpenRouter
        // Get API key from environment or from a secure source
        // For security, we should be using a backend proxy in production too
        // but this is a fallback if that's not set up
        const OPENROUTER_API_KEY = await this.getApiKey();
        
        const response = await fetch(this.endpoint, {
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
          const errorText = await response.text();
          console.error('OpenRouter API error:', response.status, errorText);
          throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('OpenRouter API response received');
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error in AI response generation:', error);
      throw error;
    }
  }
}

// Initialize the assistant (no API key needed in the frontend)
const assistant = new AIAssistant();

// Export the assistant for use in other files
window.assistant = assistant;
