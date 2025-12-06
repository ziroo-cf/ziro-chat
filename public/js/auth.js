import { auth, provider, db } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { Utils } from './utils.js';
import { ChatManager } from './chat.js';
import { UIManager } from './ui.js';

export class AuthManager {
    static init() {
        this.bindEvents();
        this.listenForAuthChanges();
    }

    static bindEvents() {
        document.getElementById('google-login-btn').addEventListener('click', () => this.login());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }

    static login() {
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("User logged in:", result.user.displayName);
                UIManager.hideModal('login-modal');
                Utils.showToast('Successfully logged in!', 'success');
            })
            .catch((error) => {
                console.error("Error logging in:", error);
                Utils.showToast('Failed to login. Please try again.', 'error');
            });
    }

    static logout() {
        signOut(auth)
            .then(() => {
                console.log("User signed out");
                UIManager.showModal('login-modal');
                Utils.showToast('Logged out successfully', 'success');
            })
            .catch((error) => {
                console.error("Error signing out:", error);
                Utils.showToast('Failed to logout', 'error');
            });
    }

    static listenForAuthChanges() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.handleUserLogin(user);
            } else {
                this.handleUserLogout();
            }
        });
    }

    static handleUserLogin(user) {
        console.log("User logged in:", user.displayName);
        
        // Update UI
        UIManager.updateUserInfo(user);
        UIManager.hideModal('login-modal');
        
        // Initialize chat for this user
        ChatManager.init(user);
        
        // Track user activity
        this.trackUserActivity(user);
        
        // Count user messages
        this.countUserMessages(user.uid);
    }

    static handleUserLogout() {
        console.log("User logged out");
        UIManager.showModal('login-modal');
        ChatManager.cleanup();
    }

    static trackUserActivity(user) {
        const userRef = ref(db, `users/${user.uid}`);
        set(userRef, {
            name: user.displayName,
            email: user.email,
            lastActive: Date.now(),
            photoURL: user.photoURL
        });
    }

    static countUserMessages(uid) {
        onValue(ref(db, "messages"), (snapshot) => {
            let count = 0;
            snapshot.forEach((child) => {
                if (child.val().uid === uid) {
                    count++;
                }
            });
            document.getElementById('messages-count').textContent = count;
        });
    }

    static getUser() {
        return auth.currentUser;
    }
}