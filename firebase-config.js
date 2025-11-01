// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI9Wr55fvlpxmMHLHcwNc4TTx5poOtads",
  authDomain: "mylead-aa887.firebaseapp.com",
  projectId: "mylead-aa887",
  storageBucket: "mylead-aa887.firebasestorage.app",
  messagingSenderId: "22819384793",
  appId: "1:22819384793:web:1aefe5a2ab8339db58bdc8",
  measurementId: "G-M8FVKJM8GL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

//Initialize Cloud Firestore and get a reference to the server
export const db = getFirestore(app);