// Utility functions
export class Utils {
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    static formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    static formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    static getRandomColor() {
        const colors = [
            '#8147fc', '#ff4352', '#10b981', '#3b82f6', 
            '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static generateAvatar(name) {
        const colors = [
            '#8147fc', '#ff4352', '#10b981', '#3b82f6', 
            '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
        ];
        const color = colors[name.charCodeAt(0) % colors.length];
        
        // Create a simple SVG avatar with initials
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">${initials}</text></svg>`;
    }
}