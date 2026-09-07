// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCFMNMuHMZto0aanUYwtxlOxZ6xdXxIGqo",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-operations-daily.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-operations-daily",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-operations-daily.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1073190128852",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1073190128852:web:84d7de8962dbc6de963f41",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YYEY8139LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export services so the rest of the app can use them
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;