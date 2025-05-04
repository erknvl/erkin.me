// Secure OpenRouter integration using middleware API
class AIAssistant {
  constructor() {
    // Detect environment and use appropriate endpoint
    if (window.location.protocol === 'file:' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      // Local development
      this.endpoint = 'http://localhost:3000/api/chat';
      console.log('Using local API endpoint:', this.endpoint);
    } else {
      // Production - Netlify serverless function
      this.endpoint = '/netlify/functions/chat';
      console.log('Using production API endpoint:', this.endpoint);
    }
  }

  async generateResponse(prompt, context = '') {
    try {
      console.log('Sending request to:', this.endpoint);
      
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          context: context
        }),
        // Add CORS mode for local development
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('API response received:', data);
      return data.content;
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
