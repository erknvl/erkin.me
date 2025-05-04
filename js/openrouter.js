// Secure OpenRouter integration using middleware API
class AIAssistant {
  constructor() {
      this.endpoint = 'https://api.openrouter.ai/api/v1/chat/completions';
      this.isLocalDev = false;
      console.log('Using production API endpoint');
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
        // You need to securely store your API key
        // This is just a placeholder - you should use a more secure method
        const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY'; // Replace with your secure method
        
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
