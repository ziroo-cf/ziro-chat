import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set, onChildAdded, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCL4wGrkYR3e48N0D4Dt7SRZaODyD0iUHM",
    authDomain: "ziro-chat.firebaseapp.com",
    databaseURL: "https://ziro-chat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ziro-chat",
    storageBucket: "ziro-chat.firebasestorage.app",
    messagingSenderId: "158348338963",
    appId: "1:158348338963:web:e5f99594e665679b361ce6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginModal = document.getElementById('login-modal');
const loginBtnModal = document.getElementById('login-btn-modal');
const sendBtn = document.getElementById('send-btn');
const menuButton = document.querySelector('.chat__header__menu-button');
const menuDropdown = document.querySelector('.chat__header__menu-dropdown');
const inputMessage = document.getElementById('input-message');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const logoutBtn = document.getElementById('logout-btn');

// Theme Toggle
const body = document.body;
const themeToggle = document.createElement('button');
themeToggle.textContent = '🌙';
themeToggle.classList.add('dark-button', 'p-2', 'bg-white', 'bg-opacity-10', 'rounded-full', 'hover:bg-opacity-20', 'transition-all');
document.querySelector('.chat__header').appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    themeToggle.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
});

// Login Functionality
loginBtnModal.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("User logged in:", result.user.displayName);
            loginModal.classList.add('hidden');
        })
        .catch((error) => {
            console.error("Error logging in:", error);
        });
});

// Logout Functionality
logoutBtn.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log("User signed out");
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
});

// Send Message
sendBtn.addEventListener('click', () => {
    const messageText = inputMessage.value.trim();
    if (messageText) {
        const user = auth.currentUser;
        if (user) {
            const newMessageRef = push(ref(db, "messages"));
            set(newMessageRef, {
                sender: user.displayName || "Anonymous",
                text: messageText,
                timestamp: Date.now(),
                photoURL: user.photoURL || "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295430_1280.png",
            })
            .then(() => {
                inputMessage.value = '';
            })
            .catch((error) => {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please try again.");
            });
        } else {
            alert("You must be logged in to send messages.");
        }
    }
});

// Render Messages
function renderMessage(messageData, messageId) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat__conversation-board__message-container');
    messageElement.setAttribute('data-message-id', messageId);

    if (messageData.sender === auth.currentUser?.displayName) {
        messageElement.classList.add('reversed');
    }

    const avatarUrl = messageData.photoURL || "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295430_1280.png";

    messageElement.innerHTML = `
        <div class="chat__conversation-board__message__person">
            <div class="chat__conversation-board__message__person__avatar">
                <img src="${avatarUrl}" alt="${messageData.sender}">
            </div>
            <span class="chat__conversation-board__message__person__nickname">${messageData.sender}</span>
        </div>
        <div class="chat__conversation-board__message__context">
            <div class="chat__conversation-board__message__bubble">
                <span>${messageData.text}</span>
                <span class="text-sm text-gray-400">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
                ${messageData.sender === auth.currentUser?.displayName ? `
                    <div class="message-actions">
                        <button onclick="deleteMessage('${messageId}')"><i class="fas fa-trash"></i></button>
                    </div>

                ` : ''}
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Listen for New Messages
onChildAdded(ref(db, "messages"), (snapshot) => {
    const messageData = snapshot.val();
    renderMessage(messageData, snapshot.key);
});

// Handle Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.displayName);
        loginModal.classList.add('hidden');
    } else {
        console.log("User logged out");
        loginModal.classList.remove('hidden');
    }
});

// Delete Message
window.deleteMessage = (messageId) => {
    if (confirm("Are you sure you want to delete this message?")) {
        remove(ref(db, `messages/${messageId}`));
    }
};

// Clear Chat
window.clearChat = () => {
    if (confirm("Are you sure you want to clear the chat?")) {
        remove(ref(db, "messages"));
    }
};

// Toggle Menu Dropdown
menuButton.addEventListener('click', () => {
    menuDropdown.style.display = menuDropdown.style.display === 'flex' ? 'none' : 'flex';
});

// Close Menu Dropdown on Click Outside
document.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
        menuDropdown.style.display = 'none';
    }
});

// Typing Indicator Logic
let typingTimeout;
inputMessage.addEventListener('input', () => {
    const user = auth.currentUser;
    if (user) {
        set(ref(db, `typing/${user.uid}`), true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            remove(ref(db, `typing/${user.uid}`));
        }, 1000);
    }
});

onValue(ref(db, 'typing'), (snapshot) => {
    const typingUsers = snapshot.val();
    if (typingUsers && Object.keys(typingUsers).length > 0) {
        typingIndicator.classList.remove('hidden');
    } else {
        typingIndicator.classList.add('hidden');
    }
});



onAuthStateChanged(auth, (user) => {
    if (user) {
        const userAvatar = document.getElementById('user-avatar');
        userAvatar.src = user.photoURL || "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295430_1280.png";
    } else {
        const userAvatar = document.getElementById('user-avatar');
        userAvatar.src = "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295430_1280.png";
    }
});

// Show Profile
function showProfile() {
    const profileModal = document.getElementById('profile-modal');
    profileModal.classList.remove('hidden');
}
function closeProfileModal() {
    const profileModal = document.getElementById('profile-modal');
    profileModal.classList.add('hidden');
}
function changeProfilePicture() {
    // You can open a file picker or use a predefined set of images.
    const newPic = prompt("Enter URL of new profile picture:");
    if (newPic) {
        document.getElementById("profile-pic").src = newPic;
    }
}
function editProfile() {
    // For simplicity, prompt for name or email and update profile
    const newName = prompt("Enter new name:");
    if (newName) {
        document.getElementById("profile-name").textContent = newName;
    }
}
