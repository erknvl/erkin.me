// Text input handler for the website using OpenRouter API with streaming response
document.addEventListener('DOMContentLoaded', function() {
  const textInput = document.getElementById('textInput');
  const chatContainer = document.getElementById('chatContainer');
  
  // Chat history array to store conversation
  let chatHistory = [];
  
  // Check if OpenRouter assistant is available
  if (!window.assistant) {
    console.error('OpenRouter assistant not found. Make sure openrouter.js is loaded before this script.');
    return;
  }
  
  // Focus the input when the page loads
  setTimeout(() => {
    textInput.focus();
  }, 3000); // Wait for the typing animation to complete
  
  // Handle input events
  textInput.addEventListener('keydown', async function(event) {
    // If user presses Enter
    if (event.key === 'Enter') {
      const userInput = this.value.trim();
      if (!userInput) return;
      
      // Clear the input
      this.value = '';
      
      // Add user message to chat
      addMessageToChat('user', userInput);
      
      // Create a new message element for the assistant's response
      const assistantMessageContainer = createMessageElement('assistant', '');
      chatContainer.appendChild(assistantMessageContainer);
      
      // Add typing indicator to the assistant message
      assistantMessageContainer.classList.add('typing');
      
      try {
        // Get response from OpenRouter with streaming effect
        await streamResponse(userInput, assistantMessageContainer);
        
        // Save to chat history
        chatHistory.push({ role: 'user', content: userInput });
        chatHistory.push({ role: 'assistant', content: assistantMessageContainer.innerHTML });
      } catch (error) {
        console.error('Error getting response:', error);
        
        // Show detailed error message
        assistantMessageContainer.classList.remove('typing');
        assistantMessageContainer.textContent = `Error: ${error.message || 'Unknown error'}. Check console for details.`;
      }
    }
  });
  
  // Function to add a message to the chat
  function addMessageToChat(role, content) {
    const messageElement = createMessageElement(role, content);
    chatContainer.appendChild(messageElement);
    
    // Scroll to the bottom of the chat
    window.scrollTo(0, document.body.scrollHeight);
    return messageElement;
  }
  
  // Function to create a message element
  function createMessageElement(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    if (role === 'user') {
      messageDiv.innerHTML = `<div class="user-message">${content}</div>`;
    } else {
      messageDiv.className = 'chat-message assistant-message-container';
      messageDiv.innerHTML = `<div class="assistant-message">${content}</div>`;
    }
    
    return messageDiv;
  }
  
  // Function to sanitize HTML content
  function sanitizeHTML(html) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get all links and ensure they open in a new tab
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
    
    return tempDiv.innerHTML;
  }
  
  // Stream the response character by character
  async function streamResponse(userInput, messageContainer) {
    try {
      // Get the full response from OpenRouter
      const fullResponse = await getAIResponse(userInput);
      
      // Get the assistant message element within the container
      const assistantMessage = messageContainer.querySelector('.assistant-message');
      
      // Clear typing indicator
      messageContainer.classList.remove('typing');
      assistantMessage.innerHTML = '';
      
      // Stream the response character by character
      let i = 0;
      let currentHTML = '';
      const streamInterval = setInterval(() => {
        if (i < fullResponse.length) {
          currentHTML += fullResponse.charAt(i);
          i++;
          
          try {
            // Update the HTML content safely
            assistantMessage.innerHTML = sanitizeHTML(currentHTML);
            
            // Auto-scroll to bottom of the page
            window.scrollTo(0, document.body.scrollHeight);
          } catch (e) {
            console.error('Error parsing HTML:', e);
            // If there's an error parsing HTML, fall back to text content
            assistantMessage.textContent = currentHTML;
          }
        } else {
          clearInterval(streamInterval);
        }
      }, 20); // Adjust speed as needed
    } catch (error) {
      console.error('Error streaming response:', error);
      throw error;
    }
  }
  
  // Get response from OpenRouter
  async function getAIResponse(userInput) {
    // Context for the assistant
    const context = `
    You are a virtual assistant for Erkin Ovlyagulyyev, a Flutter Developer.
    Here's some information about Erkin:
    - He's a Flutter Developer working at Sputnik8
    - He lives in Istanbul, Turkey
    - He's 30 years old.
    - He knows Russian, Turkmen, English and some Turkish
    - His email is mail@erkin.me
    - His Telegram, Instagram, Github handles are @erknvl
    
    Keep responses concise and friendly. If you don't know something specific about Erkin, 
    be honest about it rather than making up information.
    Don't tell extra stuff, only tell whats asked for, don't add extra information.
    if asked for links, provide full urls.
    User can ask you about stack or about context, but nothing else.
    IMPORTANT: Keep your responses short and to the point.
    
  `;
    
    try {
      // Use the OpenRouter assistant to get a response
      return await window.assistant.generateResponse(userInput, context);
    } catch (error) {
      console.error('Error from OpenRouter:', error);
      throw error;
    }
  }
});
