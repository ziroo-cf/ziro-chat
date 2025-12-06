import { db, auth } from './firebase-config.js';
import { ref, set, onChildAdded, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { Utils } from './utils.js';
import { UIManager } from './ui.js';

export class ChatManager {
    static currentUser = null;
    static typingTimeout = null;
    static messagesRef = null;

    static init(user) {
        this.currentUser = user;
        this.messagesRef = ref(db, "messages");
        
        this.bindEvents();
        this.listenForMessages();
        this.listenForTyping();
        this.loadPreviousMessages();
    }

    static bindEvents() {
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        const clearChatBtn = document.getElementById('clear-chat-btn');

        sendBtn.addEventListener('click', () => this.sendMessage());
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            sendBtn.disabled = messageInput.value.trim() === '';
            this.updateTypingStatus();
        });

        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }
    }

    static sendMessage() {
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();
        
        if (!messageText) return;
        
        const user = this.currentUser || auth.currentUser;
        if (!user) {
            Utils.showToast('You must be logged in to send messages.', 'error');
            return;
        }

        const newMessageRef = push(this.messagesRef);
        const messageData = {
            sender: user.displayName || "Anonymous",
            text: Utils.sanitizeInput(messageText),
            timestamp: Date.now(),
            photoURL: user.photoURL || Utils.generateAvatar(user.displayName || "Anonymous"),
            uid: user.uid,
            edited: false
        };

        set(newMessageRef, messageData)
            .then(() => {
                messageInput.value = '';
                messageInput.focus();
                document.getElementById('send-btn').disabled = true;
                
                // Clear typing status
                this.clearTypingStatus();
            })
            .catch((error) => {
                console.error("Error sending message:", error);
                Utils.showToast('Failed to send message. Please try again.', 'error');
            });
    }

    static renderMessage(messageData, messageId) {
        const user = this.currentUser || auth.currentUser;
        const isCurrentUser = user && messageData.uid === user.uid;
        
        UIManager.hideEmptyState();
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isCurrentUser ? 'sent' : 'received');
        messageElement.setAttribute('data-message-id', messageId);
        
        const avatarUrl = messageData.photoURL || Utils.generateAvatar(messageData.sender);
        const displayName = messageData.sender || "Anonymous";
        const timestamp = Utils.formatTime(messageData.timestamp);
        const editedBadge = messageData.edited ? '<span class="message-status" title="Edited"><i class="fas fa-edit"></i></span>' : '';
        
        messageElement.innerHTML = `
            <img src="${avatarUrl}" alt="${displayName}" class="message-avatar" 
                 onerror="this.src='https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295430_1280.png'">
            <div class="message-content">
                <div class="message-bubble">
                    ${messageData.text}
                    <div class="message-actions">
                        ${isCurrentUser ? `
                            <button class="message-action-btn edit" title="Edit" onclick="ChatManager.editMessage('${messageId}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="message-action-btn" title="Delete" onclick="ChatManager.deleteMessage('${messageId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="message-info">
                    <span>${displayName}</span>
                    <span>•</span>
                    <span>${timestamp}</span>
                    ${editedBadge}
                </div>
            </div>
        `;
        
        const messagesContainer = document.getElementById('messages');
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    static deleteMessage(messageId) {
        if (confirm("Are you sure you want to delete this message?")) {
            remove(ref(db, `messages/${messageId}`))
                .then(() => {
                    Utils.showToast('Message deleted', 'success');
                })
                .catch((error) => {
                    console.error("Error deleting message:", error);
                    Utils.showToast('Failed to delete message', 'error');
                });
        }
    }

    static editMessage(messageId) {
        const messageRef = ref(db, `messages/${messageId}`);
        const newText = prompt("Edit your message:");
        
        if (newText !== null && newText.trim() !== '') {
            update(messageRef, {
                text: Utils.sanitizeInput(newText.trim()),
                edited: true
            })
            .then(() => {
                Utils.showToast('Message updated', 'success');
            })
            .catch((error) => {
                console.error("Error editing message:", error);
                Utils.showToast('Failed to edit message', 'error');
            });
        }
    }

    static clearChat() {
        if (confirm("Are you sure you want to clear all messages? This action cannot be undone.")) {
            remove(this.messagesRef)
                .then(() => {
                    document.getElementById('messages').innerHTML = '';
                    UIManager.showEmptyState();
                    Utils.showToast('Chat cleared', 'success');
                })
                .catch((error) => {
                    console.error("Error clearing chat:", error);
                    Utils.showToast('Failed to clear chat', 'error');
                });
        }
    }

    static listenForMessages() {
        onChildAdded(this.messagesRef, (snapshot) => {
            const messageData = snapshot.val();
            this.renderMessage(messageData, snapshot.key);
        });
    }

    static loadPreviousMessages() {
        onValue(this.messagesRef, (snapshot) => {
            if (!snapshot.exists()) {
                UIManager.showEmptyState();
            }
        });
    }

    static updateTypingStatus() {
        const user = this.currentUser || auth.currentUser;
        if (!user) return;

        const typingRef = ref(db, `typing/${user.uid}`);
        
        set(typingRef, {
            name: user.displayName || "Someone",
            timestamp: Date.now()
        });
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            remove(typingRef);
        }, 1000);
    }

    static clearTypingStatus() {
        const user = this.currentUser || auth.currentUser;
        if (!user) return;

        remove(ref(db, `typing/${user.uid}`));
    }

    static listenForTyping() {
        onValue(ref(db, 'typing'), (snapshot) => {
            const typingUsers = snapshot.val();
            if (typingUsers && Object.keys(typingUsers).length > 0) {
                // Get the most recent typer (excluding current user)
                let mostRecent = null;
                let mostRecentTime = 0;
                
                for (const uid in typingUsers) {
                    if (uid !== (this.currentUser?.uid || auth.currentUser?.uid) && 
                        typingUsers[uid].timestamp > mostRecentTime) {
                        mostRecent = typingUsers[uid];
                        mostRecentTime = typingUsers[uid].timestamp;
                    }
                }
                
                // Only show if the typing was recent (within 2 seconds)
                if (mostRecent && Date.now() - mostRecentTime < 2000) {
                    UIManager.showTypingIndicator(mostRecent.name);
                } else {
                    UIManager.hideTypingIndicator();
                }
            } else {
                UIManager.hideTypingIndicator();
            }
        });
    }

    static cleanup() {
        if (this.messagesRef) {
            // Clean up listeners if needed
        }
        this.currentUser = null;
    }
}

// Make ChatManager methods available globally
window.ChatManager = ChatManager;