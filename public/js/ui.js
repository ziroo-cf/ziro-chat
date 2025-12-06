import { Utils } from './utils.js';

export class UIManager {
    static init() {
        this.bindEvents();
        this.setupTheme();
        this.setupUserMenu();
    }

    static bindEvents() {
        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Profile modal
        document.getElementById('profile-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfileModal();
        });
        
        document.getElementById('close-profile-btn')?.addEventListener('click', () => {
            this.hideProfileModal();
        });
        
        document.getElementById('cancel-profile-btn')?.addEventListener('click', () => {
            this.hideProfileModal();
        });
        
        document.getElementById('save-profile-btn')?.addEventListener('click', () => {
            this.saveProfile();
        });
        
        // Attach button
        document.getElementById('attach-btn')?.addEventListener('click', () => {
            this.handleAttachment();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('dropdown-menu').classList.remove('show');
            }
        });
    }

    static toggleTheme() {
        const body = document.body;
        body.classList.toggle('light');
        body.classList.toggle('dark');
        
        const icon = document.querySelector('.theme-toggle i');
        if (body.classList.contains('light')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    }

    static setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
            document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    static setupUserMenu() {
        const userAvatar = document.getElementById('user-avatar');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        userAvatar?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
    }

    static showModal(modalId) {
        document.getElementById(modalId)?.classList.add('show');
    }

    static hideModal(modalId) {
        document.getElementById(modalId)?.classList.remove('show');
    }

    static showProfileModal() {
        this.showModal('profile-modal');
        document.getElementById('dropdown-menu').classList.remove('show');
    }

    static hideProfileModal() {
        this.hideModal('profile-modal');
    }

    static updateUserInfo(user) {
        const avatarUrl = user.photoURL || Utils.generateAvatar(user.displayName || "Anonymous");
        
        // Update header avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.src = avatarUrl;
        }
        
        // Update profile modal
        const profileAvatar = document.getElementById('profile-avatar');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const displayNameInput = document.getElementById('display-name-input');
        
        if (profileAvatar) profileAvatar.src = avatarUrl;
        if (profileName) profileName.textContent = user.displayName || "Guest User";
        if (profileEmail) profileEmail.textContent = user.email || "guest@example.com";
        if (displayNameInput) displayNameInput.value = user.displayName || "";
        
        // Set joined date
        const joinedDate = document.getElementById('joined-date');
        if (joinedDate && user.metadata?.creationTime) {
            const joinDate = new Date(user.metadata.creationTime);
            joinedDate.textContent = Utils.formatDate(joinDate);
        }
    }

    static saveProfile() {
        const displayName = document.getElementById('display-name-input').value.trim();
        const about = document.getElementById('about-input').value.trim();
        
        if (!displayName) {
            Utils.showToast('Display name is required', 'error');
            return;
        }
        
        // In a real app, you would update the user's profile in Firebase
        // For now, we'll just update the UI
        document.getElementById('profile-name').textContent = displayName;
        
        if (about) {
            // Save about text (in a real app, save to database)
        }
        
        Utils.showToast('Profile updated successfully!', 'success');
        this.hideProfileModal();
    }

    static handleAttachment() {
        // In a real app, this would handle file uploads
        Utils.showToast('File attachment feature coming soon!', 'info');
    }

    static showTypingIndicator(userName) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.querySelector('span').textContent = `${userName} is typing...`;
            typingIndicator.classList.remove('hidden');
        }
    }

    static hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
    }

    static showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
    }

    static hideEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    static updateMessageCount(count) {
        const countElement = document.getElementById('messages-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }
}