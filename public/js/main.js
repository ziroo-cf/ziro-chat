// Main entry point
import { AuthManager } from './auth.js';
import { UIManager } from './ui.js';
import { ChatManager } from './chat.js';

class ZiroChat {
    static init() {
        try {
            // Initialize UI
            UIManager.init();
            
            // Initialize authentication
            AuthManager.init();
            
            console.log('Ziro Chat initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Ziro Chat:', error);
            alert('Failed to initialize the application. Please refresh the page.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ZiroChat.init();
});

// Export for debugging
window.ZiroChat = ZiroChat;