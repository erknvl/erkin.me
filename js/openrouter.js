// Secure OpenRouter integration using Vercel serverless functions
class AIAssistant {
  constructor() {
    // Set up API endpoint based on environment
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Use Vercel serverless function in production
      this.endpoint = '/api/openrouter';
      console.log('Using Vercel serverless function endpoint');
    } else {
      // Use local development server in development
      this.endpoint = 'http://localhost:3000/api/openrouter';
      console.log('Using local development endpoint');
    }
    
    // Queue for functions to execute when API is ready
    this.readyQueue = [];
    this.isReady = false;
    
    // Check if API is available
    this.checkApiAvailability();
  }
  
  // Check if the API is available
  async checkApiAvailability() {
    try {
      // Simple health check to see if API is responding
      const response = await fetch(this.endpoint, {
        method: 'OPTIONS'
      });
      
      if (response.ok) {
        console.log('API is available');
        this.isReady = true;
        // Execute any queued functions
        this.processQueue();
      } else {
        console.warn('API not ready yet, will retry in 2 seconds');
        setTimeout(() => this.checkApiAvailability(), 2000);
      }
    } catch (error) {
      console.warn('API not available yet, will retry in 2 seconds', error);
      setTimeout(() => this.checkApiAvailability(), 2000);
    }
  }
  
  // Process any queued functions
  processQueue() {
    while (this.readyQueue.length > 0) {
      const { fn, resolve, reject } = this.readyQueue.shift();
      try {
        const result = fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }
  
  // Execute a function when API is ready
  whenReady(fn) {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        // API is already ready, execute immediately
        try {
          const result = fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      } else {
        // Queue the function for later execution
        this.readyQueue.push({ fn, resolve, reject });
      }
    });
  }

  // Generate a response using the OpenRouter API
  async generateResponse(prompt, context = '') {
    return this.whenReady(async () => {
      try {
        console.log('Sending request to:', this.endpoint);
        
        // Call to Vercel serverless function
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            context
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', response.status, errorData);
          throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('API response received');
        return data.content;
      } catch (error) {
        console.error('Error in AI response generation:', error);
        throw error;
      }
    });
  }
}

// Initialize the assistant (no API key needed in the frontend)
const assistant = new AIAssistant();

// Export the assistant for use in other files
window.assistant = assistant;
