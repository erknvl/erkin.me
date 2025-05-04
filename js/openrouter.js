// Secure OpenRouter integration using middleware API
class AIAssistant {
  constructor() {
      // Always use the direct OpenRouter API endpoint
      this.endpoint = 'https://api.openrouter.ai/api/v1/chat/completions';
      console.log('Using production API endpoint');
      
      // We'll load the API key from a config file that will be populated during build
      this.apiKey = null;
      this.loadConfig();
  }
  
  // Load configuration from config.js file that will be generated during build
  async loadConfig() {
    try {
      // Wait for the config to be loaded
      if (typeof window.ENV_CONFIG === 'undefined') {
        // Wait for config script to load
        await new Promise(resolve => {
          const checkConfig = () => {
            if (typeof window.ENV_CONFIG !== 'undefined') {
              resolve();
            } else {
              setTimeout(checkConfig, 100);
            }
          };
          checkConfig();
        });
      }
      
      // Get API key from config
      this.apiKey = window.ENV_CONFIG.OPENROUTER_API_KEY;
      if (!this.apiKey) {
        console.error('API key not found in configuration');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  }

  async generateResponse(prompt, context = '') {
    try {
      // Make sure the API key is loaded before proceeding
      if (!this.apiKey) {
        // Wait for config to load if it hasn't already
        await new Promise(resolve => {
          const checkApiKey = () => {
            if (this.apiKey) {
              resolve();
            } else {
              console.log('Waiting for API key to load...');
              setTimeout(checkApiKey, 100);
            }
          };
          checkApiKey();
        });
      }
      
      console.log('Sending request to:', this.endpoint);
      
      // Direct API call to OpenRouter with API key
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
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
