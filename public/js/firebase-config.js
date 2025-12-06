// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();