// frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDQdr0bFsBkobVovevggiJRv4qKVuWdME",
  authDomain: "my-ecommerce-project-9c988.firebaseapp.com",
  projectId: "my-ecommerce-project-9c988",
  storageBucket: "my-ecommerce-project-9c988.firebasestorage.app",
  messagingSenderId: "989147836362",
  appId: "1:989147836362:web:6c70786575de6866a72933",
  measurementId: "G-EDJM952R05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;



