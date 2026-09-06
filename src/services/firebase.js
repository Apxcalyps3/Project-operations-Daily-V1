// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCFMNMuHMZto0aanUYwtxlOxZ6xdXxIGqo",
    authDomain: "project-operations-daily.firebaseapp.com",
    projectId: "project-operations-daily",
    storageBucket: "project-operations-daily.firebasestorage.app",
    messagingSenderId: "1073190128852",
    appId: "1:1073190128852:web:84d7de8962dbc6de963f41",
    measurementId: "G-YYEY8139LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export services so the rest of the app can use them
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;