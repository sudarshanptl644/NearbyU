import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// REPLACE these values with your actual keys from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCgS99rItSm41n0Wm7KRTP6_21ZlOrKkt0",
  authDomain: "my-nearbyu-project.firebaseapp.com",
  databaseURL: "https://my-nearbyu-project-default-rtdb.firebaseio.com/",
  projectId: "my-nearbyu-project",
  storageBucket: "my-nearbyu-project.firebasestorage.app",
  messagingSenderId: "991201699060",
  appId: "1:991201699060:web:c19a521f541a707902eaa1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
const db = getDatabase(app);

export { db };